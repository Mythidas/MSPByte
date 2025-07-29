'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tables } from '@/db/schema';
import { prettyText } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  User,
  Building,
  Shield,
  Activity,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import CopyToClipboard from '@/components/shared/CopyToClipboard';

type ActivityFeed = Tables<'activity_feeds_view'>;

interface Props {
  activity: ActivityFeed;
  children: React.ReactNode;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'failed':
    case 'error':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'pending':
    case 'in_progress':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'default';
    case 'failed':
    case 'error':
      return 'destructive';
    case 'pending':
    case 'in_progress':
      return 'secondary';
    case 'warning':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    auth: 'bg-blue-100 text-blue-800',
    sync: 'bg-green-100 text-green-800',
    integration: 'bg-purple-100 text-purple-800',
    user: 'bg-orange-100 text-orange-800',
    system: 'bg-gray-100 text-gray-800',
    security: 'bg-red-100 text-red-800',
  };
  return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

function MetadataRenderer({ data, level = 0 }: { data: unknown; level?: number }) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderValue = (key: string, value: unknown, currentLevel: number) => {
    const indent = currentLevel;

    if (value === null || value === undefined) {
      return (
        <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
          <span className="text-sm font-medium">{prettyText(key)}:</span>
          <span className="text-sm">null</span>
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
          <span className="text-sm font-medium">{prettyText(key)}:</span>
          <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
            {value ? 'true' : 'false'}
          </Badge>
        </div>
      );
    }

    if (typeof value === 'string' || typeof value === 'number') {
      // Special handling for status fields
      if (key.toLowerCase() === 'status') {
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
            {getStatusIcon(value.toString())}
            <span className="text-sm font-medium">{prettyText(key)}:</span>
            <Badge variant={getStatusBadgeVariant(value.toString())}>
              {prettyText(value.toString())}
            </Badge>
          </div>
        );
      }

      // Special handling for passwords (mask them)
      if (key.toLowerCase().includes('password')) {
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
            <span className="text-sm font-medium">{prettyText(key)}:</span>
            <span>
              <span>{'*'.repeat(12)}</span> <CopyToClipboard value={value as string} />
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
          <span className="text-sm font-medium">{prettyText(key)}:</span>
          <span className="text-sm break-all flex gap-2">
            <span>{value}</span> <CopyToClipboard value={value as string} />
          </span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(`${currentLevel}-${key}`);
      return (
        <div style={{ paddingLeft: indent }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpanded(`${currentLevel}-${key}`)}
            className="h-6 p-1 mb-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span className="text-sm font-medium">{prettyText(key)}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {value.length} items
            </Badge>
          </Button>
          {isExpanded && (
            <div className="mt-2 space-y-2 border-l-1 border-muted-foreground pl-4">
              {value.map((item, index) => (
                <div key={index}>
                  <div className="text-xs mb-1">Item {index + 1}</div>
                  {typeof item === 'object' && item !== null ? (
                    <MetadataRenderer data={item} level={currentLevel + 1} />
                  ) : (
                    <span className="text-sm">{String(item)}</span>
                  )}
                  {index < value.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      const isExpanded = expandedKeys.has(`${currentLevel}-${key}`);
      return (
        <div style={{ paddingLeft: indent }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpanded(`${currentLevel}-${key}`)}
            className="h-6 p-1 mb-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span className="text-sm font-medium">{prettyText(key)}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {Object.keys(value).length} fields
            </Badge>
          </Button>
          {isExpanded && (
            <div className="mt-2 space-y-3 border-l-1 border-muted-foreground pl-4">
              <MetadataRenderer data={value} level={currentLevel + 1} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
        <span className="text-sm font-medium">{prettyText(key)}:</span>
        <span className="text-sm">{String(value)}</span>
      </div>
    );
  };

  if (!data || typeof data !== 'object') {
    return <div className="text-sm">No data available</div>;
  }

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>{renderValue(key, value, level)}</div>
      ))}
    </div>
  );
}

export default function ActivityFeedDrawer({ activity, children }: Props) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        data-vaul-no-drag
        className="h-full !max-w-[600px] fixed right-0 top-0 mt-0 rounded-none"
      >
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5" />
            <div>
              <DrawerTitle className="text-left">{prettyText(activity.action!)}</DrawerTitle>
              <DrawerDescription className="text-left">
                Activity Details • {new Date(activity.created_at || '').toDateString()}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-120px)] p-4">
          <div className="grid gap-4">
            {/* Status and Type */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(activity.status!)}
                <Badge variant={getStatusBadgeVariant(activity.status!)}>
                  {prettyText(activity.status!)}
                </Badge>
              </div>
              <Badge
                className={cn('font-medium', getTypeBadgeColor(activity.type!))}
                variant="secondary"
              >
                {prettyText(activity.type!)}
              </Badge>
              {activity.is_admin && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold">Summary</h3>
              <p className="text-sm leading-relaxed">{activity.summary}</p>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold">Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Trigger Source:</span>
                  <Badge variant="outline" className="text-xs">
                    {prettyText(activity.trigger_source!)}
                  </Badge>
                </div>

                {activity.site_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">Site:</span>
                    <span>{activity.site_name}</span>
                    <Link href={`/sites/${activity.site_slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4 hover:text-primary" />
                    </Link>
                  </div>
                )}

                {activity.user_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">User:</span>
                    {activity.user_email}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">
                    {new Date(activity.created_at || '').toDateString()}
                  </span>
                </div>

                {activity.updated_at !== activity.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Updated:</span>
                    <span className="text-sm">
                      {new Date(activity.updated_at || '').toDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Metadata</h3>
                  <div className="rounded-lg">
                    <MetadataRenderer data={activity.metadata} />
                  </div>
                </div>
              </>
            )}

            {/* Raw Data (for debugging) */}
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Raw Data</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(activity, null, 2)}</pre>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
