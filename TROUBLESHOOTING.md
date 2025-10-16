# 故障排查指南

## 常见问题

### 1. `TypeError: keytar.setPassword is not a function`

**症状**:
```
TypeError: keytar.setPassword is not a function
    at storeCredential
```

**原因**: keytar 模块导入问题（已在 v1.0.0 修复）

**解决方案**:
```bash
# 1. 更新代码
cd "/Users/guohao/Documents/code/ ai-claude-start"
git pull  # 或重新下载

# 2. 重新构建
npm run build

# 3. 测试
ai-claude-start doctor
```

**临时方案** (如果 keytar 不可用):
工具会自动降级到文件存储，凭证会保存在 `~/.ai-claude-profiles.json`（明文）

---

### 2. `keytar not available` 警告

**症状**:
```
⚠️  keytar not available, using insecure local file storage
   Credentials will be stored in plaintext at ~/.ai-claude-profiles.json
```

**原因**: 系统缺少 keytar 依赖

**解决方案**:

#### macOS:
```bash
# 通常自动工作，如果不行：
xcode-select --install
npm rebuild keytar
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install libsecret-1-dev
npm rebuild keytar
```

#### Linux (Fedora/RHEL):
```bash
sudo yum install libsecret-devel
npm rebuild keytar
```

#### Windows:
通常自动工作，无需额外配置

---

### 3. Profile 名称包含特殊字符或空格

**症状**:
```
Profile "BigModel (智谱)" not found
```

**原因**: 命令行解析问题

**解决方案**:
```bash
# ❌ 错误
claude-start BigModel (智谱)

# ✅ 正确（使用引号）
claude-start "BigModel (智谱)"

# 或者使用不含特殊字符的名称
ai-claude-start setup
# 名称: bigmodel（推荐）
```

**最佳实践**: 使用简单的名称
- ✅ `bigmodel`, `moonshot`, `anthropic`
- ❌ `BigModel (智谱)`, `my profile`, `test@dev`

---

### 4. 无法找到配置文件

**症状**:
```
No profiles found. Run "setup" to create one.
```

**检查**:
```bash
# 查看配置文件位置
echo ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}

# 检查文件是否存在
ls -la ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}

# 查看内容
cat ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}
```

**解决方案**:
```bash
# 如果使用了自定义路径，确保环境变量设置正确
export AI_CLAUDE_CONFIG_PATH="/path/to/your/config.json"

# 或者重新创建配置
ai-claude-start setup
```

---

### 5. Claude CLI 未找到

**症状**:
```
✗ Claude CLI not found or not working
```

**解决方案**:

#### 方案 1: 安装 Claude CLI
访问 [claude.ai](https://claude.ai) 并按照官方指南安装

#### 方案 2: 使用测试模式
```bash
# 使用 --cmd 测试
ai-claude-start --cmd "echo" test

# 或设置 CLAUDE_CMD
export CLAUDE_CMD="node -e \"console.log('Test')\""
ai-claude-start
```

---

### 6. 环境变量未生效

**症状**:
Claude 运行时没有读取到正确的 API 凭证

**检查**:
```bash
# 测试环境变量注入
ai-claude-start --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN); console.log('URL:', process.env.ANTHROPIC_BASE_URL)\""
```

**应该看到**:
```
Token: your-token-here
URL: https://api.moonshot.cn/anthropic  (如果不是默认 URL)
```

**如果看不到**, 检查：
1. Profile 是否正确创建：`ai-claude-start list`
2. Token 是否已存储：看到 `Token: ✓`
3. 是否选择了正确的 profile：`claude-start <profile-name>`

---

### 7. API 请求失败

**症状**:
```
Error: Invalid API key
Error: Connection refused
```

**排查步骤**:

#### 1. 检查 Token 是否正确
```bash
ai-claude-start list
# 确认 Token: ✓
```

#### 2. 检查 Base URL
```bash
ai-claude-start list
# 查看 URL 是否正确
```

#### 3. 测试网络连接
```bash
# 测试 Anthropic
curl https://api.anthropic.com

# 测试 Moonshot
curl https://api.moonshot.cn/anthropic

# 测试 BigModel
curl https://open.bigmodel.cn/api/anthropic
```

#### 4. 重新创建 Profile
```bash
ai-claude-start delete <profile-name>
ai-claude-start setup
```

---

### 8. Permission Denied

**症状**:
```
EACCES: permission denied
```

**解决方案**:
```bash
# 检查配置文件权限
ls -la ~/.ai-claude-profiles.json

# 修复权限
chmod 600 ~/.ai-claude-profiles.json

# 如果是 npm link 问题
sudo npm unlink -g
npm link
```

---

### 9. 测试时不想影响真实配置

**解决方案**:
```bash
# 使用隔离配置
export AI_CLAUDE_CONFIG_PATH="/tmp/test-config.json"

# 所有操作都在测试配置上
ai-claude-start setup
ai-claude-start list
claude-start

# 清理
rm /tmp/test-config.json
unset AI_CLAUDE_CONFIG_PATH
```

---

### 10. 更新后出现问题

**解决方案**:
```bash
# 1. 清理并重新构建
cd "/Users/guohao/Documents/code/ ai-claude-start"
rm -rf node_modules dist
npm install
npm run build

# 2. 重新链接
npm unlink -g
npm link

# 3. 测试
ai-claude-start --version
ai-claude-start doctor
```

---

## 获取帮助

### 收集诊断信息

运行以下命令收集诊断信息：

```bash
# 1. 版本信息
ai-claude-start --version
node --version
npm --version

# 2. 系统健康检查
ai-claude-start doctor

# 3. 配置信息（隐藏敏感信息）
ai-claude-start list

# 4. 环境变量
env | grep -E "(ANTHROPIC|CLAUDE|AI_CLAUDE)"

# 5. 配置文件位置和权限
ls -la ${AI_CLAUDE_CONFIG_PATH:-~/.ai-claude-profiles.json}
```

### 报告问题

如果以上方法都无法解决问题，请报告到：
https://github.com/anthropics/claude-code/issues

提供以上诊断信息（**注意删除敏感的 Token 信息**）

---

## 完全重置

如果一切都不工作，可以完全重置：

```bash
# ⚠️  警告：这会删除所有配置和凭证

# 1. 删除配置文件
rm ~/.ai-claude-profiles.json

# 2. 清理 keytar 凭证（macOS）
# 打开"钥匙串访问"应用
# 搜索 "ai-claude-start"
# 删除所有相关条目

# 3. 重新安装
cd "/Users/guohao/Documents/code/ ai-claude-start"
npm unlink -g
rm -rf node_modules dist
npm install
npm run build
npm link

# 4. 重新开始
ai-claude-start setup
```

---

## 预防性检查

定期运行健康检查：

```bash
# 每次使用前
ai-claude-start doctor

# 应该看到
# ✓ Keytar available (or fallback warning)
# ✓ Profiles configured
# ✓ Credentials stored
# ✓ Claude CLI available
```

如有问题，参考本指南或运行 `ai-claude-start --help` 查看可用命令。
