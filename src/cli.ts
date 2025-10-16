#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  setupProfile,
  listProfiles,
  setDefaultProfile,
  deleteProfile,
  doctor
} from './commands.js';
import { executeWithProfile } from './executor.js';
import { readConfig } from './storage.js';

const program = new Command();

program
  .name('ai-claude-start')
  .description('Multi-profile Claude CLI launcher with secure credential management')
  .version('1.0.0')
  .option('--cmd <binary>', 'Custom command to run instead of claude (for testing)')
  .option('--continue', 'Continue previous conversation (pass-through to claude)')
  .allowUnknownOption(true);

program
  .command('setup')
  .description('Setup a new profile (interactive wizard)')
  .action(async () => {
    await setupProfile();
  });

program
  .command('list')
  .description('List all configured profiles')
  .action(async () => {
    await listProfiles();
  });

program
  .command('default <name>')
  .description('Set the default profile')
  .action(async (name: string) => {
    await setDefaultProfile(name);
  });

program
  .command('delete <name>')
  .description('Delete a profile')
  .action(async (name: string) => {
    await deleteProfile(name);
  });

program
  .command('doctor')
  .description('Check system health and configuration')
  .action(async () => {
    await doctor();
  });

// Handle direct execution: claude-start [profile] [args...]
// or: claude-start [args...] (uses default profile)
program.action(async (options, cmd) => {
  const args = process.argv.slice(2);

  // If no arguments, check if we have any profiles
  if (args.length === 0) {
    const config = readConfig();
    if (config.profiles.length === 0) {
      console.log(chalk.yellow('No profiles configured.'));
      console.log(chalk.blue('Run "ai-claude-start setup" to create your first profile.\n'));
      program.help();
      return;
    }
  }

  // Check if first arg is a subcommand
  const subcommands = ['setup', 'list', 'default', 'delete', 'doctor'];
  if (args.length > 0 && subcommands.includes(args[0])) {
    // Let commander handle it
    return;
  }

  // Check if first arg is a profile name
  const config = readConfig();
  const firstArgIsProfile = args.length > 0 && config.profiles.some((p) => p.name === args[0]);

  let profileName: string | undefined;
  let claudeArgs: string[];

  if (firstArgIsProfile) {
    profileName = args[0];
    claudeArgs = args.slice(1);
  } else {
    profileName = undefined; // Use default
    claudeArgs = args;
  }

  // Handle --continue flag properly - it should be passed to claude
  await executeWithProfile(profileName, claudeArgs);
});

program.parse();
