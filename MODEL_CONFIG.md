# 模型配置指南

## 问题说明

**问题**: 使用不同 API 时，Claude Code 仍显示默认模型（如 Sonnet 4.5）

**原因**:
- `ai-claude-start` 设置环境变量（`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`）
- Claude Code 使用这些环境变量连接到正确的 API
- **但是模型选择需要通过 `--model` 参数指定**

**解决方案**: v1.0.3 新增模型配置功能，自动传递 `--model` 参数

---

## 功能说明

### 自动模型配置

当你创建或使用 profile 时，工具会：

1. **读取 profile 的 model 配置**
2. **自动添加 `--model <模型名>` 参数**
3. **传递给 Claude CLI**

---

## 使用方法

### 1. 重新创建配置（推荐）

如果你已有配置，需要重新创建以添加模型：

```bash
# 删除旧配置
ai-claude-start delete "BigModel (智谱)"

# 重新创建
ai-claude-start setup

? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel
? Model name (default: glm-4-plus): glm-4-plus  ← 按 Enter 使用默认
? Enter your ANTHROPIC_AUTH_TOKEN: ****************
✅ Profile "bigmodel" saved successfully!
```

### 2. 查看配置

```bash
ai-claude-start list

📋 Available Profiles:

✓ [default] bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Model: glm-4-plus  ← 现在显示模型配置
     Token: ✓
```

### 3. 启动时自动使用模型

```bash
claude-start bigmodel

🚀 Launching with profile: bigmodel
   Model: glm-4-plus  ← 显示使用的模型

╭─── Claude Code v2.0.14 ───────────────────────────────────────────╮
│         GLM-4-Plus · API Usage Billing         ← 现在是正确的模型  │
│   /Users/guohao/Documents/code/test-claude     │                  │
╰────────────────────────────────────────────────────────────────────╯
```

---

## 内置模型预设

### Anthropic
```
模型: claude-sonnet-4-5-20250929
说明: Claude Sonnet 4.5（最新版本）
```

### Moonshot
```
模型: moonshot-v1-8k
说明: Moonshot V1 8K 上下文
```

### BigModel (智谱)
```
模型: glm-4-plus
说明: 智谱 GLM-4-Plus（128K 上下文）
```

---

## 自定义模型

### 创建自定义配置

```bash
ai-claude-start setup

? Choose a profile type: Custom
? Profile name: my-custom
? Base URL: https://my-api.com
? Model name (optional): my-custom-model-name  ← 输入模型名
? Enter your ANTHROPIC_AUTH_TOKEN: ****************
```

### 修改预设的模型

```bash
ai-claude-start setup

? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel-turbo
? Model name (default: glm-4-plus): glm-4-flash  ← 修改为其他模型
? Enter your ANTHROPIC_AUTH_TOKEN: ****************
```

---

## 覆盖模型配置

### 临时使用不同模型

即使 profile 配置了模型，你也可以在命令行覆盖：

```bash
# Profile 配置: glm-4-plus
claude-start bigmodel --model glm-4-flash

# 实际使用: glm-4-flash（命令行参数优先）
```

### 不配置模型

如果不想自动添加 `--model`，在设置时留空：

```bash
? Model name (default: glm-4-plus): [直接按 Enter 留空]
```

---

## 常见模型名称

### Anthropic Claude
```
claude-sonnet-4-5-20250929    # Sonnet 4.5
claude-3-5-sonnet-20241022    # Sonnet 3.5
claude-3-opus-20240229        # Opus 3
claude-3-haiku-20240307       # Haiku 3
```

### Moonshot
```
moonshot-v1-8k      # 8K 上下文
moonshot-v1-32k     # 32K 上下文
moonshot-v1-128k    # 128K 上下文
```

### 智谱 BigModel
```
glm-4-plus          # GLM-4-Plus (128K)
glm-4               # GLM-4 标准版
glm-4-flash         # GLM-4-Flash（快速版）
glm-4-air           # GLM-4-Air（轻量版）
```

---

## 实际示例

### 示例 1: 智谱 GLM-4-Plus

