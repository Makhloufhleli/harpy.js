import * as React from "react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Analytics</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          📊 Method-Level Layout Override
        </h2>
        <p className="text-gray-600 mb-4">
          This route demonstrates how you can use different layouts per route.
          Each route can specify its own layout using the layout option in
          @JsxRender:
        </p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm mb-4">
          {`@Controller('dashboard')
export class DashboardController {
  
  @Get()
  @JsxRender(DashboardPage, {
    layout: DashboardLayout,  // Use DashboardLayout
    meta: { title: 'Dashboard' }
  })
  dashboard() { return { stats: this.getStats() }; }
  
  @Get('analytics')
  @JsxRender(AnalyticsPage, {
    layout: MainLayout,  // Override with MainLayout
    meta: { title: 'Analytics' }
  })
  analytics() { return {}; }
}`}
        </pre>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-900">
          <strong>💡 Tip:</strong> This page uses DashboardLayout, but you can
          easily switch to a different layout by changing the layout option in
          @JsxRender as shown above.
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Sample Analytics Chart
        </h3>
        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
          📈 Chart Placeholder
        </div>
      </div>
    </div>
  );
}
