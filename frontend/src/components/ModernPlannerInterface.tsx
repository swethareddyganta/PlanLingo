import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Sparkles, 
  Download, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  Zap,
  MessageSquare,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { cn } from '../lib/utils';
import { scheduleAI } from '../services/scheduleAI';
import type { ScheduleBlock, DailySchedule } from '../services/scheduleAI';
import { EnhancedScheduleTimeline } from './ui/EnhancedScheduleTimeline';
import { ScheduleAnalytics } from './ui/ScheduleAnalytics';
import { ScheduleOptimizer } from './ui/ScheduleOptimizer';

interface ModernPlannerInterfaceProps {
  className?: string;
}

type ViewMode = 'input' | 'timeline' | 'analytics' | 'optimizer';

export const ModernPlannerInterface: React.FC<ModernPlannerInterfaceProps> = ({
  className,
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('input');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<DailySchedule | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example inputs for demonstration
  const exampleInputs = [
    "I want a daily schedule for a software employee who works from 9 to 5, workout for 45min, sleep 7hrs",
    "Morning routine at 6am, work 8 hours with lunch break, evening workout, dinner with family",
    "Freelancer schedule: deep work 4 hours, client calls 2 hours, exercise 30min, personal time 3 hours",
    "Student schedule: classes 9-3, study time 4 hours, gym 1 hour, social time 2 hours"
  ];

  const processNaturalLanguageInput = async () => {
    if (!naturalLanguageInput.trim()) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Initializing AI...');
    
    try {
      setProcessingStatus('Parsing your schedule description...');
      
      // Add a small delay to show the processing status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStatus('Generating optimized timetable...');
      
      const result = await scheduleAI.parseScheduleFromText(naturalLanguageInput);
      
      setProcessingStatus('Schedule created successfully!');
      
      // Small delay to show success status
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setScheduleData(result);
      setCurrentView('timeline');
      setHasUnsavedChanges(false);
      
      console.log('Schedule generated with', result.blocks.length, 'activities');
      
    } catch (error) {
      console.error('Failed to process schedule:', error);
      setError(
        error instanceof Error 
          ? `AI Processing Error: ${error.message}` 
          : 'Failed to generate schedule. Please try again or check your API configuration.'
      );
      setProcessingStatus('Processing failed');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
      }, 1000);
    }
  };

  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ScheduleBlock>) => {
    if (!scheduleData) return;

    const updatedBlocks = scheduleData.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    setScheduleData(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
    setHasUnsavedChanges(true);
  }, [scheduleData]);

  const handleBlockDelete = useCallback((blockId: string) => {
    if (!scheduleData) return;

    const updatedBlocks = scheduleData.blocks.filter(block => block.id !== blockId);
    setScheduleData(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
    setHasUnsavedChanges(true);
  }, [scheduleData]);

  const handleBlockReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (!scheduleData) return;

    const updatedBlocks = [...scheduleData.blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);

    setScheduleData(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
    setHasUnsavedChanges(true);
  }, [scheduleData]);

  const handleApplyOptimization = useCallback((optimizedBlocks: ScheduleBlock[]) => {
    if (!scheduleData) return;

    setScheduleData(prev => prev ? { ...prev, blocks: optimizedBlocks } : null);
    setHasUnsavedChanges(true);
  }, [scheduleData]);

  const exportToICS = () => {
    if (!scheduleData || scheduleData.blocks.length === 0) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    const toUtc = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const lines: string[] = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//PlanLingo//Modern Planner//EN');
    
    scheduleData.blocks.forEach((block, i) => {
      const uid = `${dateStr}-${i}@dailyflow`;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${toUtc(block.startTime)}`);
      lines.push(`DTSTART:${toUtc(block.startTime)}`);
      lines.push(`DTEND:${toUtc(block.endTime)}`);
      lines.push(`SUMMARY:${block.title.replace(/\n/g, ' ')}`);
      lines.push(`DESCRIPTION:${block.type} - ${block.description || 'Daily Flow Activity'}`);
      lines.push('END:VEVENT');
    });
    
    lines.push('END:VCALENDAR');
    
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily-flow-schedule.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSchedule = () => {
    setScheduleData(null);
    setNaturalLanguageInput('');
    setCurrentView('input');
    setHasUnsavedChanges(false);
  };

  // Navigation items
  const navigationItems = [
    { 
      id: 'input' as ViewMode, 
      label: 'Create Schedule', 
      icon: MessageSquare,
      available: true,
      description: 'Describe your ideal day'
    },
    { 
      id: 'timeline' as ViewMode, 
      label: 'Timeline', 
      icon: Clock,
      available: !!scheduleData,
      description: 'Visual schedule view'
    },
    { 
      id: 'analytics' as ViewMode, 
      label: 'Analytics', 
      icon: BarChart3,
      available: !!scheduleData,
      description: 'Time breakdown & insights'
    },
    { 
      id: 'optimizer' as ViewMode, 
      label: 'Optimize', 
      icon: Zap,
      available: !!scheduleData,
      description: 'AI-powered suggestions'
    },
  ];

  const currentBlocks = useMemo(() => scheduleData?.blocks || [], [scheduleData]);

  return (
    <div className={cn("max-w-7xl mx-auto p-6 space-y-6", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Daily Flow Planner
            </h1>
            <p className="text-blue-100 text-lg">
              Transform your natural language into a structured, optimized daily schedule
            </p>
          </div>
          
          {scheduleData && (
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              
              <button
                onClick={exportToICS}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={clearSchedule}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Builder</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && setCurrentView(item.id)}
              disabled={!item.available}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                currentView === item.id && item.available
                  ? "border-blue-300 bg-blue-50 text-blue-900"
                  : item.available
                    ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                currentView === item.id && item.available
                  ? "bg-blue-100 text-blue-600"
                  : item.available
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-200 text-gray-400"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
              {currentView === item.id && item.available && (
                <ChevronRight className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'input' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Describe Your Ideal Day
                  </h2>
                  <p className="text-gray-600">
                    Tell us about your daily routine in natural language, and we'll create a structured schedule for you
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Natural Language Input
                    </label>
                    <textarea
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-lg"
                      rows={4}
                      placeholder="Example: I want a daily schedule for a software employee who works from 9 to 5, workout for 45min, sleep 7hrs"
                    />
                  </div>

                  {/* Processing Status */}
                  {(isProcessing || processingStatus) && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isProcessing ? (
                          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-blue-600" />
                        )}
                        <span className="text-blue-800 font-medium">{processingStatus}</span>
                      </div>
                      {isProcessing && (
                        <div className="mt-2">
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-red-800">Schedule Generation Failed</h3>
                          <p className="mt-1 text-sm text-red-700">{error}</p>
                          <button
                            onClick={() => setError(null)}
                            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      onClick={processNaturalLanguageInput}
                      disabled={isProcessing || !naturalLanguageInput.trim()}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                        isProcessing || !naturalLanguageInput.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          {processingStatus || 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Smart Schedule
                        </>
                      )}
                    </button>

                    {scheduleData && (
                      <button
                        onClick={() => setCurrentView('timeline')}
                        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        View Current Schedule
                      </button>
                    )}
                  </div>

                  {/* Example inputs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Try these examples:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exampleInputs.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setNaturalLanguageInput(example)}
                          className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm"
                        >
                          <Lightbulb className="w-4 h-4 inline mr-2 text-yellow-600" />
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'timeline' && scheduleData && (
            <EnhancedScheduleTimeline
              blocks={currentBlocks}
              onBlockUpdate={handleBlockUpdate}
              onBlockDelete={handleBlockDelete}
              onBlockReorder={handleBlockReorder}
            />
          )}

          {currentView === 'analytics' && scheduleData && (
            <ScheduleAnalytics blocks={currentBlocks} />
          )}

          {currentView === 'optimizer' && scheduleData && (
            <ScheduleOptimizer
              blocks={currentBlocks}
              onApplyOptimization={handleApplyOptimization}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Footer */}
      {scheduleData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduleData.blocks.length}</p>
              <p className="text-sm text-gray-600">Activities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {scheduleData.workLifeBalance.workHours}h
              </p>
              <p className="text-sm text-gray-600">Work Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(scheduleData.workLifeBalance.exerciseMinutes)}m
              </p>
              <p className="text-sm text-gray-600">Exercise</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {scheduleData.optimizationScore}/100
              </p>
              <p className="text-sm text-gray-600">Optimization Score</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};