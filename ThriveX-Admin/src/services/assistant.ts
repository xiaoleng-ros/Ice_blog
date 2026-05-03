import { Assistant } from '@/types/app/assistant';

/**
 * 将用户输入的通用模型名（不区分大小写）映射为实际 API 使用的模型名
 */
export const getModelName = (rawModel: string): string => {
  const key = rawModel.toLowerCase().trim();

  const modelMap: Record<string, string> = {
    // === OpenAI ===
    'gpt-3.5': 'gpt-3.5-turbo',
    'gpt-3.5-16k': 'gpt-3.5-turbo-16k',
    'gpt-4': 'gpt-4',
    'gpt-4-32k': 'gpt-4-32k',
    'gpt-4o': 'gpt-4o',
    'gpt-4-turbo': 'gpt-4-turbo',

    // === Moonshot ===
    moonshot: 'moonshot-v1-8k',
    'moonshot-8k': 'moonshot-v1-8k',
    'moonshot-32k': 'moonshot-v1-32k',

    // === DeepSeek ===
    deepseek: 'deepseek-chat',
    'deepseek-coder': 'deepseek-coder',

    // === Kimi（Moonshot）===
    kimi: 'moonshot-v1-8k',

    // === Claude（Anthropic）兼容 OpenAI 接口时的别名 ===
    claude: 'claude-3-opus-20240229',
    'claude-3': 'claude-3-opus-20240229',
    'claude-opus': 'claude-3-opus-20240229',
    'claude-sonnet': 'claude-3-sonnet-20240229',
    'claude-haiku': 'claude-3-haiku-20240307',

    // === MiniMax ===
    minimax: 'abab5.5s-chat',
    'minimax-5.5': 'abab5.5s-chat',
    'minimax-pro': 'abab6-chat',

    // === 通义 Qwen（阿里）===
    qwen: 'qwen-max',
    'qwen-plus': 'qwen-plus',
    'qwen-max': 'qwen-max',
    'qwen-turbo': 'qwen-turbo',

    // === 智谱 AI ===
    glm: 'glm-4',
    'glm-3': 'glm-3-turbo',
    'glm-4': 'glm-4',
    chatglm: 'glm-3-turbo',
    chatglm3: 'glm-3-turbo',
    chatglm4: 'glm-4',

    // === Google Gemini（如通过 proxy 接 OpenAI 格式）===
    gemini: 'gemini-pro',
    'gemini-pro': 'gemini-pro',

    // === 豆包（字节）===
    doubao: 'doubao-2', // 通用别名
    'doubao-2': 'doubao-2', // 官方 API 兼容模型
    'doubao-lite': 'doubao-lite',
    'doubao-pro': 'doubao-pro',
  };

  return modelMap[key] || rawModel;
};

/**
 * 测试助手连接是否正常
 * 优先使用 models 接口验证（不消耗对话配额），失败后降级为轻量对话测试
 */
export const testAssistantConnection = async (assistant: Assistant): Promise<boolean> => {
  try {
    const baseUrl = assistant.url || 'https://api.deepseek.com/v1';
    const apiKey = assistant.key.trim();

    // 策略 1：先尝试调用 models 接口验证 API Key（不消耗对话配额）
    try {
      const modelsResponse = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (modelsResponse.ok) {
        console.log('API Key 验证成功');
        return true;
      }
    } catch {
      // models 接口不可用，降级到策略 2
    }

    // 策略 2：使用极简对话测试（max_tokens=1 减少消耗）
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: getModelName(assistant.model),
        messages: [
          {
            role: 'user',
            content: 'hi',
          },
        ],
        max_tokens: 1,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const json = await response.json().catch(() => null);
      const errMsg = json?.error?.message || response.statusText;

      // 针对 429 频率限制给出友好提示
      if (response.status === 429) {
        console.error('测试连接失败：该模型当前访问量过大，请您稍后再试');
      } else {
        console.error(`测试连接失败：${errMsg}`);
      }
      return false;
    }
  } catch (error) {
    console.error(`测试连接异常：${error}`);
    return false;
  }
};

/**
 * 调用助手接口获取响应（支持流式和非流式）
 */
export const callAssistantAPI = async (
  assistant: Assistant,
  messages: Array<{ role: string; content: string }>,
  options: {
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
  } = {},
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  try {
    const baseUrl = assistant.url || 'https://api.deepseek.com/v1';
    const apiKey = assistant.key.trim();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: getModelName(assistant.model),
        messages,
        stream: options.stream ?? false,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens,
      }),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      const errMsg = json?.error?.message || response.statusText;
      throw new Error(`助手 API 调用失败：${errMsg}`);
    }

    if (options.stream) {
      return response.body?.getReader(); // 由上层组件处理事件流
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
