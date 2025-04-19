// 扩展全局类型声明
interface Window {
  chrome: typeof chrome;
  browser: typeof browser;
}

// 配置类型
interface TranslatorConfig {
  apiEndpoint: string;
  apiKey: string;
  scenarios: Scenario[];
}

interface Scenario {
  id: string;
  name: string;
  model: string;
  prompt: string;
}

// 浏览器扩展API类型
declare const browser: typeof chrome & {
  runtime: {
    getBrowserInfo?(): Promise<{name: string, version: string}>;
    onMessage: {
      addListener(callback: (request: any, sender: MessageSender) => Promise<any>|void): void;
    }
  };
  storage: {
    local: {
      get(keys?: string | string[] | null): Promise<Record<string, any>>;
      set(items: Record<string, any>): Promise<void>;
    }
  };
};

interface MessageSender {
  tab?: browser.tabs.Tab;
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
}

// 消息请求类型
interface MessageRequest {
  action: string;
  text: string;
  scenarioId: string;
}
