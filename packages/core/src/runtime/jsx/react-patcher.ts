/**
 * React Patcher - Patches React.createElement early in the module loading process
 * This MUST be imported before any components that use JSX
 */

import * as React from 'react';
import { autoWrapIfUsesClient } from './auto-wrap-middleware';

// Store original createElement
const originalCreateElement = React.createElement.bind(React);

// Track if we're currently in a render
let isInRender = false;
let renderDepth = 0;

/**
 * Wrapped createElement that auto-wraps client components
 */
const autoWrappingCreateElement = function(
  type: React.ElementType,
  props?: any,
  ...children: React.ReactNode[]
): React.ReactElement {
  // Only auto-wrap when we're in a render cycle
  if (!isInRender) {
    return originalCreateElement(type, props, ...children);
  }

  // Log createElement calls during render
  if (typeof type === 'function') {
    const typeName = (type as any).displayName || (type as any).name || 'Anonymous';
    console.log(`[React.createElement] ${typeName}`);
  }
  
  // If it's a function component (not a class component), check if it needs wrapping
  if (typeof type === 'function' && !(type as any).prototype?.isReactComponent) {
    const wrappedType = autoWrapIfUsesClient(type as React.ComponentType<any>);
    return originalCreateElement(wrappedType, props, ...children);
  }
  
  return originalCreateElement(type, props, ...children);
};

/**
 * Start intercepting createElement calls
 */
export function startRenderInterception() {
  renderDepth++;
  if (renderDepth === 1) {
    isInRender = true;
    console.log('[React Patcher] 🔌 Started intercepting createElement');
  }
}

/**
 * Stop intercepting createElement calls
 */
export function stopRenderInterception() {
  renderDepth--;
  if (renderDepth === 0) {
    isInRender = false;
    console.log('[React Patcher] ⏹️  Stopped intercepting createElement');
  }
}

/**
 * Get the original createElement (useful for manual element creation)
 */
export function getOriginalCreateElement() {
  return originalCreateElement;
}

// Try to patch React.createElement at module load time
// We try multiple approaches because React may be immutable
let patchSuccess = false;

try {
  // Approach 1: Direct assignment (works in some environments)
  (React as any).createElement = autoWrappingCreateElement;
  patchSuccess = true;
  console.log('[React Patcher] ✅ Successfully patched React.createElement (direct)');
} catch (e) {
  try {
    // Approach 2: Object.defineProperty
    Object.defineProperty(React, 'createElement', {
      value: autoWrappingCreateElement,
      writable: true,
      configurable: true,
    });
    patchSuccess = true;
    console.log('[React Patcher] ✅ Successfully patched React.createElement (defineProperty)');
  } catch (e2) {
    console.warn('[React Patcher] ⚠️  Could not patch React.createElement, will use manual wrapping');
  }
}

export { autoWrappingCreateElement, patchSuccess };
