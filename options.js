// 配置自动保存计时器
let saveTimer = null;
const SAVE_DELAY = 1000; // 1秒延迟保存

// 加载配置
function loadConfig() {
    chrome.storage.sync.get(['translatorConfig'], (result) => {
        const config = result.translatorConfig || {
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: '',
            scenarios: []
        };

        // 填充API配置
        document.getElementById('apiEndpoint').value = config.apiEndpoint;
        document.getElementById('apiKey').value = config.apiKey;

        // 填充场景组
        const container = document.getElementById('scenariosContainer');
        container.innerHTML = '';
        config.scenarios.forEach(scenario => {
            addScenarioToUI(scenario);
        });
    });
}

// 保存配置
function saveConfig() {
    clearTimeout(saveTimer);

    const config = {
        apiEndpoint: document.getElementById('apiEndpoint').value,
        apiKey: document.getElementById('apiKey').value,
        scenarios: []
    };

    // 收集场景组
    document.querySelectorAll('.scenario').forEach(el => {
        config.scenarios.push({
            id: el.dataset.id,
            name: el.querySelector('.scenario-name').value,
            model: el.querySelector('.scenario-model').value,
            prompt: el.querySelector('.scenario-prompt').value
        });
    });

    // 保存到存储
    chrome.storage.sync.set({ translatorConfig: config }, () => {
        showStatus('apiStatus', '配置已保存');
    });
}

// 显示状态信息
function showStatus(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    setTimeout(() => el.textContent = '', 2000);
}

// 添加场景到UI
function addScenarioToUI(scenario) {
    const el = document.createElement('div');
    el.className = 'scenario';
    el.dataset.id = scenario.id || Date.now().toString();

    el.innerHTML = `
    <label>场景名称</label>
    <input type="text" class="scenario-name" value="${scenario.name || '新场景'}">
    
    <label>模型</label>
    <select class="scenario-model">
      <option value="gpt-3.5-turbo" ${scenario.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
      <option value="gpt-4" ${scenario.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
    </select>
    
    <label>提示词</label>
    <textarea class="scenario-prompt" rows="3">${scenario.prompt || '请翻译以下内容:'}</textarea>
    
    <button class="remove-scenario">删除</button>
  `;

    // 添加事件监听
    el.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            showStatus('scenarioStatus', '修改已保存');
            saveConfig();
        });
    });

    el.querySelector('.remove-scenario').addEventListener('click', () => {
        el.remove();
        saveConfig();
    });

    document.getElementById('scenariosContainer').appendChild(el);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();

    // API配置自动保存
    document.getElementById('apiEndpoint').addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            showStatus('apiStatus', '端点已保存');
            saveConfig();
        }, SAVE_DELAY);
    });

    document.getElementById('apiKey').addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            showStatus('apiStatus', '密钥已保存');
            saveConfig();
        }, SAVE_DELAY);
    });

    // 添加场景按钮
    document.getElementById('addScenario').addEventListener('click', () => {
        addScenarioToUI({});
        showStatus('scenarioStatus', '场景已添加');
        saveConfig();
    });
});
