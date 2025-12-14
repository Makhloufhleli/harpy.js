import React from 'react';
import type { JsxLayoutProps } from '../../types/jsx.types';

export interface ServerErrorPageProps extends JsxLayoutProps {
  message?: string;
  error?: string;
}

export default function Default500Page({
  message = 'Internal Server Error',
  error,
}: ServerErrorPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center bg-white rounded-2xl shadow-2xl p-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg mb-6">
            <span className="text-5xl font-bold text-white">H</span>
          </div>
        </div>
        
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 mb-4">
          500
        </h1>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{message}</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details</h3>
                <pre className="text-xs text-red-800 font-mono whitespace-pre-wrap break-words">{error}</pre>
              </div>
            </div>
          </div>
        )}
        
        <a
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Homepage
        </a>
        
        <p className="mt-12 text-sm text-gray-500">
          Powered by <span className="text-red-600 font-semibold">Harpy.js</span>
        </p>
      </div>
    </div>
  );
}
