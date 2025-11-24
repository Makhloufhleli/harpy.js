import { createCommand } from '../commands/create';

describe('Create Command', () => {
  describe('createCommand function', () => {
    it('should be defined', () => {
      expect(createCommand).toBeDefined();
      expect(typeof createCommand).toBe('function');
    });

    it('should accept project name and options', () => {
      const commandSignature = createCommand.toString();
      expect(commandSignature).toContain('projectName');
      expect(commandSignature).toContain('options');
    });
  });
});
