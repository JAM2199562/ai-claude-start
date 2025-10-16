# Profile 配置字段详解

本指南详细解释创建自定义 Profile 时每个字段的含义和用法。

## Profile 结构

```typescript
interface Profile {
  name: string;        // Profile 名称（必填）
  baseUrl: string;     // API 基础地址（必填）
  authVar: string;     // 认证环境变量名（必填）
  model?: string;      // 默认模型（可选）
}
```

---

## 字段说明

### 1. Profile Name（名称）

**含义**: Profile 的唯一标识符

**用途**:
- 在命令行中选择配置：`claude-start <profile-name>`
- 存储凭证时的 key
- 在 `list` 命令中显示

**规则**:
- ✅ 允许: 字母、数字、连字符 `-`、下划线 `_`
- ❌ 避免: 空格、特殊字符
- ❌ 禁止: 子命令名（setup, list, default, delete, doctor）

**示例**:
```
✅ 好的命名:
- anthropic-prod
- moonshot-dev
- my-proxy-1
- test_local

❌ 不好的命名:
- "my profile"      (有空格)
- setup             (与子命令冲突)
- @special!         (特殊字符)
```

---

### 2. Base URL（API 基础地址）

**含义**: API 服务器的根地址

**用途**:
- 指定 API 请求的目标服务器
- 如果不是 `https://api.anthropic.com`，会设置到 `ANTHROPIC_BASE_URL` 环境变量

**格式**:
- 完整 URL: `https://api.example.com`
- 可省略协议: `api.example.com` → 自动补充 `https://`
- 自动去除末尾斜杠: `https://api.example.com/` → `https://api.example.com`

**常见场景**:

#### 场景 1: 官方 Anthropic API
```
Base URL: https://api.anthropic.com
说明: 这是默认值，不会额外设置 ANTHROPIC_BASE_URL
```

#### 场景 2: 国内 API 代理
```
Base URL: https://api.moonshot.cn
说明: 设置 ANTHROPIC_BASE_URL=https://api.moonshot.cn
用途: 使用国内可访问的 API 端点
```

#### 场景 3: 企业内网代理
```
Base URL: https://internal-proxy.company.com/anthropic
说明: 企业内部的 API 网关或代理
用途: 通过公司内网访问外部 API
```

#### 场景 4: 本地开发/测试
```
Base URL: http://localhost:3000
说明: 本地运行的测试服务器
用途: 开发调试
```

#### 场景 5: AWS IMDS（元数据服务）
```
Base URL: http://169.254.169.254
说明: AWS 实例元数据服务
用途: 在 EC2 实例上自动获取凭证
```

---

### 3. Auth Var（认证环境变量名）

**含义**: 存储 API 凭证的环境变量名称

**用途**:
- 指定运行时注入凭证的环境变量
- 不同 API 服务使用不同的变量名

**Anthropic 官方支持的变量**:
```bash
ANTHROPIC_API_KEY        # API 密钥（常用）
ANTHROPIC_AUTH_TOKEN     # 认证令牌（Session Token）
```

**其他服务示例**:
```bash
MOONSHOT_API_KEY         # Moonshot API
OPENAI_API_KEY           # OpenAI API
CUSTOM_API_TOKEN         # 自定义服务
AWS_CONTAINER_CREDENTIALS_RELATIVE_URI  # AWS IMDS
```

**如何确定填什么**:

1. **查看 API 文档**
   - Anthropic: https://docs.anthropic.com/
   - 其他服务: 查阅其官方文档

2. **查看错误信息**
   ```bash
   # 如果看到类似错误:
   Error: MOONSHOT_API_KEY environment variable not set
   # 那么应该填写: MOONSHOT_API_KEY
   ```

3. **查看代码示例**
   ```python
   # 如果服务的 Python 示例是:
   client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
   # 那么应该填写: ANTHROPIC_API_KEY
   ```

**智能检测**:

工具会根据凭证格式自动调整：

```bash
# 凭证: sk-ant-api-xxxxx (明显是 API Key)
Auth Var: ANTHROPIC_API_KEY → 使用 ANTHROPIC_API_KEY ✓

# 凭证: sk-ant-token-xxxxx (明显是 Token)
Auth Var: ANTHROPIC_API_KEY → 自动改为 ANTHROPIC_AUTH_TOKEN
                                (优先使用 token)

# 凭证: sk-ant-api-xxxxx (明显是 API Key)
Auth Var: ANTHROPIC_AUTH_TOKEN → 自动改为 ANTHROPIC_API_KEY
                                  (检测到 key 格式)
```

---

### 4. Model（模型名称 - 可选）

**含义**: 默认使用的 AI 模型

**用途**:
- **仅供记录和显示**，不会自动注入环境变量
- 在 `list` 命令中显示
- 帮助你记住这个 profile 通常使用什么模型

**重要**:
- ⚠️ 此字段**不会自动传递**给 Claude CLI
- 你仍需要在命令行指定模型：`claude-start --model claude-3-5-sonnet-20241022`
- 可以留空，不影响功能

**常见模型名称**:

```bash
# Anthropic Claude
claude-3-5-sonnet-20241022    # Claude 3.5 Sonnet
claude-3-opus-20240229        # Claude 3 Opus
claude-3-sonnet-20240229      # Claude 3 Sonnet
claude-3-haiku-20240307       # Claude 3 Haiku

# Moonshot
moonshot-v1-8k
moonshot-v1-32k
moonshot-v1-128k

# 自定义
my-custom-model
test-model
```

---

## 完整配置示例

### 示例 1: Anthropic 官方（生产环境）

```yaml
Profile name: anthropic-prod
Base URL: https://api.anthropic.com
Auth Var: ANTHROPIC_API_KEY
Model: claude-3-5-sonnet-20241022
Credential: sk-ant-api-03-xxxxx（输入时不显示）
```

