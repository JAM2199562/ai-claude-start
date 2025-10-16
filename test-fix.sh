#!/bin/bash

# 测试 keytar 修复

set -e

echo "🧪 Testing keytar fix..."
echo ""

# 使用临时配置
export AI_CLAUDE_CONFIG_PATH="/tmp/test-fix-$$.json"
trap "rm -f $AI_CLAUDE_CONFIG_PATH; unset AI_CLAUDE_CONFIG_PATH" EXIT

echo "📁 Using test config: $AI_CLAUDE_CONFIG_PATH"
echo ""

# 测试 doctor
echo "1️⃣  Testing doctor command..."
ai-claude-start doctor
echo ""

# 测试 list（空配置）
echo "2️⃣  Testing list command (should be empty)..."
ai-claude-start list
echo ""

echo "✅ Basic commands work!"
echo ""
echo "3️⃣  To test profile creation, run manually:"
echo "   export AI_CLAUDE_CONFIG_PATH=\"/tmp/test.json\""
echo "   ai-claude-start setup"
echo "   # Select BigModel (智谱), enter name and test token"
echo "   ai-claude-start list"
echo ""
echo "🧹 Test config will be cleaned up automatically."
