# 使用示例

## 基本用法

### 场景 1: 首次使用（无配置）

```bash
$ claude-start
No profiles configured.
Run "ai-claude-start setup" to create a profile.

$ ai-claude-start setup
🚀 Profile Setup Wizard

? Choose a profile type: Anthropic
? Profile name: anthropic
? Enter your ANTHROPIC_AUTH_TOKEN: ****************

✅ Profile "anthropic" saved successfully!
   Set as default profile.

$ claude-start
Using profile: anthropic
🚀 Launching with profile: anthropic
[Claude CLI starts...]
```

---

### 场景 2: 单个配置（自动使用）

```bash
$ ai-claude-start list
📋 Available Profiles:

✓ [default] anthropic
     URL: https://api.anthropic.com
     Token: ✓

$ claude-start
Using profile: anthropic
🚀 Launching with profile: anthropic
[Claude CLI starts with Anthropic API...]
```

---

### 场景 3: 多个配置（交互式选择）

```bash
$ ai-claude-start list
📋 Available Profiles:

✓ [default] anthropic
     URL: https://api.anthropic.com
     Token: ✓

  moonshot
     URL: https://api.moonshot.cn/anthropic
     Token: ✓

  bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Token: ✓

$ claude-start
? Select a profile to use: (Use arrow keys)
❯ anthropic (default)
  moonshot
  bigmodel

# 选择 moonshot
🚀 Launching with profile: moonshot
[Claude CLI starts with Moonshot API...]
```

---

### 场景 4: 直接指定配置

```bash
$ claude-start moonshot
🚀 Launching with profile: moonshot
[Claude CLI starts with Moonshot API...]

$ claude-start bigmodel --help
🚀 Launching with profile: bigmodel
[Shows Claude help with BigModel API...]
```

---

## 配置管理

### 添加新配置

```bash
# 添加 Moonshot 配置
$ ai-claude-start setup
? Choose a profile type: Moonshot
? Profile name: moonshot
? Enter your ANTHROPIC_AUTH_TOKEN: ****************
✅ Profile "moonshot" saved successfully!

# 添加智谱配置
$ ai-claude-start setup
? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel
? Enter your ANTHROPIC_AUTH_TOKEN: ****************
✅ Profile "bigmodel" saved successfully!

# 查看所有配置
$ ai-claude-start list
📋 Available Profiles:

✓ [default] anthropic
     URL: https://api.anthropic.com
     Token: ✓

  moonshot
     URL: https://api.moonshot.cn/anthropic
     Token: ✓

  bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Token: ✓
```

---

### 设置默认配置

```bash
$ ai-claude-start default moonshot
✅ Default profile set to "moonshot"

$ ai-claude-start list
📋 Available Profiles:

  anthropic
     URL: https://api.anthropic.com
     Token: ✓

✓ [default] moonshot
     URL: https://api.moonshot.cn/anthropic
     Token: ✓

  bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Token: ✓

# 现在 moonshot 在选择菜单中默认高亮
$ claude-start
? Select a profile to use:
  anthropic
❯ moonshot (default)
  bigmodel
```

---

### 删除配置

```bash
$ ai-claude-start delete anthropic
? Delete profile "anthropic"? Yes
✅ Profile "anthropic" deleted.
   Default profile is now "moonshot"
```

---

## 高级用法

### 测试环境变量注入

```bash
$ ai-claude-start --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN, '\nURL:', process.env.ANTHROPIC_BASE_URL)\""

? Select a profile to use:
❯ moonshot (default)
  bigmodel

🚀 Launching with profile: moonshot
Token: your-moonshot-token
URL: https://api.moonshot.cn/anthropic
```

---

### 使用隔离配置（测试）

```bash
# 设置测试配置路径
$ export AI_CLAUDE_CONFIG_PATH="/tmp/test.json"

# 创建测试配置
$ ai-claude-start setup
? Choose a profile type: Moonshot
? Profile name: test-moonshot
? Enter your ANTHROPIC_AUTH_TOKEN: test-token-123
✅ Profile "test-moonshot" saved successfully!

# 使用测试配置
$ claude-start
Using profile: test-moonshot
🚀 Launching with profile: test-moonshot

# 清理
$ rm /tmp/test.json
$ unset AI_CLAUDE_CONFIG_PATH
```

