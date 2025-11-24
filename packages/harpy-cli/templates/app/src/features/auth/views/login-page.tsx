import * as React from 'react';

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Sign In</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input 
          type="email" 
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input 
          type="password" 
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
        Sign In
      </button>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/auth/register" className="text-blue-700 font-medium hover:underline">
          Sign up
        </a>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
        <strong>💡 Layout Notice:</strong> This page uses the <strong>AuthLayout</strong> 
        by passing it as an option to <code className="bg-blue-100 px-1 rounded">@JsxRender(LoginPage, {'{ layout: AuthLayout }'})</code>.
      </div>
    </div>
  );
}
