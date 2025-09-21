import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Edit3, Check, X, Move, Trash2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ScheduleBlock } from '../../services/scheduleAI';

interface EnhancedScheduleTimelineProps {
  blocks: ScheduleBlock[];
  onBlockUpdate: (blockId: string, updates: Partial<ScheduleBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

interface LayoutEvent {
  id: string;
  title: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
  type: ScheduleBlock['type'];
  originalBlock: ScheduleBlock;
  lane: number;
  laneCount: number;
  top: number;
  height: number;
}

const SNAP_MINUTES = 5;
const HOUR_HEIGHT = 60; // pixels per hour
const MIN_EVENT_HEIGHT = 20; // minimum height for events
const LANE_GUTTER = 8; // pixels between lanes

export const EnhancedScheduleTimeline: React.FC<EnhancedScheduleTimelineProps> = ({
  blocks,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  className,
}) => {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Convert time string to minutes from 00:00
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Convert minutes to time string
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, []);

  // Snap to 5-minute increments
  const snapToGrid = useCallback((minutes: number): number => {
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  }, []);

  // Layout algorithm for collision detection and lane assignment
  const layoutEvents = useCallback((events: ScheduleBlock[]): LayoutEvent[] => {
    if (events.length === 0) return [];

    // Convert blocks to layout events
    const layoutEvents: LayoutEvent[] = events.map(block => {
      let start = timeToMinutes(block.startTime);
      let end = timeToMinutes(block.endTime);
      
      // Handle cross-midnight times
      if (end < start) {
        end += 1440; // Add 24 hours
      }
      
      // Ensure minimum duration
      if (end - start < 5) {
        end = start + 5;
      }

      return {
        id: block.id,
        title: block.title,
        start,
        end,
        type: block.type,
        originalBlock: block,
        lane: 0,
        laneCount: 1,
        top: (start / 1440) * 24 * HOUR_HEIGHT,
        height: Math.max(((end - start) / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT),
      };
    });

    // Sort by start time, then by duration (shorter first)
    layoutEvents.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (a.end - a.start) - (b.end - b.start);
    });

    // Find overlapping groups and assign lanes
    const groups: LayoutEvent[][] = [];
    
    for (const event of layoutEvents) {
      // Find a group where this event fits
      let assignedGroup: LayoutEvent[] | null = null;
      
      for (const group of groups) {
        // Check if this event overlaps with any event in the group
        const overlaps = group.some(groupEvent => 
          !(event.end <= groupEvent.start || event.start >= groupEvent.end)
        );
        
        if (overlaps) {
          // Find the first available lane in this group
          const usedLanes = new Set(group.map(e => e.lane));
          let lane = 0;
          while (usedLanes.has(lane)) {
            lane++;
          }
          
          event.lane = lane;
          group.push(event);
          assignedGroup = group;
          break;
        }
      }
      
      // If no overlapping group found, create a new group
      if (!assignedGroup) {
        event.lane = 0;
        groups.push([event]);
      }
    }

    // Update lane count for each event in groups with multiple lanes
    for (const group of groups) {
      const maxLane = Math.max(...group.map(e => e.lane));
      const laneCount = maxLane + 1;
      
      for (const event of group) {
        event.laneCount = laneCount;
      }
    }

    return layoutEvents;
  }, [timeToMinutes]);

  // Memoized layout calculation
  const layoutedEvents = useMemo(() => {
    return layoutEvents(blocks);
  }, [blocks, layoutEvents]);

  // Get color for block type
  const getBlockColor = useCallback((type: ScheduleBlock['type']) => {
    const colors = {
      work: 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600',
      exercise: 'bg-green-500 border-green-600 text-white hover:bg-green-600',
      sleep: 'bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600',
      meal: 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600',
      break: 'bg-red-400 border-red-500 text-white hover:bg-red-500',
      personal: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600',
      commute: 'bg-gray-500 border-gray-600 text-white hover:bg-gray-600',
      wellness: 'bg-pink-500 border-pink-600 text-white hover:bg-pink-600',
    };
    return colors[type] || 'bg-gray-400 border-gray-500 text-white hover:bg-gray-500';
  }, []);

