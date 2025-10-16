#!/bin/bash

# 安全演示脚本 - 使用隔离配置，不影响真实环境

set -e

echo "🔒 安全测试演示 - 使用隔离配置"
echo "================================="
echo ""

# 使用临时配置文件
export AI_CLAUDE_CONFIG_PATH="/tmp/ai-claude-demo-$(date +%s).json"
echo "📁 使用临时配置: $AI_CLAUDE_CONFIG_PATH"
echo ""

# 清理函数
cleanup() {
    echo ""
    echo "🧹 清理临时配置..."
    rm -f "$AI_CLAUDE_CONFIG_PATH"
    echo "✅ 临时配置已删除"
}

# 设置退出时自动清理
trap cleanup EXIT

# 1. 测试帮助
echo "1️⃣  测试帮助命令"
echo "---"
ai-claude-start --help
echo ""

# 2. 测试 doctor（无配置状态）
echo "2️⃣  健康检查（无配置状态）"
echo "---"
ai-claude-start doctor
echo ""

# 3. 列出配置（应该为空）
echo "3️⃣  列出配置（应该为空）"
echo "---"
ai-claude-start list
echo ""

# 4. 测试单元测试
echo "4️⃣  运行单元测试"
echo "---"
npm test:run --silent
echo ""

# 5. 演示如何创建测试配置
echo "5️⃣  如何创建测试配置（示例）"
echo "---"
echo "你可以运行以下命令创建测试配置:"
echo ""
echo "  ai-claude-start setup"
echo ""
echo "然后选择预设或自定义配置。"
echo "所有数据都会保存到: $AI_CLAUDE_CONFIG_PATH"
echo ""

# 6. 演示 --cmd 测试
echo "6️⃣  演示 --cmd 测试功能"
echo "---"
echo "假设你已创建配置，可以这样测试:"
echo ""
echo "  ai-claude-start --cmd \"node -e 'console.log(process.env)'\""
echo ""

echo "================================="
echo "✅ 安全演示完成！"
echo ""
echo "💡 提示:"
echo "   - 临时配置路径: $AI_CLAUDE_CONFIG_PATH"
echo "   - 脚本退出后自动删除"
echo "   - 你的真实 Claude Code 配置完全不受影响"
echo ""
echo "📖 查看完整测试指南: cat TESTING.md"
