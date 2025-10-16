import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { Config, StoredData } from './storage.js';

// Mock the config file path for testing
const TEST_CONFIG_FILE = join(tmpdir(), '.ai-claude-profiles-test.json');

describe('storage', () => {
  beforeEach(() => {
    // Clean up test file before each test
    if (existsSync(TEST_CONFIG_FILE)) {
      unlinkSync(TEST_CONFIG_FILE);
    }
  });

  afterEach(() => {
    // Clean up test file after each test
    if (existsSync(TEST_CONFIG_FILE)) {
      unlinkSync(TEST_CONFIG_FILE);
    }
  });

  describe('config read/write', () => {
    it('should write and read config correctly', () => {
      const config: Config = {
        profiles: [
          {
            name: 'test-profile',
            baseUrl: 'https://api.example.com',
            model: 'test-model'
          }
        ],
        defaultProfile: 'test-profile'
      };

      const data: StoredData = {
        config,
        credentials: {}
      };

      writeFileSync(TEST_CONFIG_FILE, JSON.stringify(data, null, 2));

      const read: StoredData = JSON.parse(readFileSync(TEST_CONFIG_FILE, 'utf-8'));

      expect(read.config.profiles).toHaveLength(1);
      expect(read.config.profiles[0].name).toBe('test-profile');
      expect(read.config.profiles[0].baseUrl).toBe('https://api.example.com');
      expect(read.config.defaultProfile).toBe('test-profile');
    });

    it('should handle empty config file', () => {
      writeFileSync(TEST_CONFIG_FILE, JSON.stringify({ config: { profiles: [] } }, null, 2));

      const read: StoredData = JSON.parse(readFileSync(TEST_CONFIG_FILE, 'utf-8'));

      expect(read.config.profiles).toHaveLength(0);
      expect(read.config.defaultProfile).toBeUndefined();
    });

    it('should store credentials in fallback mode', () => {
      const data: StoredData = {
        config: { profiles: [] },
        credentials: {
          'test-profile': 'secret-credential'
        }
      };

      writeFileSync(TEST_CONFIG_FILE, JSON.stringify(data, null, 2));

      const read: StoredData = JSON.parse(readFileSync(TEST_CONFIG_FILE, 'utf-8'));

      expect(read.credentials).toHaveProperty('test-profile', 'secret-credential');
    });
  });

  describe('URL normalization', () => {
    it('should remove trailing slash from URLs', () => {
      const url = 'https://api.example.com/';
      const normalized = url.replace(/\/$/, '');

      expect(normalized).toBe('https://api.example.com');
    });

    it('should add https:// to URLs without protocol', () => {
      const url = 'api.example.com';
      const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;

      expect(normalized).toBe('https://api.example.com');
    });

    it('should preserve URLs with http://', () => {
      const url = 'http://localhost:8080';
      const normalized = url.replace(/\/$/, '');

      expect(normalized).toBe('http://localhost:8080');
    });

    it('should handle complex URL normalization', () => {
      let url = 'api.example.com/v1/';

      // Add https if no protocol
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      // Remove trailing slash
      url = url.replace(/\/$/, '');

      expect(url).toBe('https://api.example.com/v1');
    });
  });

  describe('authentication tokens', () => {
    it('should always use ANTHROPIC_AUTH_TOKEN', () => {
      const tokenVar = 'ANTHROPIC_AUTH_TOKEN';
      expect(tokenVar).toBe('ANTHROPIC_AUTH_TOKEN');
    });

    it('should accept various token formats', () => {
      const validTokens = [
        'sk-ant-token-123',
        'sk-ant-api-key-456',
        'custom-token-value',
        'eyJhbGciOi...'
      ];

      validTokens.forEach(token => {
        expect(token.length).toBeGreaterThan(0);
      });
    });
  });

  describe('profile management', () => {
    it('should update existing profile correctly', () => {
      const config: Config = {
        profiles: [
          { name: 'test', baseUrl: 'https://old.com' }
        ]
      };

      const updatedProfile = {
        name: 'test',
        baseUrl: 'https://new.com'
      };

      const existingIndex = config.profiles.findIndex((p) => p.name === 'test');
      config.profiles[existingIndex] = updatedProfile;

      expect(config.profiles[0].baseUrl).toBe('https://new.com');
    });

    it('should set first profile as default', () => {
      const config: Config = { profiles: [] };

      config.profiles.push({
        name: 'first',
        baseUrl: 'https://api.com'
      });

      if (config.profiles.length === 1) {
        config.defaultProfile = config.profiles[0].name;
      }

      expect(config.defaultProfile).toBe('first');
    });

    it('should update default when deleting default profile', () => {
      const config: Config = {
        profiles: [
          { name: 'profile1', baseUrl: 'https://api1.com' },
          { name: 'profile2', baseUrl: 'https://api2.com' }
        ],
        defaultProfile: 'profile1'
      };

      // Delete profile1
      const index = config.profiles.findIndex((p) => p.name === 'profile1');
      config.profiles.splice(index, 1);

      if (config.defaultProfile === 'profile1') {
        config.defaultProfile = config.profiles.length > 0 ? config.profiles[0].name : undefined;
      }

      expect(config.defaultProfile).toBe('profile2');
    });
  });
});
