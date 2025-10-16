# 安全测试指南

本指南帮助你在不影响 Claude Code 真实配置的情况下测试 ai-claude-start。

## 方法 1: 使用隔离的配置文件（推荐）

使用 `AI_CLAUDE_CONFIG_PATH` 环境变量指定测试配置文件：

```bash
# 设置测试配置路径
export AI_CLAUDE_CONFIG_PATH="/tmp/test-claude-config.json"

# 现在所有命令都使用测试配置
ai-claude-start setup
ai-claude-start list
ai-claude-start doctor
```

### 完整测试流程

```bash
# 1. 重新构建
cd "/Users/guohao/Documents/code/ ai-claude-start"
npm run build

# 2. 使用测试配置
export AI_CLAUDE_CONFIG_PATH="/tmp/test-claude-config.json"

# 3. 创建测试 profile
ai-claude-start setup
# 选择 "Anthropic" 预设
# 名称: test-profile
# 输入测试密钥: test-key-12345

# 4. 列出配置
ai-claude-start list

# 5. 设置默认
ai-claude-start default test-profile

# 6. 使用 --cmd 测试环境注入（不实际调用 claude）
ai-claude-start --cmd "node -e \"console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY)\""

# 7. 清理测试配置
rm /tmp/test-claude-config.json
unset AI_CLAUDE_CONFIG_PATH
```

## 方法 2: 备份现有配置

如果你想测试真实路径但保护现有配置：

```bash
# 1. 备份现有配置（如果存在）
if [ -f ~/.ai-claude-profiles.json ]; then
  cp ~/.ai-claude-profiles.json ~/.ai-claude-profiles.backup
  echo "✅ Backup created at ~/.ai-claude-profiles.backup"
fi

# 2. 测试所有功能
ai-claude-start setup
ai-claude-start list
# ... 其他测试

# 3. 恢复备份
if [ -f ~/.ai-claude-profiles.backup ]; then
  mv ~/.ai-claude-profiles.backup ~/.ai-claude-profiles.json
  echo "✅ Original config restored"
fi
```

## 方法 3: 只读测试（最安全）

这些命令不会修改任何配置：

```bash
# 查看帮助
ai-claude-start --help

# 运行单元测试
npm test:run

# 健康检查（只读）
ai-claude-start doctor

# 列出配置（只读，如果配置文件不存在会提示）
ai-claude-start list
```

## 方法 4: 使用 Docker 容器隔离

创建完全隔离的测试环境：

```bash
# 1. 创建测试 Dockerfile
cat > Dockerfile.test <<EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm link
CMD ["/bin/sh"]
EOF

# 2. 构建并运行
docker build -f Dockerfile.test -t ai-claude-start-test .
docker run -it ai-claude-start-test

# 3. 在容器内测试
ai-claude-start setup
ai-claude-start list
```

## 测试 --cmd 功能（不需要 Claude CLI）

```bash
# 使用隔离配置
export AI_CLAUDE_CONFIG_PATH="/tmp/test-config.json"

# 创建测试 profile
ai-claude-start setup

# 测试环境变量注入
ai-claude-start --cmd "node -e \"console.log(JSON.stringify(process.env, null, 2))\" " | grep ANTHROPIC

# 测试 CLAUDE_CMD 环境变量
export CLAUDE_CMD="echo"
ai-claude-start "hello from test"

# 清理
rm /tmp/test-config.json
unset AI_CLAUDE_CONFIG_PATH
unset CLAUDE_CMD
```

## 验证不会影响 Claude Code

### 检查是否有影响：

```bash
# 1. 检查环境变量（在运行 ai-claude-start 前后）
env | grep ANTHROPIC

# 2. ai-claude-start 只会在子进程中修改环境变量
# 父 shell 的环境不会被影响

# 3. 验证配置文件位置
echo "Config file location:"
echo "  Default: ~/.ai-claude-profiles.json"
echo "  Custom:  $AI_CLAUDE_CONFIG_PATH"

# 4. Claude Code 使用自己的配置机制
# ai-claude-start 只在运行时临时注入环境变量给子进程
```

## 推荐测试顺序

1. **只读测试**（0% 风险）
   ```bash
   npm test:run
   ai-claude-start --help
   ai-claude-start doctor
   ```

2. **隔离配置测试**（0% 风险）
   ```bash
   export AI_CLAUDE_CONFIG_PATH="/tmp/test.json"
   ai-claude-start setup
   ai-claude-start list
   ```

3. **完整功能测试**（使用 --cmd）
   ```bash
   ai-claude-start --cmd "node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
   ```

## 故障排除

### 如果不小心创建了真实配置：

```bash
# 删除配置文件
rm ~/.ai-claude-profiles.json

# 删除 keytar 存储的凭证（macOS）
security delete-generic-password -s "ai-claude-start" -a "profile-name"
```

### 如果想完全卸载：

```bash
# 1. 取消全局链接
npm unlink -g ai-claude-start

# 2. 删除配置
rm ~/.ai-claude-profiles.json

# 3. 清理 keytar 凭证
# macOS: 打开"钥匙串访问"，搜索 "ai-claude-start"，删除条目
```

## 快速测试脚本

运行提供的隔离测试脚本：

```bash
./test-isolated.sh
```

或者创建你自己的测试脚本：

```bash
cat > my-test.sh <<'EOF'
#!/bin/bash
export AI_CLAUDE_CONFIG_PATH="/tmp/my-test-config.json"
trap "rm -f /tmp/my-test-config.json" EXIT

echo "Creating test profile..."
# 这里添加你的测试命令

echo "Tests complete, config will be auto-deleted"
EOF

chmod +x my-test.sh
./my-test.sh
```

## 重要提示

- ✅ `ai-claude-start` **不会修改** Claude Code 的配置
- ✅ 环境变量只在子进程中生效，不影响父 shell
- ✅ 使用 `AI_CLAUDE_CONFIG_PATH` 可以完全隔离测试
- ✅ 所有修改都是可逆的（备份 + 恢复）
- ⚠️ 如果使用 keytar，凭证存储在系统密钥链中，需要手动删除

祝测试顺利！
