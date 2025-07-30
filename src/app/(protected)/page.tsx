'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function MSPByteDashboard() {
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
        </CardHeader>
      </Card>
    </main>
  );
}
