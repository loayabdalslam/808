"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserStats {
  totalStats: {
    totalGenerations: number;
    totalCharacters: number;
    totalDuration: number;
  };
  monthlyUsage: {
    charactersUsed: number;
    charactersLimit: number;
    charactersPercentage: number;
    apiCalls: number;
    apiCallsLimit: number;
    apiCallsPercentage: number;
    audioGenerated: number;
  };
  recentActivity: Array<{
    action: string;
    time: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}.${Math.floor(minutes / 6)} hrs`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">!</div>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Generations",
      value: formatNumber(userStats?.totalStats.totalGenerations || 0),
      change: "+12%",
      changeType: "positive",
      icon: "🎤",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Characters Used",
      value: formatNumber(userStats?.totalStats.totalCharacters || 0),
      change: "+8%",
      changeType: "positive",
      icon: "📝",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Audio Generated",
      value: formatDuration(userStats?.totalStats.totalDuration || 0),
      change: "+15%",
      changeType: "positive",
      icon: "🎵",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "API Calls",
      value: formatNumber(userStats?.monthlyUsage.apiCalls || 0),
      change: "+5%",
      changeType: "positive",
      icon: "⚡",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    {
      name: "Text to Speech",
      description: "Convert text into natural speech",
      href: "/app/tts",
      icon: "🎤",
      gradient: "from-purple-600 to-blue-600",
    },
    {
      name: "Multi-Speaker",
      description: "Create conversations with multiple voices",
      href: "/app/multi-speaker",
      icon: "👥",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      name: "View History",
      description: "Browse your generated content",
      href: "/app/history",
      icon: "📚",
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-white/80 text-lg">
                Ready to create amazing voice content with AI?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl">
                🎵
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/app/tts"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-medium"
            >
              🚀 Get Started
            </Link>
            <Link
              href="/docs"
              className="border border-white/20 hover:bg-white/10 transition-colors px-6 py-3 rounded-xl font-medium"
            >
              📖 View Docs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive'
                    ? 'text-green-700 bg-green-100'
                    : 'text-red-700 bg-red-100'
                }`}>
                  {stat.change}
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">Jump into your most used features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative overflow-hidden bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white text-2xl mb-4`}>
                  {action.icon}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                  Get started
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {(userStats?.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{activity.action}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
            {(!userStats?.recentActivity || userStats.recentActivity.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start generating voice content to see activity here</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Characters Used</span>
                <span className="font-medium">
                  {userStats?.monthlyUsage.charactersUsed.toLocaleString() || 0} / {userStats?.monthlyUsage.charactersLimit.toLocaleString() || 100000}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(userStats?.monthlyUsage.charactersPercentage || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">API Calls</span>
                <span className="font-medium">
                  {userStats?.monthlyUsage.apiCalls || 0} / {userStats?.monthlyUsage.apiCallsLimit || 2000}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                  style={{ width: `${Math.min(userStats?.monthlyUsage.apiCallsPercentage || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
