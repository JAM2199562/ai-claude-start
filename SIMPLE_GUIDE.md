# ai-claude-start 简化使用指南

配置已简化！现在只需要 **3 个参数**：

## 配置参数

### 1. Profile Name（名称）
- 你给这个配置起的名字
- 例如：`anthropic`, `moonshot`, `bigmodel`

### 2. Base URL（API 地址）
- API 服务器的地址
- 例如：
  - `https://api.anthropic.com` - Anthropic 官方
  - `https://api.moonshot.cn/anthropic` - Moonshot
  - `https://open.bigmodel.cn/api/anthropic` - 智谱 BigModel

### 3. ANTHROPIC_AUTH_TOKEN（认证令牌）
- 你的 API 密钥/令牌
- 输入时不显示（保密）

## 内置预设

选择 `setup` 时，可以快速选择：

### 1. Anthropic（官方）
```
Base URL: https://api.anthropic.com
说明：Anthropic 官方 API
```

### 2. Moonshot
```
Base URL: https://api.moonshot.cn/anthropic
说明：Moonshot API（兼容 Anthropic）
```

### 3. BigModel (智谱)
```
Base URL: https://open.bigmodel.cn/api/anthropic
说明：智谱清言 API（兼容 Anthropic）
```

### 4. Custom（自定义）
```
可以输入任何自定义的 Base URL
```

## 快速开始

### 1. 创建配置

```bash
# 使用隔离配置（安全测试）
export AI_CLAUDE_CONFIG_PATH="/tmp/test.json"

# 运行设置向导
ai-claude-start setup

# 按提示操作：
# 1. 选择预设或自定义
# 2. 输入 Profile 名称
# 3. 输入 ANTHROPIC_AUTH_TOKEN
```

### 2. 查看配置

```bash
ai-claude-start list
```

输出示例：
```
📋 Available Profiles:

✓ [default] moonshot
     URL: https://api.moonshot.cn/anthropic
     Token: ✓
```

### 3. 使用配置

**多个配置时 - 交互式选择**:
```bash
claude-start

# 显示选择菜单：
? Select a profile to use: (Use arrow keys)
❯ anthropic (default)
  moonshot
  bigmodel
```

**直接指定配置**:
```bash
claude-start moonshot
```

**单个配置时 - 自动使用**:
```bash
claude-start
# 自动使用唯一的配置，无需选择
```

## 环境变量注入

运行时，工具会自动设置：

```bash
# 对于所有配置，都会设置：
ANTHROPIC_AUTH_TOKEN=你的令牌

# 如果不是官方 API，还会设置：
ANTHROPIC_BASE_URL=你配置的URL
```

## 实际例子

### 例子 1: 配置 Moonshot

```bash
# 1. 运行设置
ai-claude-start setup

# 2. 选择 "Moonshot"
# 3. 名称：moonshot（或自定义）
# 4. 令牌：输入你的 Moonshot API Key

# 5. 运行
claude-start moonshot
```

实际注入的环境变量：
```bash
ANTHROPIC_AUTH_TOKEN=你的moonshot-key
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
```

### 例子 2: 配置智谱 BigModel

```bash
# 1. 运行设置
ai-claude-start setup

# 2. 选择 "BigModel (智谱)"
# 3. 名称：bigmodel
# 4. 令牌：输入你的智谱 API Key

# 5. 运行
claude-start bigmodel
```

实际注入的环境变量：
```bash
ANTHROPIC_AUTH_TOKEN=你的bigmodel-key
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
```

### 例子 3: 自定义配置

```bash
# 1. 运行设置
ai-claude-start setup

# 2. 选择 "Custom"
# 3. 名称：my-proxy
# 4. Base URL: https://my-company-proxy.com/api
# 5. 令牌：输入你的密钥

# 6. 运行
claude-start my-proxy
```

实际注入的环境变量：
```bash
ANTHROPIC_AUTH_TOKEN=你的密钥
ANTHROPIC_BASE_URL=https://my-company-proxy.com/api
```

## 管理命令

```bash
# 设置新配置
ai-claude-start setup

# 列出所有配置
ai-claude-start list

# 设置默认配置
ai-claude-start default <名称>

# 删除配置
ai-claude-start delete <名称>

# 健康检查
ai-claude-start doctor
```

## 安全测试

使用临时配置文件，不影响真实环境：

```bash
# 设置测试路径
export AI_CLAUDE_CONFIG_PATH="/tmp/test.json"

# 测试所有功能
ai-claude-start setup
ai-claude-start list

# 清理
rm /tmp/test.json
unset AI_CLAUDE_CONFIG_PATH
```

## 常见问题

### Q: 为什么只有 Base URL，没有其他字段？
A: 简化了！现在统一使用 `ANTHROPIC_AUTH_TOKEN` 作为认证变量，只需要配置 API 地址即可。

### Q: 我的服务不兼容 Anthropic 格式怎么办？
A: 这个工具专为 Anthropic API 及其兼容服务设计。如果你的服务不兼容，可能需要使用其他工具。

### Q: 可以配置多个账号吗？
A: 可以！创建多个 profile，给它们不同的名称：
```bash
ai-claude-start setup  # 创建 moonshot-account1
ai-claude-start setup  # 创建 moonshot-account2
claude-start moonshot-account1
claude-start moonshot-account2
```

### Q: Token 存储在哪里？
A: 优先存储在系统密钥链（keytar），如果不可用则存储在 `~/.ai-claude-profiles.json`（会显示警告）。

### Q: 如何查看当前使用的环境变量？
A: 使用 `--cmd` 测试：
```bash
ai-claude-start --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN, 'URL:', process.env.ANTHROPIC_BASE_URL)\""
```

## 总结

**配置三步走**：
1. 名称：给配置起个名字
2. URL：选择或输入 API 地址
3. Token：输入你的密钥

**使用一条命令**：
```bash
claude-start <配置名称>
```

就这么简单！🎉
