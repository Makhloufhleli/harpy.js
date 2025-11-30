import { createCommand } from '../commands/create';
import * as fs from 'fs-extra';
import prompts from 'prompts';
import execa = require('execa');

jest.mock('fs-extra');
jest.mock('prompts');
jest.mock('execa');

const mockedFs = fs as unknown as jest.Mocked<typeof fs>;
const mockedPrompts = prompts as unknown as jest.MockedFunction<typeof prompts>;
const mockedExeca = execa as unknown as jest.MockedFunction<typeof execa>;

describe('createCommand integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // Default execa to resolve
    (mockedExeca as any).mockResolvedValue({ stdout: '', stderr: '' });

    // Default prompts: first select package manager, then confirm i18n
    (mockedPrompts as any).mockImplementation(async (questions: any) => {
      const q = Array.isArray(questions) ? questions[0] : questions;
      if (q && q.name === 'packageManager') {
        return { packageManager: 'pnpm' } as any;
      }
      if (q && q.name === 'includeI18n') {
        return { includeI18n: true } as any;
      }
      return {} as any;
    });

    // existsSync: return false for the project root check, true for template files
    (mockedFs as any).existsSync.mockImplementation((p: fs.PathLike) => {
      const s = String(p);
      if (s.endsWith('/my-app')) return false; // project doesn't exist
      // simulate template files exist
      if (s.includes('templates/app')) return true;
      // simulate copied files and package.json/tsconfig exist
      if (s.includes('package.json') || s.includes('tsconfig.json') || s.includes('src')) return true;
      return false;
    });

    // No-op for copy and file ops
    (mockedFs as any).copySync.mockImplementation(() => {});
    (mockedFs as any).copyFileSync.mockImplementation(() => {});
    (mockedFs as any).readJsonSync.mockImplementation((p: any) => ({ scripts: {} } as any));
    (mockedFs as any).writeJsonSync.mockImplementation(() => {});
    (mockedFs as any).readFileSync.mockImplementation(() => '');
    (mockedFs as any).writeFileSync.mockImplementation(() => {});
    (mockedFs as any).removeSync.mockImplementation(() => {});
    (mockedFs as any).unlinkSync.mockImplementation(() => {});
  });

  it('creates project with i18n and skips installs/git when requested', async () => {
    // Run with skipInstall and skipGit to avoid running heavy commands
    await expect(createCommand('my-app', { includeI18n: true, skipInstall: true, skipGit: true })).resolves.toBeUndefined();

    // execa should still be called for the NestJS scaffold (npx)
    expect((mockedExeca as any)).toHaveBeenCalled();

    // fs.copySync should be called to copy templates
    expect((mockedFs as any).copySync).toHaveBeenCalled();

    // package.json should be read and written
    expect((mockedFs as any).readJsonSync).toHaveBeenCalled();
    expect((mockedFs as any).writeJsonSync).toHaveBeenCalled();
  });

  it('creates project without i18n and strips i18n templates', async () => {
    // Make prompts return false for i18n confirm
    (mockedPrompts as any).mockImplementation(async (q: any) => (q && q.name === 'packageManager' ? { packageManager: 'pnpm' } : { includeI18n: false }));

    await expect(createCommand('my-app', { includeI18n: false, skipInstall: true, skipGit: true })).resolves.toBeUndefined();

    // removeSync should be invoked to remove i18n dir
    expect((mockedFs as any).removeSync).toHaveBeenCalled();
  });
});
