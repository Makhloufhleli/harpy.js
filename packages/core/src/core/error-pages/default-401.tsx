import React from 'react';
import type { JsxLayoutProps } from '../../types/jsx.types';

export interface UnauthorizedPageProps extends JsxLayoutProps {
  message?: string;
}

export default function Default401Page({
  message = 'Unauthorized',
}: UnauthorizedPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center bg-white rounded-2xl shadow-2xl p-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full shadow-lg mb-6">
            <span className="text-5xl">🔒</span>
          </div>
        </div>
        
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 mb-4">
          401
        </h1>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{message}</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          You need to be authenticated to access this resource.
        </p>
        
        <a
          href="/login"
          className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Login
        </a>
        
        <p className="mt-12 text-sm text-gray-500">
          Powered by <span className="text-orange-600 font-semibold">Harpy.js</span>
        </p>
      </div>
    </div>
  );
}