---

### 在脚本中使用

```bash
#!/bin/bash

# 自动选择配置的脚本
export AI_CLAUDE_CONFIG_PATH="$HOME/.my-claude-profiles.json"

# 直接指定 profile，无需交互
claude-start moonshot << EOF
帮我写一个 Python 脚本
EOF
```

---

## 实际工作流

### 工作流 1: 多账号开发

```bash
# 公司账号（默认）
$ ai-claude-start setup
? Choose a profile type: Anthropic
? Profile name: work
? Enter your ANTHROPIC_AUTH_TOKEN: [公司 token]

# 个人账号
$ ai-claude-start setup
? Choose a profile type: Anthropic
? Profile name: personal
? Enter your ANTHROPIC_AUTH_TOKEN: [个人 token]

# 工作时使用
$ claude-start work

# 个人项目使用
$ claude-start personal

# 或者直接选择
$ claude-start
? Select a profile to use:
❯ work (default)
  personal
```

---

### 工作流 2: 国内外切换

```bash
# 国外：使用 Anthropic 官方
$ claude-start anthropic

# 国内：使用 Moonshot 代理
$ claude-start moonshot

# 或智谱
$ claude-start bigmodel

# 自动选择
$ claude-start
? Select a profile to use:
❯ anthropic (default)
  moonshot
  bigmodel
```

---

### 工作流 3: 开发/生产环境

```bash
# 开发环境
$ ai-claude-start setup
? Choose a profile type: Custom
? Profile name: dev
? Base URL: http://localhost:8080
? Enter your ANTHROPIC_AUTH_TOKEN: dev-token

# 预发布环境
$ ai-claude-start setup
? Choose a profile type: Custom
? Profile name: staging
? Base URL: https://staging-api.company.com
? Enter your ANTHROPIC_AUTH_TOKEN: staging-token

# 生产环境
$ ai-claude-start setup
? Choose a profile type: Anthropic
? Profile name: prod
? Enter your ANTHROPIC_AUTH_TOKEN: prod-token

# 使用
$ claude-start dev      # 开发
$ claude-start staging  # 预发布
$ claude-start prod     # 生产
```

---

## 快捷方式

### 创建别名

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# 快速启动特定配置
alias claude-work="claude-start work"
alias claude-personal="claude-start personal"
alias claude-cn="claude-start moonshot"

# 使用
$ claude-work    # 直接使用 work 配置
$ claude-cn      # 直接使用 moonshot 配置
```

---

### 函数封装

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中
claude-select() {
    if [ $# -eq 0 ]; then
        # 无参数，显示选择菜单
        claude-start
    else
        # 有参数，直接使用指定配置
        claude-start "$1"
    fi
}

# 使用
$ claude-select           # 显示选择菜单
$ claude-select moonshot  # 直接使用 moonshot
```

---

## 故障排查

### 查看当前配置

```bash
$ ai-claude-start list
$ ai-claude-start doctor
```

### 测试特定配置

```bash
$ claude-start moonshot --cmd "echo" test
🚀 Launching with profile: moonshot
test
```

### 查看环境变量

```bash
$ claude-start --cmd "env | grep ANTHROPIC"
? Select a profile to use:
❯ moonshot (default)

🚀 Launching with profile: moonshot
ANTHROPIC_AUTH_TOKEN=your-token
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
```

---

## 提示

1. **首次使用**: 运行 `ai-claude-start setup` 创建配置
2. **多个配置**: 直接运行 `claude-start` 会显示选择菜单
3. **跳过选择**: 使用 `claude-start <profile-name>` 直接启动
4. **查看配置**: 使用 `ai-claude-start list` 查看所有配置
5. **设置默认**: 使用 `ai-claude-start default <name>` 设置默认配置
6. **安全测试**: 使用 `AI_CLAUDE_CONFIG_PATH` 环境变量隔离测试配置

更多信息查看：
- [SIMPLE_GUIDE.md](SIMPLE_GUIDE.md) - 简化使用指南
- [README.md](README.md) - 完整文档
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排查
