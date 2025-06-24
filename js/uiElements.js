// DOM Elements
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
// const messagesContainer = document.getElementById('messagesContainer'); // To be defined in main.js after DOMContentLoaded
const clearChat = document.getElementById('clearChat');
const toggleParamsBtnHeader = document.getElementById('toggleParamsBtnHeader');
const paramsPanel = document.getElementById('paramsPanel');
const closeParamsModal = document.getElementById('closeParamsModal');
const apiToken = document.getElementById('apiToken');
const toggleTokenVisibility = document.getElementById('toggleTokenVisibility');
const modelSelect = document.getElementById('modelSelect');
const temperature = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const maxTokens = document.getElementById('maxTokens');
const maxTokensValue = document.getElementById('maxTokensValue');
const streamCheckbox = document.getElementById('streamCheckbox');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const charCount = document.getElementById('charCount');
const themeToggle = document.getElementById('themeToggle');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsDarkBtn = document.getElementById('settingsDarkBtn');
const settingsLightBtn = document.getElementById('settingsLightBtn');
// System Prompt Editor Elements
const systemPromptInput = document.getElementById('systemPromptInput');
const expandSystemPromptBtn = document.getElementById('expandSystemPromptBtn');
const systemPromptEditorModal = document.getElementById('systemPromptEditorModal');
const systemPromptEditorTextarea = document.getElementById('systemPromptEditorTextarea');
const systemPromptIndicator = document.getElementById('systemPromptIndicator');
const closeSystemPromptEditorBtn = document.getElementById('closeSystemPromptEditorBtn');
const saveSystemPromptEditorBtn = document.getElementById('saveSystemPromptEditorBtn');
const cancelSystemPromptEditorBtn = document.getElementById('cancelSystemPromptEditorBtn');
// System Prompt Source Elements
const systemPromptSource = document.getElementById('systemPromptSource');
const systemPromptContainer = document.getElementById('systemPromptContainer');
const filePromptPreview = document.getElementById('filePromptPreview');
const filePromptText = document.getElementById('filePromptText');
const copyFilePromptBtn = document.getElementById('copyFilePromptBtn');
const manualPromptInput = document.getElementById('manualPromptInput');
const libraryPromptSelector = document.getElementById('libraryPromptSelector');
const libraryPromptSelect = document.getElementById('libraryPromptSelect');
const libraryPromptPreview = document.getElementById('libraryPromptPreview');
const systemPromptStatus = document.getElementById('systemPromptStatus');
const systemPromptStatusText = document.getElementById('systemPromptStatusText');
// Image Generation Elements
const createImageBtn = document.getElementById('createImageBtn');
const imageSettings = document.getElementById('imageSettings');
const imageResolution = document.getElementById('imageResolution');
const imageShift = document.getElementById('imageShift');
// Image Preview Modal Elements (To be defined in main.js after DOMContentLoaded)
// const imagePreviewModal = document.getElementById('imagePreviewModal');
// const fullSizeImagePreview = document.getElementById('fullSizeImagePreview');
// const closeImagePreviewModal = document.getElementById('closeImagePreviewModal');

// Note: messagesContainer and imagePreviewModal related elements
// will be defined in main.js within DOMContentLoaded to ensure they exist.