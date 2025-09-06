const KEY = 'userPrompt';
const DEFAULT_PROMPT = 'Summarize';

const form = document.getElementById('form');
const textarea = document.getElementById('prompt');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');

function showStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
  if (!isError && msg) setTimeout(() => (statusEl.textContent = ''), 1500);
}

async function load() {
  try {
    const obj = await chrome.storage.sync.get({ [KEY]: DEFAULT_PROMPT });
    textarea.value = (obj[KEY] || DEFAULT_PROMPT).trim();
  } catch (e) {
    console.error(e);
    showStatus('Failed to load', true);
  }
}

async function save(value) {
  await chrome.storage.sync.set({ [KEY]: value });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = (textarea.value || '').trim();
  try {
    await save(value || DEFAULT_PROMPT);
    showStatus('Saved');
  } catch (e) {
    console.error(e);
    showStatus('Failed to save', true);
  }
});

resetBtn.addEventListener('click', async () => {
  try {
    textarea.value = DEFAULT_PROMPT;
    await save(DEFAULT_PROMPT);
    showStatus('Reset to default');
  } catch (e) {
    console.error(e);
    showStatus('Failed to reset', true);
  }
});

load();
