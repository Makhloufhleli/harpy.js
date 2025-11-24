import * as React from 'react';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Analytics</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          📊 Method-Level Layout Override
        </h2>
        <p className="text-gray-600 mb-4">
          This route demonstrates how you can override layouts per route.
          While the controller uses DashboardLayout, individual routes can specify different layouts:
        </p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`@Controller('dashboard')
@WithLayout(DashboardLayout)  // Controller-level default
export class DashboardController {
  
  @Get('analytics')
  @WithLayout(MainLayout)  // Method-level override
  getAnalytics() {
    return { view: AnalyticsPage };
  }
}`}
        </pre>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
          <strong>⚠️ Note:</strong> This page is currently using DashboardLayout (controller-level),
          but you can easily switch it to a different layout by adding the method-level decorator as shown above.
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Sample Analytics Chart</h3>
        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
          📈 Chart Placeholder
        </div>
      </div>
    </div>
  );
}
