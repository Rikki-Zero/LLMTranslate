// @ts-ignore  
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("Installed!");
});

// 存储配置
let config: TranslatorConfig = {
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  scenarios: []
};

// 调试存储状态
async function debugStorage() {
  try {
    const items = await browser.storage.local.get(null);
    console.log('当前存储内容:', items);
  } catch (error) {
    console.error('存储读取错误:', error);
  }
}

// 每5分钟检查一次存储状态
setInterval(debugStorage, 5 * 60 * 1000);


// 处理API请求
async function callOpenAI(prompt: string, model: string, systemMessage: string): Promise<string | null> {
  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('API请求失败:', error);
    return null;
  }
}

// 监听来自内容脚本的消息
browser.runtime.onMessage.addListener((request: MessageRequest, _sender: MessageSender) => {
  if (request.action === 'translate') {
    const scenario = config.scenarios.find(s => s.id === request.scenarioId);
    if (scenario) {
      return callOpenAI(request.text, scenario.model, scenario.prompt)
        .then(result => ({
          success: true,
          result: result || '翻译失败'
        }));
    }
  }
  return Promise.resolve({ success: false });
});

// 类型定义
interface MessageRequest {
  action: string;
  text: string;
  scenarioId: string;
}
