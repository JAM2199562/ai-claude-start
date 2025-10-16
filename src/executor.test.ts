import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeEnvironment, prepareEnvironment } from './executor.js';
import type { Profile } from './types.js';

describe('executor', () => {
  describe('sanitizeEnvironment', () => {
    beforeEach(() => {
      // Reset environment
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
      vi.stubEnv('ANTHROPIC_AUTH_TOKEN', 'test-token');
      vi.stubEnv('ANTHROPIC_BASE_URL', 'https://test.com');
      vi.stubEnv('OTHER_VAR', 'keep-this');
      vi.stubEnv('PATH', '/usr/bin');
    });

    it('should remove all ANTHROPIC_* environment variables', () => {
      const clean = sanitizeEnvironment();

      expect(clean).not.toHaveProperty('ANTHROPIC_API_KEY');
      expect(clean).not.toHaveProperty('ANTHROPIC_AUTH_TOKEN');
      expect(clean).not.toHaveProperty('ANTHROPIC_BASE_URL');
      expect(clean).toHaveProperty('OTHER_VAR', 'keep-this');
      expect(clean).toHaveProperty('PATH', '/usr/bin');
    });

    it('should preserve non-ANTHROPIC variables', () => {
      const clean = sanitizeEnvironment();

      expect(clean.OTHER_VAR).toBe('keep-this');
      expect(clean.PATH).toBe('/usr/bin');
    });
  });

  describe('prepareEnvironment', () => {
    const mockProfile: Profile = {
      name: 'test',
      baseUrl: 'https://api.example.com',
      model: 'test-model'
    };

    beforeEach(() => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'old-key');
      vi.stubEnv('ANTHROPIC_AUTH_TOKEN', 'old-token');
      vi.stubEnv('OTHER_VAR', 'keep-this');
    });

    it('should support both ANTHROPIC_AUTH_TOKEN and ANTHROPIC_API_KEY for credentials', async () => {
      const env = await prepareEnvironment(mockProfile, 'my-secret-token');

      expect(env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'my-secret-token');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY', 'my-secret-token');
      expect(env).toHaveProperty('OTHER_VAR', 'keep-this');
    });

    it('should set ANTHROPIC_BASE_URL for non-default base URLs', async () => {
      const env = await prepareEnvironment(mockProfile, 'test-token');

      expect(env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://api.example.com');
      expect(env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'test-token');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY', 'test-token');
    });

    it('should not set ANTHROPIC_BASE_URL for default Anthropic URL', async () => {
      const anthropicProfile: Profile = {
        name: 'anthropic',
        baseUrl: 'https://api.anthropic.com'
      };

      const env = await prepareEnvironment(anthropicProfile, 'test-token');

      expect(env).not.toHaveProperty('ANTHROPIC_BASE_URL');
      expect(env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'test-token');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY', 'test-token');
    });

    it('should handle Moonshot profile correctly', async () => {
      const moonshotProfile: Profile = {
        name: 'moonshot',
        baseUrl: 'https://api.moonshot.cn/anthropic'
      };

      const env = await prepareEnvironment(moonshotProfile, 'moonshot-token-123');

      expect(env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'moonshot-token-123');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY', 'moonshot-token-123');
      expect(env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://api.moonshot.cn/anthropic');
    });

    it('should handle BigModel profile correctly', async () => {
      const bigmodelProfile: Profile = {
        name: 'bigmodel',
        baseUrl: 'https://open.bigmodel.cn/api/anthropic'
      };

      const env = await prepareEnvironment(bigmodelProfile, 'bigmodel-token-456');

      expect(env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'bigmodel-token-456');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY', 'bigmodel-token-456');
      expect(env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://open.bigmodel.cn/api/anthropic');
    });
  });
});
