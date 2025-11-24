import { withJsxEngine } from '../jsx.engine';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import * as React from 'react';

describe('JSX Engine', () => {
  let mockApp: NestFastifyApplication;
  let mockAdapter: any;
  let mockReply: any;

  beforeEach(() => {
    mockReply = {
      raw: {
        end: jest.fn(),
        write: jest.fn(),
        setHeader: jest.fn(),
        headersSent: false,
      },
      statusCode: 200,
      request: {},
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockAdapter = {
      render: null,
    };

    mockApp = {
      getHttpAdapter: jest.fn().mockReturnValue(mockAdapter),
    } as unknown as NestFastifyApplication;
  });

  describe('withJsxEngine', () => {
    it('should attach render method to the adapter', () => {
      const mockLayout = (props: any) => React.createElement('html', null, props.children);
      
      withJsxEngine(mockApp, mockLayout);
      
      expect(mockAdapter.render).toBeDefined();
      expect(typeof mockAdapter.render).toBe('function');
    });

    it('should handle redirect status codes without rendering', async () => {
      const mockLayout = (props: any) => React.createElement('html', null, props.children);
      withJsxEngine(mockApp, mockLayout);

      mockReply.statusCode = 301;
      
      await mockAdapter.render(mockReply, [() => React.createElement('div'), {}], {});
      
      expect(mockReply.raw.end).toHaveBeenCalled();
    });

    it('should handle error status codes without rendering', async () => {
      const mockLayout = (props: any) => React.createElement('html', null, props.children);
      withJsxEngine(mockApp, mockLayout);

      mockReply.statusCode = 500;
      
      await mockAdapter.render(mockReply, [() => React.createElement('div'), {}], {});
      
      expect(mockReply.raw.end).toHaveBeenCalled();
    });

    it('should accept custom layout in options', () => {
      const defaultLayout = (props: any) => React.createElement('html', null, React.createElement('body', null, props.children));
      const customLayout = (props: any) => React.createElement('html', null, React.createElement('main', null, props.children));
      
      withJsxEngine(mockApp, defaultLayout);
      
      expect(mockAdapter.render).toBeDefined();
      expect(typeof customLayout).toBe('function');
    });

    it('should support component props', () => {
      const mockLayout = (props: any) => React.createElement('html', null, props.children);
      withJsxEngine(mockApp, mockLayout);

      const component = (props: any) => React.createElement('div', null, `Hello ${props.name}`);
      const rendered = component({ name: 'Harpy' });
      
      expect(rendered.props.children).toContain('Harpy');
    });
  });

  describe('React rendering', () => {
    it('should render simple React components', () => {
      const element = React.createElement('div', null, 'Hello World');
      expect(element).toBeDefined();
      expect(element.type).toBe('div');
    });

    it('should render nested components', () => {
      const child = React.createElement('span', null, 'Child');
      const parent = React.createElement('div', null, child);
      
      expect(parent).toBeDefined();
      expect(parent.type).toBe('div');
    });

    it('should handle component props', () => {
      const element = React.createElement('div', { className: 'test', id: 'main' }, 'Content');
      
      expect(element.props.className).toBe('test');
      expect(element.props.id).toBe('main');
    });
  });
});
