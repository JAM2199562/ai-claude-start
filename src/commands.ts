import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  readConfig,
  writeConfig,
  storeCredential,
  deleteCredential,
  getAllProfilesWithCredentials,
  isKeytarAvailable
} from './storage.js';
import { PRESETS, type Profile } from './types.js';
import { spawn } from 'child_process';

/**
 * Setup wizard to create a new profile
 */
export async function setupProfile(): Promise<void> {
  console.log(chalk.blue('🚀 Profile Setup Wizard\n'));

  const { profileType } = await inquirer.prompt<{ profileType: string }>([
    {
      type: 'list',
      name: 'profileType',
      message: 'Choose a profile type:',
      choices: [...Object.keys(PRESETS), 'Custom']
    }
  ]);

  let profile: Profile;

  if (profileType === 'Custom') {
    const answers = await inquirer.prompt<{ name: string; baseUrl: string; model?: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Profile name:',
        validate: (input) => (input.trim() ? true : 'Profile name is required')
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Base URL:',
        default: 'https://api.anthropic.com',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      },
      {
        type: 'input',
        name: 'model',
        message: 'Model name (optional, e.g., claude-sonnet-4-5-20250929):'
      }
    ]);

    profile = {
      name: answers.name.trim(),
      baseUrl: normalizeUrl(answers.baseUrl),
      model: answers.model?.trim() || undefined
    };
  } else {
    const preset = PRESETS[profileType];
    const { name, customModel } = await inquirer.prompt<{ name: string; customModel?: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Profile name:',
        default: profileType,
        validate: (input) => (input.trim() ? true : 'Profile name is required')
      },
      {
        type: 'input',
        name: 'customModel',
        message: `Model name (default: ${preset.model || 'none'}):`,
        default: preset.model
      }
    ]);

    profile = {
      name: name.trim(),
      baseUrl: preset.baseUrl,
      model: customModel?.trim() || preset.model
    };
  }

  // Ask for credential
  const { credential } = await inquirer.prompt<{ credential: string }>([
    {
      type: 'password',
      name: 'credential',
      message: 'Enter your ANTHROPIC_AUTH_TOKEN:',
      mask: '*'
    }
  ]);

  // Save profile
  const config = readConfig();
  const existingIndex = config.profiles.findIndex((p) => p.name === profile.name);

  if (existingIndex >= 0) {
    const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Profile "${profile.name}" already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Setup cancelled.'));
      return;
    }

    config.profiles[existingIndex] = profile;
  } else {
    config.profiles.push(profile);
  }

  // Set as default if it's the first profile
  if (config.profiles.length === 1) {
    config.defaultProfile = profile.name;
  }

  writeConfig(config);
  await storeCredential(profile.name, credential);

  console.log(chalk.green(`\n✅ Profile "${profile.name}" saved successfully!`));
  if (config.profiles.length === 1) {
    console.log(chalk.green(`   Set as default profile.`));
  }
}

/**
 * List all profiles
 */
export async function listProfiles(): Promise<void> {
  const config = readConfig();
  const profiles = await getAllProfilesWithCredentials();

  if (profiles.length === 0) {
    console.log(chalk.yellow('No profiles found. Run "setup" to create one.'));
    return;
  }

  console.log(chalk.blue('📋 Available Profiles:\n'));

  for (const profile of profiles) {
    const isDefault = profile.name === config.defaultProfile;
    const prefix = isDefault ? chalk.green('✓ [default]') : '  ';
    const credStatus = profile.credential ? chalk.green('✓') : chalk.red('✗');

    console.log(`${prefix} ${chalk.bold(profile.name)}`);
    console.log(`     URL: ${profile.baseUrl}`);
    if (profile.model) {
      console.log(`     Model: ${profile.model}`);
    }
    console.log(`     Token: ${credStatus}`);
    console.log();
  }
}

/**
 * Set default profile
 */
export async function setDefaultProfile(name: string): Promise<void> {
  const config = readConfig();
  const profile = config.profiles.find((p) => p.name === name);

  if (!profile) {
    console.error(chalk.red(`Profile "${name}" not found.`));
    process.exit(1);
  }

  config.defaultProfile = name;
  writeConfig(config);

  console.log(chalk.green(`✅ Default profile set to "${name}"`));
}

/**
 * Delete a profile
 */
export async function deleteProfile(name: string): Promise<void> {
  const config = readConfig();
  const profileIndex = config.profiles.findIndex((p) => p.name === name);

  if (profileIndex < 0) {
    console.error(chalk.red(`Profile "${name}" not found.`));
    process.exit(1);
  }

  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Delete profile "${name}"?`,
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Deletion cancelled.'));
    return;
  }

  config.profiles.splice(profileIndex, 1);

  // Update default if necessary
  if (config.defaultProfile === name) {
    config.defaultProfile = config.profiles.length > 0 ? config.profiles[0].name : undefined;
  }

  writeConfig(config);
  await deleteCredential(name);

  console.log(chalk.green(`✅ Profile "${name}" deleted.`));
  if (config.defaultProfile) {
    console.log(chalk.blue(`   Default profile is now "${config.defaultProfile}"`));
  }
}

/**
 * Doctor command - check system health
 */
export async function doctor(): Promise<void> {
  console.log(chalk.blue('🏥 System Health Check\n'));

  // Check keytar
  const keytarStatus = isKeytarAvailable();
  console.log(
    `Keytar (secure storage): ${keytarStatus ? chalk.green('✓ Available') : chalk.yellow('✗ Not available (using file fallback)')}`
  );

  // Check profiles
  const config = readConfig();
  console.log(`Profiles: ${config.profiles.length} configured`);

  if (config.defaultProfile) {
    console.log(`Default profile: ${chalk.green(config.defaultProfile)}`);
  } else {
    console.log(`Default profile: ${chalk.yellow('none')}`);
  }

  // Check credentials
  const profiles = await getAllProfilesWithCredentials();
  const withCreds = profiles.filter((p) => p.credential).length;
  console.log(
    `Credentials: ${withCreds}/${profiles.length} profiles have credentials stored`
  );

  // Check claude command
  const claudeCmd = process.env.CLAUDE_CMD || 'claude';
  console.log(`\nClaude command: ${claudeCmd}`);

  await new Promise<void>((resolve) => {
    const child = spawn(claudeCmd, ['--version'], {
      stdio: 'pipe',
      shell: true
    });

    let found = false;
    child.on('exit', (code) => {
      if (code === 0 || found) {
        console.log(chalk.green('✓ Claude CLI is available'));
      } else {
        console.log(chalk.yellow('✗ Claude CLI not found or not working'));
      }
      resolve();
    });

    child.on('error', () => {
      console.log(chalk.yellow('✗ Claude CLI not found'));
      resolve();
    });

    child.stdout?.on('data', () => {
      found = true;
    });
  });

  console.log(chalk.green('\n✅ Health check complete'));
}

/**
 * Normalize URL (remove trailing slash, ensure https)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');

  return normalized;
}
