#!/bin/bash

# 隔离测试脚本 - 不会影响真实的 Claude Code 配置

echo "🧪 Starting isolated test..."
echo ""

# 使用临时配置文件路径（需要修改代码支持 CONFIG_PATH 环境变量）
# 或者使用 --cmd 参数测试核心功能

# 测试 1: 查看帮助
echo "Test 1: Help command"
./dist/cli.js --help
echo ""

# 测试 2: Doctor 检查（不会修改任何配置）
echo "Test 2: Doctor command (read-only)"
./dist/cli.js doctor
echo ""

# 测试 3: 使用 --cmd 测试环境注入（需要先创建测试配置）
echo "Test 3: Environment injection test"
echo "⚠️  This requires a test profile. Skipping for safety."
echo ""

# 测试 4: 运行单元测试
echo "Test 4: Running unit tests"
npm test:run
echo ""

echo "✅ Isolated tests complete!"
echo ""
echo "To test profile creation safely:"
echo "1. Backup existing config: cp ~/.ai-claude-profiles.json ~/.ai-claude-profiles.backup"
echo "2. Run: ./dist/cli.js setup"
echo "3. Test commands: ./dist/cli.js list"
echo "4. Restore backup: mv ~/.ai-claude-profiles.backup ~/.ai-claude-profiles.json"
