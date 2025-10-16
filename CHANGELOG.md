# 更新日志

## v1.0.3 - 模型配置支持

### 新功能

- ✅ **模型配置**: Profile 现在支持配置模型名称
- ✅ **自动传递 --model**: 启动时自动将配置的模型传递给 Claude CLI
- ✅ **内置模型预设**:
  - Anthropic: `claude-sonnet-4-5-20250929`
  - Moonshot: `moonshot-v1-8k`
  - BigModel (智谱): `glm-4-plus`
- ✅ **灵活覆盖**: 可以在命令行手动指定 `--model` 覆盖配置

### 配置变化

**之前**:
```typescript
{
  name: string;
  baseUrl: string;
}
```

**现在**:
```typescript
{
  name: string;
  baseUrl: string;
  model?: string;  // 新增：可选的模型名称
}
```

## v1.0.2 - 交互式选择

### 新功能

- ✅ **交互式 Profile 选择**: 当有多个 profiles 且未指定时，显示选择菜单
- ✅ 默认 profile 在选择菜单中标记为 `(default)`
- ✅ 单个 profile 时自动使用，无需选择

### 行为变化

**之前**:
```bash
claude-start  # 自动使用默认 profile（如果设置）
```

**现在**:
```bash
claude-start  # 显示选择菜单（如果有多个 profiles）

? Select a profile to use: (Use arrow keys)
❯ anthropic (default)
  moonshot
  bigmodel
```

## v1.0.1 - Bug 修复

### 修复

- ✅ 修复 keytar 模块导入问题（`TypeError: keytar.setPassword is not a function`）
- ✅ 正确处理 keytar 的 default export 和 named exports

### 文档

- ✅ 新增 TROUBLESHOOTING.md 故障排查指南
- ✅ 新增 test-fix.sh 测试脚本

## v1.0.0 - 简化版本

### 重大简化

**配置简化为 3 个字段**：
- ✅ Profile Name（名称）
- ✅ Base URL（API 地址）
- ✅ Token（认证令牌）

**移除的字段**：
- ❌ `authVar`（认证变量名）- 统一使用 `ANTHROPIC_AUTH_TOKEN`
- ❌ `model`（模型名称）- 不再需要，可在运行时指定

### 新增预设

1. **Anthropic** - `https://api.anthropic.com`
2. **Moonshot** - `https://api.moonshot.cn/anthropic`
3. **BigModel (智谱)** - `https://open.bigmodel.cn/api/anthropic`

### 环境变量

**统一使用**：
- `ANTHROPIC_AUTH_TOKEN` - 所有配置的认证令牌
- `ANTHROPIC_BASE_URL` - 非默认 URL 时设置

**移除**：
- 不再使用 `ANTHROPIC_API_KEY`
- 不再使用自定义环境变量名

### 优势

1. **更简单**：配置只需 3 个字段
2. **更统一**：所有服务都用相同的环境变量
3. **更安全**：环境变量清洗更彻底
4. **更明确**：不再有令牌类型的歧义

### 兼容性

**向前兼容**：
- 旧版本的配置文件会自动忽略 `authVar` 和 `model` 字段
- 建议重新运行 `setup` 创建新配置

**API 兼容**：
- 仅支持 Anthropic API 及其兼容服务
- 不再支持其他非 Anthropic 格式的 API

### 迁移指南

如果你有旧版本配置：

```bash
# 1. 查看现有配置
ai-claude-start list

# 2. 备份（可选）
cp ~/.ai-claude-profiles.json ~/.ai-claude-profiles.backup

# 3. 重新创建配置
ai-claude-start setup

# 4. 删除旧配置（可选）
ai-claude-start delete old-profile-name
```

### 测试结果

```
✓ 所有 19 个测试通过
✓ TypeScript 编译无错误
✓ CLI 命令正常工作
```

### 文档更新

- ✅ README.md - 更新功能说明
- ✅ SIMPLE_GUIDE.md - 新增简化指南
- ✅ 测试用例 - 更新以匹配新结构
