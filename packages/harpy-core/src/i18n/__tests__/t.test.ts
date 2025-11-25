import { t, tUnsafe } from '../t';

describe('Translation Function (t)', () => {
  const mockDict = {
    simple: 'Hello',
    nested: {
      key: 'Nested value',
      deep: {
        value: 'Deep nested value',
      },
    },
    withVar: 'Hello {{name}}!',
    withMultipleVars: 'Hello {{name}}, you have {{count}} messages',
  };

  describe('Simple translations', () => {
    it('should translate simple key', () => {
      expect(t(mockDict, 'simple')).toBe('Hello');
    });

    it('should translate nested key', () => {
      expect(t(mockDict, 'nested.key')).toBe('Nested value');
    });

    it('should translate deeply nested key', () => {
      expect(t(mockDict, 'nested.deep.value')).toBe('Deep nested value');
    });
  });

  describe('Variable interpolation', () => {
    it('should interpolate single variable', () => {
      expect(t(mockDict as any, 'withVar', { name: 'John' })).toBe('Hello John!');
    });

    it('should interpolate multiple variables', () => {
      expect(
        t(mockDict as any, 'withMultipleVars', { name: 'John', count: 5 }),
      ).toBe('Hello John, you have 5 messages');
    });

    it('should handle missing variables gracefully', () => {
      expect(t(mockDict as any, 'withVar', {} as any)).toBe('Hello !');
    });

    it('should handle numeric variables', () => {
      expect(
        t(mockDict as any, 'withMultipleVars', { name: 'John', count: 0 }),
      ).toBe('Hello John, you have 0 messages');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for non-existent key', () => {
      expect(t(mockDict, 'nonexistent' as any)).toBe('');
    });

    it('should return empty string for non-string value', () => {
      expect(t(mockDict, 'nested' as any)).toBe('');
    });

    it('should handle empty dictionary', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(t({} as any, 'any')).toBe('');
    });
  });

  describe('tUnsafe function', () => {
    it('should work with dynamic keys', () => {
      expect(tUnsafe(mockDict, 'simple')).toBe('Hello');
    });

    it('should work with nested keys', () => {
      expect(tUnsafe(mockDict, 'nested.key')).toBe('Nested value');
    });

    it('should interpolate variables', () => {
      expect(tUnsafe(mockDict, 'withVar', { name: 'Jane' })).toBe(
        'Hello Jane!',
      );
    });

    it('should handle non-existent keys', () => {
      expect(tUnsafe(mockDict, 'invalid.key')).toBe('');
    });
  });
});
