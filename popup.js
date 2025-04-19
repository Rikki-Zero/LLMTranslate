document.addEventListener('DOMContentLoaded', () => {
  // 加载场景和设置
  chrome.storage.sync.get(['translatorConfig', 'triggerMode'], (result) => {
    // 加载场景
    const scenarioSelect = document.getElementById('scenarioSelect');
    scenarioSelect.innerHTML = '';

    const scenarios = result.translatorConfig?.scenarios || [];
    if (scenarios.length === 0) {
      scenarioSelect.innerHTML = '<option value="">请先在选项中添加场景</option>';
    } else {
      scenarios.forEach(scenario => {
        const option = document.createElement('option');
        option.value = scenario.id;
        option.textContent = scenario.name;
        scenarioSelect.appendChild(option);
      });
    }

    // 加载触发方式
    const triggerMode = result.triggerMode || 'hover';
    document.querySelector(`input[value="${triggerMode}"]`).checked = true;
  });

  // 保存触发方式设置
  document.getElementById('saveTrigger').addEventListener('click', () => {
    const triggerMode = document.querySelector('input[name="trigger"]:checked').value;
    chrome.storage.sync.set({ triggerMode }, () => {
      alert('触发方式已保存');
      window.close();
    });
  });
});
