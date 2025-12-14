import React from 'react';
import type { JsxLayoutProps } from '../../types/jsx.types';

export interface NotFoundPageProps extends JsxLayoutProps {
  path?: string;
  message?: string;
}

export default function Default404Page({
  path,
  message = 'Page Not Found',
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center bg-white rounded-2xl shadow-2xl p-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg mb-6">
            <span className="text-5xl font-bold text-white">H</span>
          </div>
        </div>
        
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{message}</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {path && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
            <p className="font-mono text-sm text-gray-700">
              <span className="text-gray-500">Requested path:</span>{' '}
              <span className="text-purple-600 font-semibold">{path}</span>
            </p>
          </div>
        )}
        
        <a
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Homepage
        </a>
        
        <p className="mt-12 text-sm text-gray-500">
          Powered by <span className="text-purple-600 font-semibold">Harpy.js</span>
        </p>
      </div>
    </div>
  );
}
