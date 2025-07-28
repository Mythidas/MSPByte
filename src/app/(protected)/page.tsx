'use client';

import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Monitor,
  Server,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  HardDrive,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Display from '@/components/shared/Display';

export default function MSPByteDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample data for charts
  const networkData = [
    { name: 'Mon', uptime: 99.8, incidents: 2 },
    { name: 'Tue', uptime: 99.9, incidents: 1 },
    { name: 'Wed', uptime: 98.2, incidents: 5 },
    { name: 'Thu', uptime: 99.7, incidents: 2 },
    { name: 'Fri', uptime: 99.9, incidents: 1 },
    { name: 'Sat', uptime: 100, incidents: 0 },
    { name: 'Sun', uptime: 99.6, incidents: 3 },
  ];

  const clientDistribution = [
    { name: 'Enterprise', value: 45, color: '#3b82f6' },
    { name: 'SMB', value: 35, color: '#10b981' },
    { name: 'Startup', value: 20, color: '#f59e0b' },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Server CPU usage above 90%',
      client: 'TechCorp Inc',
      time: '2 min ago',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Backup failed for database server',
      client: 'StartupXYZ',
      time: '15 min ago',
    },
    {
      id: 3,
      type: 'info',
      message: 'Software update completed',
      client: 'MegaCorp',
      time: '1 hour ago',
    },
  ];

  return (
    <main className="flex flex-col size-full gap-4">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl border border-white/10 ">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">MSP Byte</h1>
                <p className="text-slate-300">Data Aggregation Dashboard</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg">
              Your unified view across all client environments and data sources
            </p>
          </CardTitle>
          <CardDescription className="flex flex-col items-center w-36 gap-2">
            <Display>
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </Display>
            {false && (
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full">
                  <SelectValue defaultValue="24h" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {false && (
        <ScrollArea className="max-h-5/6">
          <div className="grid gap-2 px-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Clients</p>
                    <p className="text-3xl font-bold text-white">247</p>
                    <p className="text-green-400 text-sm flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Devices Monitored</p>
                    <p className="text-3xl font-bold text-white">1,847</p>
                    <p className="text-green-400 text-sm flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      98.7% healthy
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Active Alerts</p>
                    <p className="text-3xl font-bold text-white">23</p>
                    <p className="text-yellow-400 text-sm flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 mr-1" />5 critical
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Data Sources</p>
                    <p className="text-3xl font-bold text-white">47</p>
                    <p className="text-purple-400 text-sm flex items-center mt-2">
                      <Database className="w-4 h-4 mr-1" />
                      All connected
                    </p>
                    p[;]
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Server className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Network Uptime Chart */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Network Uptime</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-400">Uptime %</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={networkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[95, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uptime"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Client Distribution */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Client Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {clientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Alerts */}
              <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
                </div>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === 'critical'
                            ? 'bg-red-500'
                            : alert.type === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-slate-400 text-sm">{alert.client}</p>
                          <p className="text-slate-500 text-sm">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors">
                    <Search className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Search Logs</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-colors">
                    <Download className="w-5 h-5 text-green-400" />
                    <span className="text-white">Export Reports</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-colors">
                    <Filter className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Filter Data</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg border border-orange-500/30 transition-colors">
                    <Shield className="w-5 h-5 text-orange-400" />
                    <span className="text-white">Security Scan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Data Sources Status */}
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Connected Data Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'RMM Tools', status: 'connected', count: 12, icon: Monitor },
                  { name: 'Network Devices', status: 'connected', count: 45, icon: Wifi },
                  { name: 'Storage Systems', status: 'warning', count: 8, icon: HardDrive },
                  { name: 'Security Tools', status: 'connected', count: 15, icon: Shield },
                ].map((source, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <source.icon className="w-8 h-8 text-slate-400" />
                      <div
                        className={`w-3 h-3 rounded-full ${
                          source.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      ></div>
                    </div>
                    <h4 className="text-white font-medium">{source.name}</h4>
                    <p className="text-slate-400 text-sm">{source.count} sources</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </main>
  );
}