```bash
# 创建配置
$ ai-claude-start setup
? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel
? Model name (default: glm-4-plus): ← 按 Enter 使用默认
? Enter your ANTHROPIC_AUTH_TOKEN: ****************

# 使用
$ claude-start bigmodel
🚀 Launching with profile: bigmodel
   Model: glm-4-plus

# Claude Code 启动，显示正确的模型
╭─── Claude Code ───────────────╮
│   GLM-4-Plus · API Usage      │
╰───────────────────────────────╯
```

### 示例 2: Moonshot V1-32K

```bash
# 创建配置
$ ai-claude-start setup
? Choose a profile type: Moonshot
? Profile name: moonshot-32k
? Model name (default: moonshot-v1-8k): moonshot-v1-32k  ← 修改为 32K
? Enter your ANTHROPIC_AUTH_TOKEN: ****************

# 使用
$ claude-start moonshot-32k
🚀 Launching with profile: moonshot-32k
   Model: moonshot-v1-32k
```

### 示例 3: 多个智谱模型

```bash
# 创建 GLM-4-Plus 配置
$ ai-claude-start setup
? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel-plus
? Model name: glm-4-plus
? Enter your ANTHROPIC_AUTH_TOKEN: ****************

# 创建 GLM-4-Flash 配置
$ ai-claude-start setup
? Choose a profile type: BigModel (智谱)
? Profile name: bigmodel-flash
? Model name: glm-4-flash
? Enter your ANTHROPIC_AUTH_TOKEN: ****************

# 选择使用
$ claude-start
? Select a profile to use:
❯ bigmodel-plus   (glm-4-plus，慢但效果好)
  bigmodel-flash  (glm-4-flash，快但效果一般)
```

---

## 验证配置

### 1. 查看配置

```bash
$ ai-claude-start list
📋 Available Profiles:

✓ [default] bigmodel
     URL: https://open.bigmodel.cn/api/anthropic
     Model: glm-4-plus
     Token: ✓
```

### 2. 测试命令行参数

```bash
$ ai-claude-start --cmd "echo" test bigmodel
🚀 Launching with profile: bigmodel
   Model: glm-4-plus
--model glm-4-plus test  ← 可以看到 --model 参数被添加
```

### 3. 实际启动验证

启动 Claude Code 后，查看欢迎界面应该显示正确的模型名称。

---

## 故障排查

### Q: 启动后模型还是错误的？

**检查 1**: 确认 profile 有模型配置
```bash
ai-claude-start list
# 应该看到 "Model: xxx"
```

**检查 2**: 查看实际传递的参数
```bash
ai-claude-start --cmd "node -e \"console.log(process.argv)\"" bigmodel
# 应该看到 --model 参数
```

**检查 3**: 确认 Claude Code 版本
```bash
claude --version
# 确保支持 --model 参数
```

### Q: 如何更新已有配置的模型？

```bash
# 方案 1: 删除重建
ai-claude-start delete old-profile
ai-claude-start setup

# 方案 2: 手动编辑配置文件
vi ~/.ai-claude-profiles.json
# 或
vi $AI_CLAUDE_CONFIG_PATH
```

### Q: 不同 API 的模型名称在哪里查看？

- **Anthropic**: https://docs.anthropic.com/
- **Moonshot**: https://platform.moonshot.cn/docs
- **智谱**: https://open.bigmodel.cn/dev/api

---

## 最佳实践

1. **为不同场景创建不同配置**
   ```bash
   bigmodel-plus   # 复杂任务，使用 glm-4-plus
   bigmodel-flash  # 简单任务，使用 glm-4-flash
   ```

2. **使用描述性名称**
   ```bash
   # ✅ 好
   moonshot-32k
   bigmodel-flash
   anthropic-opus

   # ❌ 不好
   config1
   test
   my-api
   ```

3. **设置常用的为默认**
   ```bash
   ai-claude-start default bigmodel-plus
   ```

4. **创建别名快速切换**
   ```bash
   # 在 ~/.bashrc 或 ~/.zshrc
   alias claude-fast="claude-start bigmodel-flash"
   alias claude-smart="claude-start bigmodel-plus"
   ```

---

## 更多信息

- [SIMPLE_GUIDE.md](SIMPLE_GUIDE.md) - 简化使用指南
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 使用示例
- [README.md](README.md) - 完整文档
