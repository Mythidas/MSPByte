'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Shield,
  Users,
  Server,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Smartphone,
  Wifi,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Page() {
  return <strong>Dashboard</strong>;

  // Mock data for the dashboard
  const criticalAlerts = [
    {
      id: 1,
      source: 'Sophos',
      type: 'Security',
      message: 'Ransomware detected on DESKTOP-ABC123',
      severity: 'critical',
      time: '2 min ago',
    },
    {
      id: 2,
      source: 'M365',
      type: 'License',
      message: '5 users over license limit',
      severity: 'high',
      time: '15 min ago',
    },
    {
      id: 3,
      source: 'AutoTask',
      type: 'Ticket',
      message: 'SLA breach imminent - Ticket #12345',
      severity: 'high',
      time: '32 min ago',
    },
    {
      id: 4,
      source: 'Network',
      type: 'Infrastructure',
      message: 'Primary DC connection unstable',
      severity: 'medium',
      time: '1 hr ago',
    },
  ];

  const systemHealth = {
    m365: { status: 'healthy', uptime: 99.9, users: 1247, issues: 2 },
    sophos: { status: 'warning', uptime: 98.7, endpoints: 892, threats: 12 },
    autotask: { status: 'healthy', uptime: 99.8, tickets: 156, overdue: 8 },
    network: { status: 'critical', uptime: 97.2, devices: 234, offline: 5 },
  };

  const recentActivity = [
    { action: 'New threat blocked', source: 'Sophos', time: '5 min ago', type: 'security' },
    { action: 'Ticket resolved', source: 'AutoTask', time: '12 min ago', type: 'success' },
    { action: 'License warning', source: 'M365', time: '18 min ago', type: 'warning' },
    { action: 'Backup completed', source: 'Infrastructure', time: '25 min ago', type: 'success' },
    { action: 'User onboarded', source: 'M365', time: '34 min ago', type: 'info' },
    { action: 'Security scan started', source: 'Sophos', time: '41 min ago', type: 'info' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <ScrollArea className="flex flex-col w-full h-11/12 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-xs text-gray-500">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +3 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-gray-500">
                <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
                -8 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-gray-500">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +12 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98.7%</div>
              <p className="text-xs text-gray-500">Average uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle>Critical Alerts</CardTitle>
              </div>
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            </div>
            <CardDescription className="text-red-500">Immediate attention required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.source} • {alert.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{alert.time}</span>
                    <Button size="sm" variant="outline">
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Real-time status of all integrated services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Microsoft 365</p>
                    <p className="text-sm text-gray-500">
                      {systemHealth.m365.users} users • {systemHealth.m365.issues} issues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(systemHealth.m365.status)}>
                    {systemHealth.m365.uptime}%
                  </span>
                  <span className={getStatusColor(systemHealth.m365.status)}>
                    {getStatusIcon(systemHealth.m365.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Sophos Security</p>
                    <p className="text-sm text-gray-500">
                      {systemHealth.sophos.endpoints} endpoints • {systemHealth.sophos.threats}{' '}
                      threats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(systemHealth.sophos.status)}>
                    {systemHealth.sophos.uptime}%
                  </span>
                  <span className={getStatusColor(systemHealth.sophos.status)}>
                    {getStatusIcon(systemHealth.sophos.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">AutoTask PSA</p>
                    <p className="text-sm text-gray-500">
                      {systemHealth.autotask.tickets} tickets • {systemHealth.autotask.overdue}{' '}
                      overdue
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(systemHealth.autotask.status)}>
                    {systemHealth.autotask.uptime}%
                  </span>
                  <span className={getStatusColor(systemHealth.autotask.status)}>
                    {getStatusIcon(systemHealth.autotask.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Network Infrastructure</p>
                    <p className="text-sm text-gray-500">
                      {systemHealth.network.devices} devices • {systemHealth.network.offline}{' '}
                      offline
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(systemHealth.network.status)}>
                    {systemHealth.network.uptime}%
                  </span>
                  <span className={getStatusColor(systemHealth.network.status)}>
                    {getStatusIcon(systemHealth.network.status)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions across all systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === 'security'
                          ? 'bg-red-500'
                          : activity.type === 'success'
                            ? 'bg-green-500'
                            : activity.type === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.source}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity <Eye className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Items Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Immediate Actions</CardTitle>
              <CardDescription>Urgent tasks requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3  border  rounded-lg">
                <p className="font-medium text-red-900">Address ransomware detection</p>
                <p className="text-sm text-red-700">Investigate and contain threat</p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  Take Action
                </Button>
              </div>
              <div className="p-3  border  rounded-lg">
                <p className="font-medium text-orange-900">Resolve license overage</p>
                <p className="text-sm text-orange-700">Purchase additional M365 licenses</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Scheduled Tasks</CardTitle>
              <CardDescription>Upcoming maintenance and reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Monthly security review</p>
                <p className="text-sm text-gray-600">Due in 3 days</p>
                <Progress value={75} className="mt-2" />
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Backup verification</p>
                <p className="text-sm text-gray-600">Due tomorrow</p>
                <Progress value={25} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Optimization</CardTitle>
              <CardDescription>Performance improvement opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">License optimization</p>
                <p className="text-sm text-gray-600">Potential $2,400/month savings</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Analyze
                </Button>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Security posture review</p>
                <p className="text-sm text-gray-600">12 recommendations pending</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
