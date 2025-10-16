import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { SERVICE_NAME, type Profile, type ProfileWithCredential, type Config } from './types.js';

let keytar: any = null;
let keytarAvailable = false;

// Try to load keytar, fallback to file storage if unavailable
try {
  const keytarModule = await import('keytar');
  // keytar can export as default or named exports, handle both
  keytar = keytarModule.default || keytarModule;
  keytarAvailable = true;
} catch (error) {
  console.warn(chalk.yellow('⚠️  keytar not available, using insecure local file storage'));
  console.warn(chalk.yellow('   Credentials will be stored in plaintext at ~/.ai-claude-profiles.json'));
}

const CONFIG_FILE = process.env.AI_CLAUDE_CONFIG_PATH || join(homedir(), '.ai-claude-profiles.json');

export interface StoredData {
  config: Config;
  credentials?: Record<string, string>; // Only used when keytar is unavailable
}

/**
 * Read configuration from disk
 */
export function readConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    return { profiles: [] };
  }

  try {
    const data: StoredData = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    return data.config || { profiles: [] };
  } catch (error) {
    console.error(chalk.red('Failed to read config file:'), error);
    return { profiles: [] };
  }
}

/**
 * Write configuration to disk
 */
export function writeConfig(config: Config): void {
  try {
    const existingData: StoredData = existsSync(CONFIG_FILE)
      ? JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      : { config: { profiles: [] } };

    existingData.config = config;
    writeFileSync(CONFIG_FILE, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error(chalk.red('Failed to write config file:'), error);
    throw error;
  }
}

/**
 * Store credential securely (keytar) or fallback to file
 */
export async function storeCredential(profileName: string, credential: string): Promise<void> {
  if (keytarAvailable && keytar) {
    await keytar.setPassword(SERVICE_NAME, profileName, credential);
  } else {
    // Fallback: store in file
    const data: StoredData = existsSync(CONFIG_FILE)
      ? JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      : { config: { profiles: [] }, credentials: {} };

    if (!data.credentials) {
      data.credentials = {};
    }
    data.credentials[profileName] = credential;
    writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
  }
}

/**
 * Retrieve credential
 */
export async function getCredential(profileName: string): Promise<string | null> {
  if (keytarAvailable && keytar) {
    return await keytar.getPassword(SERVICE_NAME, profileName);
  } else {
    // Fallback: read from file
    if (!existsSync(CONFIG_FILE)) {
      return null;
    }
    const data: StoredData = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    return data.credentials?.[profileName] || null;
  }
}

/**
 * Delete credential
 */
export async function deleteCredential(profileName: string): Promise<void> {
  if (keytarAvailable && keytar) {
    await keytar.deletePassword(SERVICE_NAME, profileName);
  } else {
    // Fallback: delete from file
    if (!existsSync(CONFIG_FILE)) {
      return;
    }
    const data: StoredData = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    if (data.credentials && data.credentials[profileName]) {
      delete data.credentials[profileName];
      writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Get all profiles with their credentials
 */
export async function getAllProfilesWithCredentials(): Promise<ProfileWithCredential[]> {
  const config = readConfig();
  const profiles: ProfileWithCredential[] = [];

  for (const profile of config.profiles) {
    const credential = await getCredential(profile.name);
    profiles.push({
      ...profile,
      credential: credential || undefined
    });
  }

  return profiles;
}

/**
 * Check if keytar is available
 */
export function isKeytarAvailable(): boolean {
  return keytarAvailable;
}
