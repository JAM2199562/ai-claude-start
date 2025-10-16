# 测试智谱 BigModel 配置

## 快速测试步骤

### 1. 使用隔离配置（推荐）

```bash
# 设置测试配置路径
export AI_CLAUDE_CONFIG_PATH="/tmp/test-bigmodel.json"
```

### 2. 运行设置向导

```bash
ai-claude-start setup
```

### 3. 选择配置选项

```
? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel
? Enter your ANTHROPIC_AUTH_TOKEN: [输入你的智谱 API Key]
```

> **提示**: Profile 名称建议使用简单的 `bigmodel`，避免使用带括号的 `BigModel (智谱)`

### 4. 查看配置

```bash
ai-claude-start list
```

应该看到：
```
📋 Available Profiles:

✓ [default] bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Token: ✓
```

### 5. 测试环境变量注入

```bash
ai-claude-start --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN); console.log('URL:', process.env.ANTHROPIC_BASE_URL)\""
```

应该看到：
```
Token: your-bigmodel-key
URL: https://open.bigmodel.cn/api/anthropic
```

### 6. 实际使用

```bash
# 使用默认配置
claude-start

# 或指定配置名称
claude-start bigmodel

# 传递参数
claude-start bigmodel --help
```

### 7. 清理测试环境

```bash
# 删除测试配置文件
rm /tmp/test-bigmodel.json

# 取消环境变量
unset AI_CLAUDE_CONFIG_PATH
```

## 获取智谱 API Key

1. 访问智谱清言开放平台：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台
4. 创建 API Key
5. 复制 API Key（格式通常是长字符串）

## 验证配置

### 检查 Token 是否正确存储

```bash
ai-claude-start list
```

看到 `Token: ✓` 表示存储成功

### 检查环境变量

```bash
ai-claude-start --cmd "env | grep ANTHROPIC"
```

应该看到：
```
ANTHROPIC_AUTH_TOKEN=your-key
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
```

### 测试网络连接

```bash
curl https://open.bigmodel.cn/api/anthropic
```

如果返回 404 或类似响应（不是连接错误），说明网络正常。

## 常见问题

### Q: 名称包含括号或中文会怎样？

A: 可以使用，但在命令行需要加引号：
```bash
# ❌ 错误
claude-start BigModel (智谱)

# ✅ 正确
claude-start "BigModel (智谱)"

# 🌟 推荐：使用简单名称
claude-start bigmodel
```

### Q: keytar 不可用怎么办？

A: 工具会自动降级到文件存储，Token 会保存在：
```bash
echo $AI_CLAUDE_CONFIG_PATH  # 或默认 ~/.ai-claude-profiles.json
```

你会看到警告：
```
⚠️  keytar not available, using insecure local file storage
```

这在测试时是正常的。生产环境建议配置 keytar。

### Q: 测试会影响我的真实 Claude Code 配置吗？

A: 不会！只要使用 `AI_CLAUDE_CONFIG_PATH` 环境变量，所有数据都存储在指定的临时文件中，完全隔离。

### Q: 如何创建多个智谱账号配置？

A: 运行多次 setup，使用不同名称：
```bash
ai-claude-start setup
# 名称: bigmodel-account1

ai-claude-start setup
# 名称: bigmodel-account2

# 使用
claude-start bigmodel-account1
claude-start bigmodel-account2
```

## 完整示例

```bash
#!/bin/bash

# 智谱 BigModel 完整测试示例

echo "🚀 开始测试智谱 BigModel 配置"
echo ""

# 1. 设置隔离环境
export AI_CLAUDE_CONFIG_PATH="/tmp/bigmodel-test.json"
echo "📁 配置路径: $AI_CLAUDE_CONFIG_PATH"
echo ""

# 2. 清理函数
cleanup() {
    echo ""
    echo "🧹 清理测试环境..."
    rm -f "$AI_CLAUDE_CONFIG_PATH"
    unset AI_CLAUDE_CONFIG_PATH
    echo "✅ 清理完成"
}
trap cleanup EXIT

# 3. 健康检查
echo "1️⃣  运行健康检查"
ai-claude-start doctor
echo ""

# 4. 提示用户创建配置
echo "2️⃣  请创建 BigModel 配置："
echo "   ai-claude-start setup"
echo ""
echo "   选择: BigModel (智谱)"
echo "   名称: bigmodel"
echo "   Token: [你的智谱 API Key]"
echo ""
read -p "按 Enter 继续..."
echo ""

ai-claude-start setup

# 5. 查看配置
echo ""
echo "3️⃣  查看配置"
ai-claude-start list
echo ""

# 6. 测试环境变量
echo "4️⃣  测试环境变量注入"
ai-claude-start --cmd "node -e \"console.log('ANTHROPIC_AUTH_TOKEN:', process.env.ANTHROPIC_AUTH_TOKEN); console.log('ANTHROPIC_BASE_URL:', process.env.ANTHROPIC_BASE_URL)\""
echo ""

echo "✅ 测试完成！"
echo ""
echo "💡 现在可以使用: claude-start bigmodel"
```

保存为 `test-bigmodel.sh`，然后运行：
```bash
chmod +x test-bigmodel.sh
./test-bigmodel.sh
```

## 故障排查

如果遇到问题，查看：
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 完整故障排查指南
- [SIMPLE_GUIDE.md](SIMPLE_GUIDE.md) - 简化使用指南

或运行：
```bash
ai-claude-start doctor
```
