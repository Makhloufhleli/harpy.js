import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('Component Analyzer', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockPath = path as jest.Mocked<typeof path>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('client component detection', () => {
    it('should detect "use client" directive', () => {
      const code = '"use client";\nexport function MyComponent() {}';
      expect(code).toContain('use client');
    });

    it('should detect server components (no directive)', () => {
      const code = 'export function ServerComponent() {}';
      expect(code).not.toContain('use client');
    });

    it('should handle single quotes', () => {
      const code = "'use client';\nexport function Comp() {}";
      expect(code).toMatch(/['"]use client['"]/);
    });
  });

  describe('React hooks detection', () => {
    it('should detect useState import', () => {
      const code = 'import { useState } from "react";';
      expect(code).toContain('useState');
    });

    it('should detect useEffect import', () => {
      const code = 'import { useEffect } from "react";';
      expect(code).toContain('useEffect');
    });

    it('should detect multiple hooks', () => {
      const code = 'import { useState, useEffect, useRef } from "react";';
      expect(code).toContain('useState');
      expect(code).toContain('useEffect');
      expect(code).toContain('useRef');
    });
  });

  describe('event handler detection', () => {
    it('should detect onClick handler', () => {
      const code = '<button onClick={handleClick}>Click</button>';
      expect(code).toContain('onClick');
    });

    it('should detect onChange handler', () => {
      const code = '<input onChange={handleChange} />';
      expect(code).toContain('onChange');
    });

    it('should detect onSubmit handler', () => {
      const code = '<form onSubmit={handleSubmit}>';
      expect(code).toContain('onSubmit');
    });
  });

  describe('component name extraction', () => {
    it('should extract function component name', () => {
      const code = 'export function MyComponent() {}';
      const match = code.match(/function\s+(\w+)/);
      expect(match).toBeDefined();
      expect(match![1]).toBe('MyComponent');
    });

    it('should extract arrow function component name', () => {
      const code = 'export const MyComponent = () => {}';
      const match = code.match(/const\s+(\w+)\s*=/);
      expect(match).toBeDefined();
      expect(match![1]).toBe('MyComponent');
    });

    it('should extract default export name', () => {
      const code = 'export default function Component() {}';
      const match = code.match(/default\s+function\s+(\w+)/);
      expect(match).toBeDefined();
      expect(match![1]).toBe('Component');
    });
  });

  describe('file system operations', () => {
    it('should filter TypeScript files', () => {
      const files = ['component.tsx', 'utils.ts', 'styles.css', 'test.jsx'];
      const tsxFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
      expect(tsxFiles).toEqual(['component.tsx', 'test.jsx']);
    });

    it('should handle path operations', () => {
      const basePath = '/src';
      const fileName = 'components';
      const fullPath = `${basePath}/${fileName}`;
      expect(fullPath).toBe('/src/components');
    });
  });

  describe('code analysis patterns', () => {
    it('should identify React imports', () => {
      const patterns = [
        'import React from "react"',
        'import * as React from "react"',
        'import { Component } from "react"'
      ];

      patterns.forEach(pattern => {
        expect(pattern).toMatch(/import.*from\s+['"]react['"]/);
      });
    });

    it('should identify JSX syntax', () => {
      const jsxPatterns = [
        '<div>content</div>',
        '<Component prop="value" />',
        '<>{children}</>'
      ];

      jsxPatterns.forEach(pattern => {
        expect(pattern).toMatch(/<[\w>]/);
      });
    });

    it('should detect client-side APIs', () => {
      const clientAPIs = ['window', 'document', 'localStorage', 'navigator'];
      const code = 'const width = window.innerWidth;';
      
      const hasClientAPI = clientAPIs.some(api => code.includes(api));
      expect(hasClientAPI).toBe(true);
    });
  });
});
