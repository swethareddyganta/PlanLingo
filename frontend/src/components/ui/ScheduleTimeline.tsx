import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Edit3, Check, X, Move, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ScheduleBlock } from '../../services/scheduleAI';

interface ScheduleTimelineProps {
  blocks: ScheduleBlock[];
  onBlockUpdate: (blockId: string, updates: Partial<ScheduleBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

interface EditingBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: ScheduleBlock['type'];
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  blocks,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  className,
}) => {
  const [editingBlock, setEditingBlock] = useState<EditingBlock | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Convert time to minutes from 00:00
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Convert minutes to time string
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, []);

  // Calculate position and height for timeline blocks
  const getBlockStyle = useCallback((block: ScheduleBlock) => {
    const startMinutes = timeToMinutes(block.startTime);
    let endMinutes = timeToMinutes(block.endTime);
    
    // Handle cross-midnight times (e.g., sleep from 23:00 to 06:00)
    if (endMinutes < startMinutes) {
      endMinutes += 1440; // Add 24 hours for next day
    }
    
    let duration = endMinutes - startMinutes;
    let top = (startMinutes / 1440) * 100;
    let height = (duration / 1440) * 100;
    
    // For blocks that cross midnight, we need to handle them specially
    if (endMinutes > 1440) {
      // This block extends into the next day
      // For now, cap it at the end of the current day
      const remainingMinutesToday = 1440 - startMinutes;
      height = (remainingMinutesToday / 1440) * 100;
    }
    
    // Use actual duration from the block data as fallback
    if (duration <= 0 || isNaN(duration)) {
      height = (block.duration / 1440) * 100;
    }
    
    return {
      top: `${top}%`,
      height: `${Math.max(height, 2)}%`, // Minimum 2% height for visibility
    };
  }, [timeToMinutes]);

  // Get color for block type
  const getBlockColor = useCallback((type: ScheduleBlock['type']) => {
    const colors = {
      work: 'bg-blue-500 border-blue-600 text-white',
      exercise: 'bg-green-500 border-green-600 text-white',
      sleep: 'bg-indigo-500 border-indigo-600 text-white',
      meal: 'bg-amber-500 border-amber-600 text-white',
      break: 'bg-red-400 border-red-500 text-white',
      personal: 'bg-purple-500 border-purple-600 text-white',
      commute: 'bg-gray-500 border-gray-600 text-white',
      wellness: 'bg-pink-500 border-pink-600 text-white',
    };
    return colors[type] || 'bg-gray-400 border-gray-500 text-white';
  }, []);

  // Generate hour markers
  const hourMarkers = Array.from({ length: 25 }, (_, i) => ({
    hour: i,
    time: minutesToTime(i * 60),
    position: (i / 24) * 100,
  }));

  // Handle block editing
  const startEditing = (block: ScheduleBlock) => {
    setEditingBlock({
      id: block.id,
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      type: block.type,
    });
  };

  const saveEditing = () => {
    if (!editingBlock) return;
    
    const startMinutes = timeToMinutes(editingBlock.startTime);
    const endMinutes = timeToMinutes(editingBlock.endTime);
    const duration = endMinutes - startMinutes;
    
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }
    
    onBlockUpdate(editingBlock.id, {
      title: editingBlock.title,
      startTime: editingBlock.startTime,
      endTime: editingBlock.endTime,
      duration,
      type: editingBlock.type,
    });
    
    setEditingBlock(null);
  };

  const cancelEditing = () => {
    setEditingBlock(null);
  };

  // Handle drag and drop
  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetBlockId: string) => {
    if (!draggedBlock || draggedBlock === targetBlockId) return;
    
    const fromIndex = blocks.findIndex(b => b.id === draggedBlock);
    const toIndex = blocks.findIndex(b => b.id === targetBlockId);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      onBlockReorder(fromIndex, toIndex);
    }
    
    setDraggedBlock(null);
  };

  return (
    <div className={cn("relative bg-white rounded-lg p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Daily Timeline</h3>
      </div>
      
      <div className="relative" style={{ height: '600px' }} ref={timelineRef}>
        {/* Hour markers */}
        <div className="absolute left-0 w-16 h-full">
          {hourMarkers.map(({ hour, time, position }) => (
            <div
              key={hour}
              className="absolute flex items-center text-xs text-gray-500"
              style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
            >
              <span className="w-12 text-right pr-2">{time}</span>
              <div className="w-2 h-px bg-gray-300" />
            </div>
          ))}
        </div>
        
        {/* Timeline axis */}
        <div className="absolute left-16 top-0 w-px h-full bg-gray-300" />
        
        {/* Schedule blocks */}
        <div className="absolute left-20 right-0 h-full">
          <AnimatePresence>
            {blocks.map((block) => {
              const blockStyle = getBlockStyle(block);
              const isEditing = editingBlock?.id === block.id;
              const isDragging = draggedBlock === block.id;
              
              return (
                <motion.div
                  key={block.id}
                  className={cn(
                    "absolute left-0 right-4 rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg",
                    getBlockColor(block.type),
                    isDragging && "opacity-50 scale-95",
                    "group"
                  )}
                  style={blockStyle}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  draggable
                  onDragStart={() => handleDragStart(block.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(block.id)}
                >
                  {isEditing ? (
                    // Editing mode
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingBlock.title}
                        onChange={(e) =>
                          setEditingBlock(prev => prev ? { ...prev, title: e.target.value } : null)
                        }
                        className="w-full px-2 py-1 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white placeholder-white/70"
                        placeholder="Block title"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={editingBlock.startTime}
                          onChange={(e) =>
                            setEditingBlock(prev => prev ? { ...prev, startTime: e.target.value } : null)
                          }
                          className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white"
                        />
                        <span className="text-white/70 text-xs">to</span>
                        <input
                          type="time"
                          value={editingBlock.endTime}
                          onChange={(e) =>
                            setEditingBlock(prev => prev ? { ...prev, endTime: e.target.value } : null)
                          }
                          className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white"
                        />
                      </div>
                      <select
                        value={editingBlock.type}
                        onChange={(e) =>
                          setEditingBlock(prev => prev ? { ...prev, type: e.target.value as ScheduleBlock['type'] } : null)
                        }
                        className="w-full px-2 py-1 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white"
                      >
                        <option value="work">Work</option>
                        <option value="exercise">Exercise</option>
                        <option value="sleep">Sleep</option>
                        <option value="meal">Meal</option>
                        <option value="break">Break</option>
                        <option value="personal">Personal</option>
                        <option value="commute">Commute</option>
                        <option value="wellness">Wellness</option>
                      </select>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={saveEditing}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold mb-1 leading-tight">
                          {block.title}
                        </h4>
                        <p className="text-xs opacity-90">
                          {block.startTime} - {block.endTime}
                        </p>
                        <p className="text-xs opacity-75 mt-1">
                          {Math.round(block.duration / 60 * 10) / 10}h
                        </p>
                      </div>
                      
                      {/* Action buttons - show on hover */}
                      <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(block);
                          }}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockDelete(block.id);
                          }}
                          className="p-1 bg-white/20 hover:bg-red-500/50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="p-1" title="Drag to reorder">
                          <Move className="w-3 h-3 opacity-50" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Empty state */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No schedule blocks</p>
                <p className="text-sm">Add some activities to see your timeline</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Activity Types:</p>
        <div className="flex flex-wrap gap-2">
          {['work', 'exercise', 'sleep', 'meal', 'break', 'personal', 'commute', 'wellness'].map((type) => (
            <div key={type} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded-sm border", getBlockColor(type as ScheduleBlock['type']))} />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};