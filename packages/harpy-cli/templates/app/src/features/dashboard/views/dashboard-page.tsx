import * as React from 'react';

export type DashboardPageProps = {
  stats: {
    users: number;
    revenue: number;
    projects: number;
  };
};

export default function DashboardPage({ stats }: DashboardPageProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-slate-700">{stats.users.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-sm text-gray-600 mb-1">Revenue</div>
          <div className="text-3xl font-bold text-slate-700">${stats.revenue.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-sm text-gray-600 mb-1">Active Projects</div>
          <div className="text-3xl font-bold text-slate-700">{stats.projects}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          About Dashboard Layout
        </h2>
        <p className="text-gray-600 mb-4">
          This page uses the <strong>DashboardLayout</strong> with a sidebar navigation.
          The layout is defined at the controller level:
        </p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
{`@Controller('dashboard')
@WithLayout(DashboardLayout)
export class DashboardController {
  // All routes use DashboardLayout
}`}
        </pre>
      </div>
    </div>
  );
}
