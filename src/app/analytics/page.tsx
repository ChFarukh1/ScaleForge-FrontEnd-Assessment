'use client';

import { useState } from 'react';

// Define proper types for mock data
type MockDataPeriod = '7d' | '30d' | '90d';
type MockDataMetric = 'members' | 'activity' | 'performance';

interface MockData {
  members: Record<MockDataPeriod, { growth: number; total: number; active: number }>;
  activity: Record<MockDataPeriod, { sessions: number; avgDuration: string; retention: string }>;
  performance: Record<MockDataPeriod, { responseTime: string; uptime: string; errors: string }>;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<MockDataPeriod>('7d');
  const [selectedMetric, setSelectedMetric] = useState<MockDataMetric>('members');

  // Mock analytics data
  const mockData: MockData = {
    members: {
      '7d': { growth: 12, total: 1247, active: 1189 },
      '30d': { growth: 45, total: 1247, active: 1189 },
      '90d': { growth: 156, total: 1247, active: 1189 }
    },
    activity: {
      '7d': { sessions: 2847, avgDuration: '12m 34s', retention: '78%' },
      '30d': { sessions: 12456, avgDuration: '11m 42s', retention: '82%' },
      '90d': { sessions: 45678, avgDuration: '13m 21s', retention: '75%' }
    },
    performance: {
      '7d': { responseTime: '245ms', uptime: '99.9%', errors: '0.1%' },
      '30d': { responseTime: '267ms', uptime: '99.8%', errors: '0.2%' },
      '90d': { responseTime: '289ms', uptime: '99.7%', errors: '0.3%' }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View performance metrics and insights
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="mt-4 sm:mt-0 flex space-x-2">
          {(['7d', '30d', '90d'] as MockDataPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex space-x-4">
        {([
          { key: 'members' as const, label: 'Member Growth', icon: '👥' },
          { key: 'activity' as const, label: 'Activity Metrics', icon: '📊' },
          { key: 'performance' as const, label: 'Performance Reports', icon: '⚡' }
        ]).map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedMetric === metric.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span>{metric.icon}</span>
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedMetric === 'members' && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Growth
                </h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                +{mockData.members[selectedPeriod].growth}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                New members this period
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Members
                </h3>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {mockData.members[selectedPeriod].total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                All time members
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Members
                </h3>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {mockData.members[selectedPeriod].active.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Currently active
              </p>
            </div>
          </>
        )}

        {selectedMetric === 'activity' && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sessions
                </h3>
                <span className="text-2xl">🔄</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {mockData.activity[selectedPeriod].sessions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                User sessions this period
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Avg Duration
                </h3>
                <span className="text-2xl">⏱️</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {mockData.activity[selectedPeriod].avgDuration}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Per session
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Retention
                </h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {mockData.activity[selectedPeriod].retention}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                User retention rate
              </p>
            </div>
          </>
        )}

        {selectedMetric === 'performance' && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Response Time
                </h3>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {mockData.performance[selectedPeriod].responseTime}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Average API response
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uptime
                </h3>
                <span className="text-2xl">🟢</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {mockData.performance[selectedPeriod].uptime}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                System availability
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Error Rate
                </h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {mockData.performance[selectedPeriod].errors}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Error percentage
              </p>
            </div>
          </>
        )}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedMetric === 'members' && 'Member Growth Trend'}
          {selectedMetric === 'activity' && 'User Activity Timeline'}
          {selectedMetric === 'performance' && 'System Performance Metrics'}
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              Chart visualization would be displayed here
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Using {selectedPeriod} data for {selectedMetric}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
