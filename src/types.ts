export interface Profile {
  name: string;
  baseUrl: string;
  model?: string;  // Optional model name to pass to Claude
}

export interface ProfileWithCredential extends Profile {
  credential?: string;
}

export interface Config {
  profiles: Profile[];
  defaultProfile?: string;
}

export const PRESETS: Record<string, Omit<Profile, 'name'>> = {
  Anthropic: {
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-5-20250929'
  },
  Moonshot: {
    baseUrl: 'https://api.moonshot.cn/anthropic',
    model: 'moonshot-v1-8k'
  },
  'BigModel (智谱)': {
    baseUrl: 'https://open.bigmodel.cn/api/anthropic',
    model: 'glm-4-plus'
  }
};

export const SERVICE_NAME = 'ai-claude-start';