  // Generate hour markers
  const hourMarkers = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      hour: i,
      time: minutesToTime(i * 60),
      position: i * HOUR_HEIGHT,
    }));
  }, [minutesToTime]);

  // Handle inline editing
  const startEditing = (blockId: string) => {
    setEditingBlock(blockId);
  };

  const stopEditing = () => {
    setEditingBlock(null);
  };

  // Handle keyboard navigation and actions
  const handleKeyDown = useCallback((event: React.KeyboardEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const currentStartTime = timeToMinutes(block.startTime);
    const currentEndTime = timeToMinutes(block.endTime);
    const duration = currentEndTime - currentStartTime;

    switch (event.key) {
      case 'ArrowUp': {
        event.preventDefault();
        const newStartTime = Math.max(0, snapToGrid(currentStartTime - 15));
        onBlockUpdate(blockId, {
          startTime: minutesToTime(newStartTime),
          endTime: minutesToTime(newStartTime + duration),
        });
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        const newStartTime = Math.min(1440 - duration, snapToGrid(currentStartTime + 15));
        onBlockUpdate(blockId, {
          startTime: minutesToTime(newStartTime),
          endTime: minutesToTime(newStartTime + duration),
        });
        break;
      }
      case 'Shift+ArrowUp': {
        event.preventDefault();
        const newEndTime = Math.max(currentStartTime + 15, snapToGrid(currentEndTime - 15));
        onBlockUpdate(blockId, {
          endTime: minutesToTime(newEndTime),
        });
        break;
      }
      case 'Shift+ArrowDown': {
        event.preventDefault();
        const newEndTime = Math.min(1440, snapToGrid(currentEndTime + 15));
        onBlockUpdate(blockId, {
          endTime: minutesToTime(newEndTime),
        });
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        startEditing(blockId);
        break;
      }
      case 'Delete':
      case 'Backspace': {
        event.preventDefault();
        onBlockDelete(blockId);
        break;
      }
    }
  }, [blocks, timeToMinutes, minutesToTime, snapToGrid, onBlockUpdate, onBlockDelete, startEditing]);

  // Handle drag operations
  const handleMouseDown = useCallback((event: React.MouseEvent, blockId: string) => {
    if (event.button !== 0) return; // Only left mouse button
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const startY = event.clientY;
    const originalStartTime = timeToMinutes(block.startTime);
    
    setDraggedBlock(blockId);
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const deltaY = e.clientY - startY;
      const deltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
      
      // Calculate new start time with snapping
      const newStartMinutes = snapToGrid(originalStartTime + deltaMinutes);
      const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
      
      // Ensure the event stays within 24 hours and doesn't go negative
      const clampedStartMinutes = Math.max(0, Math.min(1440 - duration, newStartMinutes));
      
      const newStartTime = minutesToTime(clampedStartMinutes);
      const newEndTime = minutesToTime(clampedStartMinutes + duration);
      
      // Update the block temporarily for visual feedback
      onBlockUpdate(blockId, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    };
    
    const handleMouseUp = () => {
      setDraggedBlock(null);
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [blocks, timeToMinutes, minutesToTime, snapToGrid, onBlockUpdate]);

  // Handle resize operations
  const handleResizeMouseDown = useCallback((event: React.MouseEvent, blockId: string) => {
    if (event.button !== 0) return;
    
    event.stopPropagation(); // Prevent drag from starting
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const startY = event.clientY;
    const originalEndTime = timeToMinutes(block.endTime);
    const originalStartTime = timeToMinutes(block.startTime);
    
    setResizingBlock(blockId);
    setIsResizing(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      if (!timelineRef.current) return;
      
      const deltaY = e.clientY - startY;
      const deltaMinutes = (deltaY / HOUR_HEIGHT) * 60;
      
      // Calculate new end time with snapping
      const newEndMinutes = snapToGrid(originalEndTime + deltaMinutes);
      
      // Ensure minimum duration of 15 minutes and maximum end time of 24:00
      const minEndTime = originalStartTime + 15; // 15 minute minimum
      const maxEndTime = 1440; // 24:00
      const clampedEndMinutes = Math.max(minEndTime, Math.min(maxEndTime, newEndMinutes));
      
      const newEndTime = minutesToTime(clampedEndMinutes);
      
      // Update the block temporarily for visual feedback
      onBlockUpdate(blockId, {
        endTime: newEndTime,
      });
    };
    
    const handleMouseUp = () => {
      setResizingBlock(null);
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [blocks, timeToMinutes, minutesToTime, snapToGrid, onBlockUpdate]);

  return (
    <div className={cn("relative bg-white rounded-lg shadow-sm", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Timeline</h3>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-4">
            <span>• <strong>Drag:</strong> Move events</span>
            <span>• <strong>Bottom edge:</strong> Resize duration</span>
            <span>• <strong>Double-click:</strong> Edit title</span>
            <span>• <strong>Arrow keys:</strong> Move (↑↓) or resize (Shift+↑↓)</span>
          </div>
        </div>
      </div>
      
      <div className="relative overflow-auto" style={{ height: '600px' }}>
        <div 
          ref={timelineRef}
          className="relative" 
          style={{ height: `${24 * HOUR_HEIGHT}px`, minWidth: '400px' }}
        >
          {/* Hour markers */}
          <div className="absolute left-0 w-16 h-full">
            {hourMarkers.map(({ hour, time, position }) => (
              <div
                key={hour}
                className="absolute flex items-start text-xs text-gray-500 border-t border-gray-100"
                style={{ top: `${position}px` }}
              >
                <span className="w-12 text-right pr-2 -mt-2 bg-white">{time}</span>
              </div>
            ))}
          </div>
          
          {/* Timeline grid */}
          <div className="absolute left-16 right-0 h-full">
            {/* Hour lines */}
            {hourMarkers.map(({ hour, position }) => (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-100"
                style={{ top: `${position}px` }}
              />
            ))}
            
            {/* Quarter hour lines (for better snap visualization) */}
            {Array.from({ length: 24 * 4 }, (_, i) => {
              const quarterHour = i * 15;
              const position = (quarterHour / 60) * HOUR_HEIGHT;
              return (
                <div
                  key={`quarter-${i}`}
                  className="absolute w-full border-t border-gray-50"
                  style={{ top: `${position}px` }}
                />
              );
            })}
            
            {/* Current time indicator */}
            {(() => {
              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();
              const currentPosition = (currentMinutes / 60) * HOUR_HEIGHT;
              return (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: `${currentPosition}px` }}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                </div>
              );
            })()
            }
            
            {/* Events */}
            <AnimatePresence>
              {layoutedEvents.map((event) => {
                const isEditing = editingBlock === event.id;
                const isDraggedEvent = draggedBlock === event.id;
                
                // Calculate width and left position based on lane
                const totalWidth = 100; // percentage
                const laneWidth = (totalWidth - (event.laneCount - 1) * 2) / event.laneCount; // 2% gutter
                const leftPosition = event.lane * (laneWidth + 2); // 2% gutter between lanes
                
                return (
                  <motion.div
                    key={event.id}
                    className={cn(
                      "absolute rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      getBlockColor(event.type),
                      isDraggedEvent && "opacity-75 scale-[0.98] z-10",
                      resizingBlock === event.id && "ring-2 ring-blue-500",
                      "group"
                    )}
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      left: `${leftPosition}%`,
                      width: `${laneWidth}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(e) => !isEditing && handleMouseDown(e, event.id)}
                    onDoubleClick={() => startEditing(event.id)}
                    onKeyDown={(e) => handleKeyDown(e, event.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${event.title} from ${event.originalBlock.startTime} to ${event.originalBlock.endTime}. Press Enter to edit, Arrow keys to move, Shift+Arrow keys to resize, Delete to remove.`}
                  >
                    <div className="h-full p-2 flex flex-col justify-between overflow-hidden">
                      {isEditing ? (
                        // Editing mode
                        <div className="space-y-1">
                          <input
                            type="text"
                            defaultValue={event.title}
                            onBlur={(e) => {
                              onBlockUpdate(event.id, { title: e.target.value });
                              stopEditing();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onBlockUpdate(event.id, { title: e.currentTarget.value });
                                stopEditing();
                              } else if (e.key === 'Escape') {
                                stopEditing();
                              }
                            }}
                            className="w-full px-1 py-0 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white placeholder-white/70"
                            autoFocus
                          />
                          <div className="text-xs opacity-90">
                            {event.originalBlock.startTime} - {event.originalBlock.endTime}
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <div>
                            <h4 className="text-xs font-semibold leading-tight mb-1 truncate">
                              {event.title}
                            </h4>
                            <p className="text-xs opacity-90">
                              {event.originalBlock.startTime} - {event.originalBlock.endTime}
                            </p>
                            {event.height > 40 && (
                              <p className="text-xs opacity-75 mt-1">
                                {Math.round((event.end - event.start) / 60 * 10) / 10}h
                              </p>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(event.id);
                              }}
                              className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onBlockDelete(event.id);
                              }}
                              className="p-1 bg-white/20 hover:bg-red-500/50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Resize handle */}
                    {!isEditing && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize bg-transparent hover:bg-white/20 group/resize"
                        onMouseDown={(e) => handleResizeMouseDown(e, event.id)}
                        title="Resize"
                      >
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/50 group-hover/resize:bg-white/80 transition-colors" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Empty state */}
            {layoutedEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No events scheduled</p>
                  <p className="text-sm">Add some activities to see your timeline</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 mb-2">Activity Types:</p>
        <div className="flex flex-wrap gap-2">
          {['work', 'exercise', 'sleep', 'meal', 'break', 'personal', 'commute', 'wellness'].map((type) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className={cn(
                  "w-3 h-3 rounded-sm border", 
                  getBlockColor(type as ScheduleBlock['type']).split(' ')[0],
                  getBlockColor(type as ScheduleBlock['type']).split(' ')[1]
                )} 
              />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};