#!/bin/bash

# 测试环境变量注入

echo "🧪 Testing environment variable injection"
echo ""

# 测试 BigModel profile
echo "Testing BigModel (智谱) profile:"
echo "---"

ai-claude-start "BigModel (智谱)" --cmd "node -e \"
console.log('Environment variables injected:');
console.log('');
console.log('ANTHROPIC_AUTH_TOKEN:', process.env.ANTHROPIC_AUTH_TOKEN ? '✓ SET (length: ' + process.env.ANTHROPIC_AUTH_TOKEN.length + ')' : '✗ NOT SET');
console.log('ANTHROPIC_BASE_URL:', process.env.ANTHROPIC_BASE_URL || '✗ NOT SET');
console.log('');
console.log('All ANTHROPIC_* environment variables:');
Object.keys(process.env)
  .filter(k => k.startsWith('ANTHROPIC_'))
  .sort()
  .forEach(k => {
    const val = process.env[k];
    const display = k === 'ANTHROPIC_AUTH_TOKEN'
      ? val.substring(0, 10) + '...' + val.substring(val.length - 10)
      : val;
    console.log('  ', k, '=', display);
  });
\""

echo ""
echo "✅ Test complete"
echo ""
echo "如果看到:"
echo "  ANTHROPIC_AUTH_TOKEN: ✓ SET"
echo "  ANTHROPIC_BASE_URL: https://open.bigmodel.cn/api/anthropic"
echo ""
echo "说明环境变量注入正常工作！"
