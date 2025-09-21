import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Zap, RefreshCw, TrendingUp, Clock, Brain, Heart, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { scheduleAI } from '../../services/scheduleAI';
import type { ScheduleBlock } from '../../services/scheduleAI';

interface ScheduleOptimizerProps {
  blocks: ScheduleBlock[];
  onApplyOptimization?: (optimizedBlocks: ScheduleBlock[]) => void;
  className?: string;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'productivity' | 'wellness' | 'balance' | 'efficiency';
  actionable: boolean;
  estimatedImprovement: string;
}

export const ScheduleOptimizer: React.FC<ScheduleOptimizerProps> = ({
  blocks,
  onApplyOptimization,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationData, setOptimizationData] = useState<{
    suggestions: string[];
    improvements: string[];
    score: number;
    optimizedSchedule: ScheduleBlock[];
  } | null>(null);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Generate enhanced suggestions based on schedule analysis
  const generateEnhancedSuggestions = (blocks: ScheduleBlock[]): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Work-related analysis
    const workBlocks = blocks.filter(b => b.type === 'work');
    const totalWorkMinutes = workBlocks.reduce((sum, b) => sum + b.duration, 0);
    const workHours = totalWorkMinutes / 60;
    
    if (workHours > 9) {
      suggestions.push({
        id: 'reduce-work-hours',
        title: 'Reduce Work Hours',
        description: `You're working ${workHours.toFixed(1)} hours per day. Consider reducing to 8-9 hours for better work-life balance.`,
        impact: 'high',
        category: 'balance',
        actionable: true,
        estimatedImprovement: '15% better work-life balance',
      });
    }
    
    // Break analysis
    const breakBlocks = blocks.filter(b => b.type === 'break');
    const totalBreakMinutes = breakBlocks.reduce((sum, b) => sum + b.duration, 0);
    
    if (totalWorkMinutes > 0 && (totalBreakMinutes / totalWorkMinutes) < 0.15) {
      suggestions.push({
        id: 'add-breaks',
        title: 'Add More Breaks',
        description: 'Research shows taking breaks every 90 minutes improves focus and productivity.',
        impact: 'medium',
        category: 'productivity',
        actionable: true,
        estimatedImprovement: '20% better focus',
      });
    }
    
    // Exercise analysis
    const exerciseBlocks = blocks.filter(b => b.type === 'exercise');
    const totalExerciseMinutes = exerciseBlocks.reduce((sum, b) => sum + b.duration, 0);
    
    if (totalExerciseMinutes < 30) {
      suggestions.push({
        id: 'add-exercise',
        title: 'Increase Physical Activity',
        description: `You have ${totalExerciseMinutes} minutes of exercise. WHO recommends at least 30 minutes daily.`,
        impact: 'high',
        category: 'wellness',
        actionable: true,
        estimatedImprovement: '25% better energy levels',
      });
    }
    
    // Sleep analysis
    const sleepBlocks = blocks.filter(b => b.type === 'sleep');
    const totalSleepMinutes = sleepBlocks.reduce((sum, b) => sum + b.duration, 0);
    const sleepHours = totalSleepMinutes / 60;
    
    if (sleepHours < 7) {
      suggestions.push({
        id: 'increase-sleep',
        title: 'Optimize Sleep Duration',
        description: `You're getting ${sleepHours.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal recovery.`,
        impact: 'high',
        category: 'wellness',
        actionable: true,
        estimatedImprovement: '30% better recovery',
      });
    }
    
    // Time blocking efficiency
    const hasConsecutiveBreaks = blocks.some((block, index) => {
      const nextBlock = blocks[index + 1];
      return block.type === 'break' && nextBlock && nextBlock.type === 'break';
    });
    
    if (!hasConsecutiveBreaks && workBlocks.length > 2) {
      suggestions.push({
        id: 'time-blocking',
        title: 'Optimize Time Blocking',
        description: 'Group similar activities together and use time-blocking techniques for better focus.',
        impact: 'medium',
        category: 'efficiency',
        actionable: true,
        estimatedImprovement: '15% better efficiency',
      });
    }
    
    // Personal time analysis
    const personalBlocks = blocks.filter(b => b.type === 'personal' || b.type === 'wellness');
    const totalPersonalMinutes = personalBlocks.reduce((sum, b) => sum + b.duration, 0);
    
    if (totalPersonalMinutes < 60) {
      suggestions.push({
        id: 'add-personal-time',
        title: 'Schedule Personal Time',
        description: 'Allocate at least 1-2 hours daily for personal activities, hobbies, and relaxation.',
        impact: 'medium',
        category: 'balance',
        actionable: true,
        estimatedImprovement: '20% better life satisfaction',
      });
    }
    
    return suggestions;
  };

  const runOptimization = async () => {
    if (blocks.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Run AI optimization
      const result = await scheduleAI.optimizeSchedule(blocks);
      setOptimizationData(result);
      
      // Generate enhanced suggestions
      const enhanced = generateEnhancedSuggestions(blocks);
      setEnhancedSuggestions(enhanced);
    } catch (error) {
      console.error('Optimization failed:', error);
      // Fallback to local suggestions
      const enhanced = generateEnhancedSuggestions(blocks);
      setEnhancedSuggestions(enhanced);
      setOptimizationData({
        suggestions: ['Consider adding more breaks between work sessions'],
        improvements: ['Better time distribution'],
        score: 65,
        optimizedSchedule: blocks,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run optimization when blocks change
  useEffect(() => {
    if (blocks.length > 0) {
      const debounceTimer = setTimeout(() => {
        runOptimization();
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [blocks]);

  const toggleSuggestion = (suggestionId: string) => {
    console.log('Toggling suggestion:', suggestionId);
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
      console.log('Deselected suggestion:', suggestionId);
    } else {
      newSelected.add(suggestionId);
      console.log('Selected suggestion:', suggestionId);
    }
    console.log('All selected suggestions:', Array.from(newSelected));
    setSelectedSuggestions(newSelected);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      case 'balance': return <TrendingUp className="w-4 h-4" />;
      case 'efficiency': return <Clock className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const applySelectedOptimizations = async () => {
    if (!onApplyOptimization || selectedSuggestions.size === 0) return;
    
    setIsApplyingChanges(true);
    console.log('Applying selected optimizations:', Array.from(selectedSuggestions));
    
    try {
      // Create a copy of the current blocks to modify
      let optimizedBlocks = [...blocks];
      
      // Apply each selected suggestion
      selectedSuggestions.forEach(suggestionId => {
        const suggestion = enhancedSuggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;
        
        console.log(`Applying suggestion: ${suggestion.title}`);
        
        // Apply specific optimizations based on suggestion ID
        switch (suggestionId) {
          case 'reduce-work-hours':
            optimizedBlocks = reduceWorkHours(optimizedBlocks);
            break;
          case 'add-breaks':
            optimizedBlocks = addMoreBreaks(optimizedBlocks);
            break;
          case 'add-exercise':
            optimizedBlocks = increaseExercise(optimizedBlocks);
            break;
          case 'increase-sleep':
            optimizedBlocks = optimizeSleep(optimizedBlocks);
            break;
          case 'add-personal-time':
            optimizedBlocks = addPersonalTime(optimizedBlocks);
            break;
          case 'time-blocking':
            optimizedBlocks = optimizeTimeBlocking(optimizedBlocks);
            break;
          default:
            console.log(`No specific optimization for: ${suggestionId}`);
        }
      });
      
      // Ensure block IDs are sequential
      optimizedBlocks = optimizedBlocks.map((block, index) => ({
        ...block,
        id: String(index + 1)
      }));
      
      console.log('Applied optimizations, passing', optimizedBlocks.length, 'blocks to parent');
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Apply the changes
      onApplyOptimization(optimizedBlocks);
      
      // Mark suggestions as applied
      setAppliedSuggestions(prev => {
        const newApplied = new Set(prev);
        selectedSuggestions.forEach(id => newApplied.add(id));
        return newApplied;
      });
      
      // Clear selected suggestions after applying
      setSelectedSuggestions(new Set());
      
    } catch (error) {
      console.error('Failed to apply optimizations:', error);
    } finally {
      setIsApplyingChanges(false);
    }
  };
  
  // Helper functions to apply specific optimizations
  const reduceWorkHours = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    const workBlocks = blocks.filter(b => b.type === 'work');
    const nonWorkBlocks = blocks.filter(b => b.type !== 'work');
    
    if (workBlocks.length === 0) return blocks;
    
    // Reduce each work block by 15% but ensure minimum 1 hour per block
    const adjustedWorkBlocks = workBlocks.map(block => ({
      ...block,
      duration: Math.max(60, Math.floor(block.duration * 0.85)),
      endTime: addMinutesToTime(block.startTime, Math.max(60, Math.floor(block.duration * 0.85)))
    }));
    
    return [...adjustedWorkBlocks, ...nonWorkBlocks].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
  };
  
  const addMoreBreaks = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    const result: ScheduleBlock[] = [];
    let breakId = blocks.length + 1;
    
    blocks.forEach((block, index) => {
      result.push(block);
      
      // Add break after work blocks longer than 2 hours
      if (block.type === 'work' && block.duration > 120) {
        const nextBlock = blocks[index + 1];
        if (nextBlock) {
          const breakStartTime = block.endTime;
          const breakDuration = 15; // 15 minute break
          
          result.push({
            id: String(breakId++),
            title: 'Short Break',
            startTime: breakStartTime,
            endTime: addMinutesToTime(breakStartTime, breakDuration),
            duration: breakDuration,
            type: 'break',
            description: 'Quick rest and recharge',
            priority: 'medium',
            flexible: true
          });
        }
      }
    });
    
    return result;
  };
  
  const increaseExercise = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    const exerciseBlocks = blocks.filter(b => b.type === 'exercise');
    const otherBlocks = blocks.filter(b => b.type !== 'exercise');
    
    if (exerciseBlocks.length === 0) {
      // Add new exercise block
      const newExerciseBlock: ScheduleBlock = {
        id: String(blocks.length + 1),
        title: 'Exercise Session',
        startTime: '18:00',
        endTime: '18:45',
        duration: 45,
        type: 'exercise',
        description: 'Physical fitness activity',
        priority: 'medium',
        flexible: true
      };
      
      return [...otherBlocks, newExerciseBlock].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
    } else {
      // Increase existing exercise duration to at least 45 minutes
      const adjustedExerciseBlocks = exerciseBlocks.map(block => ({
        ...block,
        duration: Math.max(45, block.duration),
        endTime: addMinutesToTime(block.startTime, Math.max(45, block.duration))
      }));
      
      return [...adjustedExerciseBlocks, ...otherBlocks].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
    }
  };
  
  const optimizeSleep = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    const sleepBlocks = blocks.filter(b => b.type === 'sleep');
    const otherBlocks = blocks.filter(b => b.type !== 'sleep');
    
    if (sleepBlocks.length === 0) return blocks;
    
    // Ensure at least 7.5 hours of sleep
    const adjustedSleepBlocks = sleepBlocks.map(block => ({
      ...block,
      duration: Math.max(450, block.duration), // 7.5 hours minimum
      endTime: addMinutesToTime(block.startTime, Math.max(450, block.duration))
    }));
    
    return [...adjustedSleepBlocks, ...otherBlocks].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
  };
  
  const addPersonalTime = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    const personalBlocks = blocks.filter(b => b.type === 'personal' || b.type === 'wellness');
    const otherBlocks = blocks.filter(b => b.type !== 'personal' && b.type !== 'wellness');
    
    const totalPersonalMinutes = personalBlocks.reduce((sum, b) => sum + b.duration, 0);
    
    if (totalPersonalMinutes < 90) {
      // Add personal time block
      const newPersonalBlock: ScheduleBlock = {
        id: String(blocks.length + 1),
        title: 'Personal Time',
        startTime: '20:00',
        endTime: '21:30',
        duration: 90,
        type: 'personal',
        description: 'Relaxation, hobbies, personal activities',
        priority: 'medium',
        flexible: true
      };
      
      return [...otherBlocks, newPersonalBlock].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
    }
    
    return blocks;
  };
  
  const optimizeTimeBlocking = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
    // Group similar activities together and ensure proper sequencing
    const groupedBlocks = {
      morning: blocks.filter(b => timeToMinutes(b.startTime) < 12 * 60),
      afternoon: blocks.filter(b => timeToMinutes(b.startTime) >= 12 * 60 && timeToMinutes(b.startTime) < 18 * 60),
      evening: blocks.filter(b => timeToMinutes(b.startTime) >= 18 * 60)
    };
    
    // Sort each group by type preference (work first, then breaks, then personal)
    const typeOrder = ['work', 'break', 'meal', 'exercise', 'personal', 'wellness', 'commute', 'sleep'];
    
    Object.keys(groupedBlocks).forEach(period => {
      groupedBlocks[period as keyof typeof groupedBlocks].sort((a, b) => {
        const aIndex = typeOrder.indexOf(a.type);
        const bIndex = typeOrder.indexOf(b.type);
        return aIndex - bIndex;
      });
    });
    
    return [...groupedBlocks.morning, ...groupedBlocks.afternoon, ...groupedBlocks.evening];
  };
  
  // Helper functions
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  if (blocks.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
        <div className="text-center text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No Schedule to Optimize</p>
          <p className="text-sm">Add some activities to get personalized optimization suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Schedule Optimizer</h3>
        </div>
        
        <button
          onClick={runOptimization}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
          {isAnalyzing ? 'Analyzing...' : 'Optimize'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
            <p className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Schedule</p>
            <p className="text-sm text-gray-600">AI is evaluating your daily routine for optimization opportunities...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {optimizationData && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Optimization Score</h4>
                  <span className="text-2xl font-bold text-purple-600">{optimizationData.score}/100</span>
                </div>
                <p className="text-sm text-purple-700">
                  {optimizationData.score >= 80 ? 'Excellent! Your schedule is well-optimized.' :
                   optimizationData.score >= 60 ? 'Good schedule with room for improvement.' :
                   'Your schedule could benefit from optimization.'}
                </p>
              </div>
            )}

            {enhancedSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Personalized Suggestions</h4>
                <div className="space-y-3">
                  {enhancedSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        appliedSuggestions.has(suggestion.id)
                          ? "border-green-300 bg-green-50 cursor-default"
                          : selectedSuggestions.has(suggestion.id)
                          ? "border-purple-300 bg-purple-50 cursor-pointer"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 cursor-pointer"
                      )}
                      onClick={() => !appliedSuggestions.has(suggestion.id) && toggleSuggestion(suggestion.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg border">
                          {getCategoryIcon(suggestion.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-gray-900">{suggestion.title}</h5>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full border font-medium",
                              getImpactColor(suggestion.impact)
                            )}>
                              {suggestion.impact} impact
                            </span>
                            {appliedSuggestions.has(suggestion.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : selectedSuggestions.has(suggestion.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            {appliedSuggestions.has(suggestion.id) ? (
                              <span className="text-green-600 font-medium">
                                ✓ Applied to your schedule
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium">
                                📈 {suggestion.estimatedImprovement}
                              </span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 capitalize">{suggestion.category}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {optimizationData && optimizationData.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                <div className="space-y-2">
                  {optimizationData.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {(enhancedSuggestions.length > 0) && onApplyOptimization && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-lg p-4 text-white",
                  selectedSuggestions.size > 0 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                    : appliedSuggestions.size > 0
                    ? "bg-gradient-to-r from-green-600 to-emerald-600"
                    : "bg-gradient-to-r from-gray-600 to-slate-600"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {selectedSuggestions.size > 0 ? (
                      <>
                        <h5 className="font-semibold mb-1">Ready to Optimize?</h5>
                        <p className="text-sm opacity-90">
                          {selectedSuggestions.size} suggestion{selectedSuggestions.size > 1 ? 's' : ''} selected
                        </p>
                      </>
                    ) : appliedSuggestions.size > 0 ? (
                      <>
                        <h5 className="font-semibold mb-1">Optimizations Applied!</h5>
                        <p className="text-sm opacity-90">
                          {appliedSuggestions.size} suggestion{appliedSuggestions.size > 1 ? 's' : ''} successfully applied to your schedule
                        </p>
                      </>
                    ) : (
                      <>
                        <h5 className="font-semibold mb-1">Select Optimizations</h5>
                        <p className="text-sm opacity-90">
                          Click on suggestions above to select them for optimization
                        </p>
                      </>
                    )}
                  </div>
                  {selectedSuggestions.size > 0 ? (
                    <button
                      onClick={applySelectedOptimizations}
                      disabled={isApplyingChanges}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isApplyingChanges ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Apply Changes
                        </>
                      )}
                    </button>
                  ) : appliedSuggestions.size === 0 ? (
                    <div className="text-white/60 text-sm px-4 py-2">
                      Select suggestions first
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};