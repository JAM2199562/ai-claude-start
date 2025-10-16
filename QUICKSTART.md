# 快速开始指南

## 🚀 立即安全测试（不影响 Claude Code）

### 方案 1: 一键运行安全演示

```bash
./demo-safe.sh
```

### 方案 2: 手动测试（推荐）

```bash
# 1. 设置测试配置路径
export AI_CLAUDE_CONFIG_PATH="/tmp/test-config.json"

# 2. 查看帮助
ai-claude-start --help

# 3. 运行健康检查
ai-claude-start doctor

# 4. 运行单元测试
npm test:run

# 5. 清理（可选）
rm -f /tmp/test-config.json
unset AI_CLAUDE_CONFIG_PATH
```

## 📝 完整测试流程

### 测试 Profile 创建

```bash
# 使用隔离配置
export AI_CLAUDE_CONFIG_PATH="/tmp/my-test.json"

# 创建测试 profile
ai-claude-start setup
# 选择: Anthropic
# 名称: test-anthropic
# 密钥: sk-ant-test-key-123

# 列出配置
ai-claude-start list

# 设置默认
ai-claude-start default test-anthropic
```

### 测试环境注入（无需 Claude CLI）

```bash
# 测试环境变量注入
ai-claude-start --cmd "node -e \"console.log('Key:', process.env.ANTHROPIC_API_KEY)\""

# 或使用 CLAUDE_CMD
export CLAUDE_CMD="node -e \"console.log('Auth:', process.env.ANTHROPIC_API_KEY)\""
ai-claude-start

# 清理
unset CLAUDE_CMD
```

### 清理测试环境

```bash
# 删除测试配置
rm /tmp/my-test.json

# 取消环境变量
unset AI_CLAUDE_CONFIG_PATH
```

## 🛡️ 安全保证

- ✅ `AI_CLAUDE_CONFIG_PATH` 环境变量让配置完全隔离
- ✅ 不会影响 `~/.ai-claude-profiles.json` 真实配置
- ✅ 不会影响 Claude Code 的运行
- ✅ 环境变量只在子进程生效，不污染父 shell
- ✅ 所有测试数据可以轻松删除

## 📚 常用命令

### 管理命令

```bash
ai-claude-start setup          # 创建新 profile
ai-claude-start list           # 列出所有 profiles
ai-claude-start default <name> # 设置默认 profile
ai-claude-start delete <name>  # 删除 profile
ai-claude-start doctor         # 系统健康检查
```

### 执行命令

```bash
claude-start                   # 使用默认 profile
claude-start my-profile        # 使用指定 profile
claude-start --help            # 查看帮助
claude-start --version         # 查看版本
```

### 测试命令

```bash
ai-claude-start --cmd "echo test"         # 使用自定义命令
CLAUDE_CMD="echo" ai-claude-start test    # 通过环境变量
```

## 🔍 故障排除

### 查看当前配置位置

```bash
echo ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}
```

### 检查配置文件

```bash
cat ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}
```

### 重置一切

```bash
# 删除测试配置
rm /tmp/test-config.json

# 如果不小心创建了真实配置
rm ~/.ai-claude-profiles.json

# 取消环境变量
unset AI_CLAUDE_CONFIG_PATH
unset CLAUDE_CMD
```

## 💡 使用技巧

### 1. 创建测试别名

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias ai-test='AI_CLAUDE_CONFIG_PATH=/tmp/ai-test.json ai-claude-start'

# 使用
ai-test setup
ai-test list
```

### 2. 快速创建临时配置

```bash
AI_CLAUDE_CONFIG_PATH=/tmp/temp-$$.json ai-claude-start setup
```

### 3. 多环境管理

```bash
# 开发环境
export AI_CLAUDE_CONFIG_PATH=~/.ai-claude-dev.json
ai-claude-start setup

# 测试环境
export AI_CLAUDE_CONFIG_PATH=~/.ai-claude-test.json
ai-claude-start setup

# 生产环境（默认）
unset AI_CLAUDE_CONFIG_PATH
```

## 📖 更多信息

- 完整文档: [README.md](README.md)
- 测试策略: [TESTING.md](TESTING.md)
- 项目总结: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 🆘 需要帮助？

```bash
# 查看帮助
ai-claude-start --help

# 运行健康检查
ai-claude-start doctor

# 查看版本
ai-claude-start --version
```

祝使用愉快！🎉
