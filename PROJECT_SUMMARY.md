# Project Summary: ai-claude-start

## Overview
A multi-profile Claude CLI launcher with secure credential management, built with TypeScript and Node.js.

## Key Features Implemented

### 1. Multi-Profile Management
- ✅ Interactive setup wizard with 3 presets (Anthropic, Moonshot, IMDS) + Custom
- ✅ Profile structure: `{ name, baseUrl, authVar, model? }`
- ✅ Commands: setup, list, default, delete, doctor

### 2. Secure Credential Storage
- ✅ Primary: `keytar` for OS-level secure storage (Keychain/Credential Vault/Secret Service)
- ✅ Fallback: Local file storage at `~/.ai-claude-profiles.json` with warning
- ✅ Automatic detection and graceful fallback

### 3. Environment Sanitization
- ✅ Clears all `ANTHROPIC_*` environment variables before execution
- ✅ Injects only the required credential for selected profile
- ✅ Smart credential detection: prefers token over key when both are possible
- ✅ Logic: `sk-ant-api-*` → API_KEY, `sk-ant-token-*` or contains "token" → AUTH_TOKEN

### 4. CLI Interface
- ✅ Two command names: `ai-claude-start` and `claude-start`
- ✅ Subcommands: setup, list, default <name>, delete <name>, doctor
- ✅ Direct execution: `claude-start [profile] [args...]`
- ✅ `--cmd <binary>` option for testing (overrides default claude command)
- ✅ `CLAUDE_CMD` environment variable support

### 5. Testing Infrastructure
- ✅ Vitest test suite with 19 passing tests
- ✅ Tests for URL normalization
- ✅ Tests for environment sanitization and injection
- ✅ Tests for credential conflict resolution
- ✅ Tests for profile configuration management

### 6. Documentation
- ✅ Comprehensive README.md with usage examples
- ✅ MIT LICENSE
- ✅ .gitignore for security and cleanliness

## Project Structure

```
ai-claude-start/
├── src/
│   ├── types.ts           # TypeScript interfaces and presets
│   ├── storage.ts         # Configuration & credential management
│   ├── commands.ts        # CLI command implementations
│   ├── executor.ts        # Environment sanitization & execution
│   ├── cli.ts            # Main CLI entry point (bin)
│   ├── executor.test.ts   # Executor unit tests
│   └── storage.test.ts    # Storage & config tests
├── dist/                  # Compiled JavaScript (auto-generated)
├── package.json           # NPM configuration with scripts
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest test configuration
├── .gitignore            # Git ignore patterns
├── LICENSE               # MIT License
└── README.md             # User documentation
```

## Key Implementation Details

### Environment Variable Handling
```typescript
// 1. Sanitize: Remove all ANTHROPIC_* variables
const clean = sanitizeEnvironment();

// 2. Smart injection based on credential format
if (credential.startsWith('sk-ant-api')) {
  env['ANTHROPIC_API_KEY'] = credential;
} else if (credential.includes('token')) {
  env['ANTHROPIC_AUTH_TOKEN'] = credential;
} else {
  env[profile.authVar] = credential;
}

// 3. Set base URL if non-default
if (baseUrl !== 'https://api.anthropic.com') {
  env['ANTHROPIC_BASE_URL'] = baseUrl;
}
```

### Security Model
- **Best case**: keytar available → OS keychain
- **Fallback**: keytar unavailable → plaintext file + warning
- **Never**: Credentials in package.json or git

### Testing Strategy
- **Unit tests**: Pure functions (sanitization, URL normalization)
- **Integration tests**: Config read/write, profile management
- **Manual testing**: `npm link` + CLI commands

## Usage Examples

### Setup
```bash
npx ai-claude-start setup
# Follow interactive wizard
```

### List Profiles
```bash
ai-claude-start list
```

### Set Default
```bash
ai-claude-start default my-profile
```

### Run with Profile
```bash
claude-start my-profile --version
claude-start --help  # Uses default profile
```

### Testing Without Claude
```bash
# Using --cmd flag
ai-claude-start --cmd "echo" test args

# Using CLAUDE_CMD environment variable
export CLAUDE_CMD="node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
ai-claude-start
```

### Health Check
```bash
ai-claude-start doctor
```

## Installation & Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Build TypeScript
npm run build

# 3. Run tests
npm test:run

# 4. Link globally
npm link

# 5. Test commands
ai-claude-start --help
ai-claude-start doctor
claude-start --version
```

## Test Results
```
✓ src/storage.test.ts  (12 tests)
✓ src/executor.test.ts (7 tests)

Test Files  2 passed (2)
     Tests  19 passed (19)
```

## Dependencies

### Production
- `chalk`: Terminal styling
- `commander`: CLI framework
- `inquirer`: Interactive prompts
- `keytar`: Secure credential storage

### Development
- `typescript`: Type checking & compilation
- `vitest`: Fast unit testing
- `@types/*`: TypeScript definitions

## Future Enhancements (Optional)
- [ ] Add profile import/export functionality
- [ ] Support for multiple credential types per profile
- [ ] Shell completion scripts
- [ ] Configuration validation on startup
- [ ] Encrypted local fallback storage
- [ ] Profile templates for common providers

## Status
✅ **COMPLETE** - All requirements met, tests passing, ready for use via `npm link`
