import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, AlertTriangle, CheckCircle, Brain, Heart } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { cn } from '../../lib/utils';
import { scheduleAI } from '../../services/scheduleAI';
import type { ScheduleBlock } from '../../services/scheduleAI';

interface ScheduleAnalyticsProps {
  blocks: ScheduleBlock[];
  className?: string;
}

interface InsightCard {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  status: 'good' | 'warning' | 'poor';
  improvement?: string;
}

export const ScheduleAnalytics: React.FC<ScheduleAnalyticsProps> = ({
  blocks,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'insights'>('overview');

  // Calculate analytics
  const analytics = useMemo(() => {
    return scheduleAI.generateTimeAnalytics(blocks);
  }, [blocks]);

  // Calculate insights
  const insights = useMemo((): InsightCard[] => {
    const { workLifeBalance } = analytics;
    const workHours = blocks.filter(b => b.type === 'work').reduce((sum, b) => sum + b.duration, 0) / 60;
    const sleepHours = blocks.filter(b => b.type === 'sleep').reduce((sum, b) => sum + b.duration, 0) / 60;
    const exerciseMinutes = blocks.filter(b => b.type === 'exercise').reduce((sum, b) => sum + b.duration, 0);
    const breakMinutes = blocks.filter(b => b.type === 'break').reduce((sum, b) => sum + b.duration, 0);

    return [
      {
        icon: <Brain className="w-5 h-5" />,
        title: 'Work-Life Balance',
        value: `${workLifeBalance.workPercentage}% work`,
        description: workLifeBalance.workPercentage > 50 
          ? 'High work load' 
          : workLifeBalance.workPercentage > 35 
            ? 'Balanced schedule' 
            : 'Light work day',
        status: workLifeBalance.workPercentage > 60 
          ? 'warning' 
          : workLifeBalance.workPercentage < 25 
            ? 'warning' 
            : 'good',
        improvement: workLifeBalance.workPercentage > 60 
          ? 'Consider reducing work hours or adding more breaks'
          : undefined,
      },
      {
        icon: <Heart className="w-5 h-5" />,
        title: 'Sleep Quality',
        value: `${sleepHours.toFixed(1)} hours`,
        description: sleepHours >= 7 && sleepHours <= 9 
          ? 'Optimal sleep duration' 
          : sleepHours < 6 
            ? 'Insufficient sleep' 
            : sleepHours > 10 
              ? 'Excessive sleep' 
              : 'Suboptimal sleep',
        status: sleepHours >= 7 && sleepHours <= 9 
          ? 'good' 
          : sleepHours < 6 || sleepHours > 10 
            ? 'poor' 
            : 'warning',
        improvement: sleepHours < 7 
          ? 'Aim for 7-9 hours of sleep for optimal health'
          : sleepHours > 9
            ? 'Consider reducing sleep time to increase productive hours'
            : undefined,
      },
      {
        icon: <Target className="w-5 h-5" />,
        title: 'Exercise Time',
        value: `${exerciseMinutes} minutes`,
        description: exerciseMinutes >= 30 
          ? 'Meeting daily exercise goals' 
          : exerciseMinutes > 0 
            ? 'Some physical activity' 
            : 'No exercise scheduled',
        status: exerciseMinutes >= 30 ? 'good' : exerciseMinutes > 0 ? 'warning' : 'poor',
        improvement: exerciseMinutes < 30 
          ? 'WHO recommends at least 30 minutes of daily physical activity'
          : undefined,
      },
      {
        icon: <Clock className="w-5 h-5" />,
        title: 'Break Time',
        value: `${Math.round(breakMinutes / 60 * 10) / 10}h total`,
        description: workHours > 0 
          ? `${Math.round((breakMinutes / (workHours * 60)) * 100)}% of work time`
          : 'No work scheduled',
        status: workHours > 0 && (breakMinutes / (workHours * 60)) >= 0.15 
          ? 'good' 
          : workHours > 0 && (breakMinutes / (workHours * 60)) >= 0.10 
            ? 'warning' 
            : 'poor',
        improvement: workHours > 0 && (breakMinutes / (workHours * 60)) < 0.15 
          ? 'Consider taking more breaks during work hours (15-20% recommended)'
          : undefined,
      },
    ];
  }, [blocks, analytics]);

  // Productivity score calculation
  const productivityScore = useMemo(() => {
    const goodInsights = insights.filter(i => i.status === 'good').length;
    const warningInsights = insights.filter(i => i.status === 'warning').length;
    const poorInsights = insights.filter(i => i.status === 'poor').length;
    
    const score = (goodInsights * 100 + warningInsights * 60 + poorInsights * 20) / insights.length;
    return Math.round(score);
  }, [insights]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Schedule Analytics</h3>
        </div>
        
        {/* Productivity Score */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Productivity Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(productivityScore))}>
              {productivityScore}
            </span>
          </div>
          <p className={cn("text-xs", getScoreColor(productivityScore))}>
            {getScoreStatus(productivityScore)}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'breakdown', label: 'Time Breakdown', icon: Clock },
          { id: 'insights', label: 'Insights', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main donut chart */}
              <div className="flex justify-center">
                <DonutChart
                  data={analytics.breakdown.map(item => ({
                    label: item.label,
                    value: item.minutes,
                    color: item.color,
                  }))}
                  size={280}
                  strokeWidth={25}
                  centerContent={
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalHours}h
                      </p>
                      <p className="text-sm text-gray-600">Total Time</p>
                    </div>
                  }
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">Daily Summary</h4>
                {analytics.breakdown.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.value}h</p>
                      <p className="text-xs text-gray-600">{item.percentage}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              {/* Work-Life Balance Bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Work-Life Balance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Work ({analytics.workLifeBalance.workPercentage}%)</span>
                    <span>Personal ({analytics.workLifeBalance.personalPercentage}%)</span>
                    <span>Sleep ({analytics.workLifeBalance.sleepPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-blue-500"
                        style={{ width: `${analytics.workLifeBalance.workPercentage}%` }}
                      />
                      <div
                        className="bg-green-500"
                        style={{ width: `${analytics.workLifeBalance.personalPercentage}%` }}
                      />
                      <div
                        className="bg-indigo-500"
                        style={{ width: `${analytics.workLifeBalance.sleepPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.breakdown.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center"
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <h5 className="font-semibold text-gray-900">{item.label}</h5>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}h</p>
                    <p className="text-sm text-gray-600">{item.minutes} minutes</p>
                    <p className="text-xs text-gray-500 mt-1">{item.percentage}% of day</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Health & Productivity Insights</h4>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 rounded-lg border-l-4",
                    insight.status === 'good' && "bg-green-50 border-green-400",
                    insight.status === 'warning' && "bg-yellow-50 border-yellow-400",
                    insight.status === 'poor' && "bg-red-50 border-red-400"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      insight.status === 'good' && "bg-green-100 text-green-600",
                      insight.status === 'warning' && "bg-yellow-100 text-yellow-600",
                      insight.status === 'poor' && "bg-red-100 text-red-600"
                    )}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                        <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                        {insight.status === 'good' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {insight.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                        {insight.status === 'poor' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      {insight.improvement && (
                        <p className="text-xs text-gray-500 italic">💡 {insight.improvement}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};