**运行效果**:
```bash
$ claude-start anthropic-prod

# 实际注入的环境变量:
ANTHROPIC_API_KEY=sk-ant-api-03-xxxxx
# ANTHROPIC_BASE_URL 不设置（使用默认）

# 其他 ANTHROPIC_* 变量被清空
```

---

### 示例 2: Moonshot API

```yaml
Profile name: moonshot
Base URL: https://api.moonshot.cn
Auth Var: MOONSHOT_API_KEY
Model: moonshot-v1-8k
Credential: sk-xxxxx
```

**运行效果**:
```bash
$ claude-start moonshot

# 实际注入的环境变量:
MOONSHOT_API_KEY=sk-xxxxx
ANTHROPIC_BASE_URL=https://api.moonshot.cn

# 所有 ANTHROPIC_* 变量被清空
```

---

### 示例 3: 公司内网代理

```yaml
Profile name: company-proxy
Base URL: https://api-proxy.mycompany.com/anthropic/v1
Auth Var: ANTHROPIC_API_KEY
Model: claude-3-opus-20240229
Credential: company-internal-key-xxxxx
```

**运行效果**:
```bash
$ claude-start company-proxy

# 实际注入的环境变量:
ANTHROPIC_API_KEY=company-internal-key-xxxxx
ANTHROPIC_BASE_URL=https://api-proxy.mycompany.com/anthropic/v1
```

**用途**:
- 通过公司内网访问外部 API
- 统一计费和监控
- 绕过防火墙限制

---

### 示例 4: 本地开发环境

```yaml
Profile name: local-dev
Base URL: http://localhost:3000
Auth Var: DEV_API_KEY
Model: test-model
Credential: dev-test-key-123
```

**运行效果**:
```bash
$ claude-start local-dev

# 实际注入的环境变量:
DEV_API_KEY=dev-test-key-123
ANTHROPIC_BASE_URL=http://localhost:3000
```

**用途**:
- 本地开发调试
- 测试 Mock API
- 离线开发

---

### 示例 5: AWS IMDS（高级）

```yaml
Profile name: aws-imds
Base URL: http://169.254.169.254
Auth Var: AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
Model: claude-3-5-sonnet-20241022
Credential: /v2/credentials/xxxxx
```

**运行效果**:
```bash
$ claude-start aws-imds

# 实际注入的环境变量:
AWS_CONTAINER_CREDENTIALS_RELATIVE_URI=/v2/credentials/xxxxx
ANTHROPIC_BASE_URL=http://169.254.169.254
```

**用途**:
- 在 AWS EC2/ECS 上自动获取凭证
- 使用 IAM Role 而非静态密钥

---

## 环境变量注入流程

### 执行前（清理）:
```bash
# 原始环境（可能有冲突的变量）
ANTHROPIC_API_KEY=old-key
ANTHROPIC_AUTH_TOKEN=old-token
ANTHROPIC_BASE_URL=https://old-url.com
OTHER_VAR=keep-this
```

### 执行中（清洗 + 注入）:
```bash
# 1. 清空所有 ANTHROPIC_* 变量
# 2. 注入 Profile 指定的变量

# 最终环境:
CUSTOM_API_KEY=your-new-key      # Profile 的 authVar
ANTHROPIC_BASE_URL=https://new-url.com  # Profile 的 baseUrl
OTHER_VAR=keep-this              # 其他变量保留
```

### 子进程执行:
```bash
# Claude CLI 或自定义命令在干净的环境中运行
claude <参数...>
```

---

## 测试你的配置

创建测试 profile 后，用以下命令验证：

### 1. 查看配置
```bash
ai-claude-start list
```

### 2. 测试环境注入（不实际调用 Claude）
```bash
ai-claude-start --cmd "node -e \"console.log(JSON.stringify(process.env, null, 2))\"" | grep -E "(ANTHROPIC|YOUR_VAR)"
```

### 3. 测试实际运行
```bash
claude-start your-profile --help
```

---

## 常见问题

### Q1: Base URL 填错了怎么办？
```bash
# 重新运行 setup，使用相同的 profile name 会覆盖
ai-claude-start setup
```

### Q2: 不知道服务使用什么 Auth Var？
```bash
# 方法 1: 查看官方文档
# 方法 2: 查看错误信息
# 方法 3: 尝试运行并看缺少什么环境变量
```

### Q3: 可以创建多个指向同一服务的 Profile 吗？
```bash
# 可以！用于不同用途
ai-claude-start setup
  name: anthropic-dev
  baseUrl: https://api.anthropic.com
  credential: dev-key

ai-claude-start setup
  name: anthropic-prod
  baseUrl: https://api.anthropic.com
  credential: prod-key
```

### Q4: Model 字段必须填吗？
```bash
# 不必须，可以留空
# 此字段仅供记录，不影响实际功能
```

---

## 预设配置参考

工具内置了 3 个预设，可作为参考：

### Anthropic 预设
```yaml
baseUrl: https://api.anthropic.com
authVar: ANTHROPIC_API_KEY
model: claude-3-5-sonnet-20241022
```

### Moonshot 预设
```yaml
baseUrl: https://api.moonshot.cn
authVar: MOONSHOT_API_KEY
model: moonshot-v1-8k
```

### IMDS 预设
```yaml
baseUrl: http://169.254.169.254
authVar: AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
model: (无)
```

---

## 下一步

1. 阅读 [QUICKSTART.md](QUICKSTART.md) 开始创建 profile
2. 查看 [TESTING.md](TESTING.md) 了解安全测试方法
3. 参考 [README.md](README.md) 了解完整功能

需要帮助？运行 `ai-claude-start doctor` 检查系统状态。
