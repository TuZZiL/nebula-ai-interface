// --- Prompt Library Storage Functions ---
const PROMPT_LIBRARY_KEY = 'promptLibrary';

/**
 * Retrieves all prompts from Local Storage.
 * @returns {Object} An object containing the prompts.
 */
function getPrompts() {
    try {
        const prompts = localStorage.getItem(PROMPT_LIBRARY_KEY);
        return prompts ? JSON.parse(prompts) : {};
    } catch (error) {
        console.error("Error reading prompts from Local Storage:", error);
        return {};
    }
}

/**
 * Saves a single prompt to Local Storage.
 * @param {string} id - The unique identifier for the prompt.
 * @param {string} title - The title of the prompt.
 * @param {string} content - The content of the prompt.
 */
function savePrompt(id, title, content) {
    try {
        const prompts = getPrompts();
        prompts[id] = { title, content };
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(prompts));
    } catch (error) {
        console.error("Error saving prompt to Local Storage:", error);
        showAlert('Failed to save prompt.', 'error');
    }
}

/**
 * Deletes a prompt from Local Storage.
 * @param {string} id - The unique identifier for the prompt to delete.
 */
function deletePrompt(id) {
    try {
        const prompts = getPrompts();
        delete prompts[id];
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(prompts));
    } catch (error) {
        console.error("Error deleting prompt from Local Storage:", error);
        showAlert('Failed to delete prompt.', 'error');
    }
}
// --- Settings Functions ---
function saveSettings() {
    const settingsToSave = {
        systemPrompt: systemPromptInput.value,
        apiToken: apiToken.value, // Note: Saving token is insecure
        model: modelSelect.value,
        temperature: temperature.value,
        maxTokens: maxTokens.value,
        stream: streamCheckbox.checked,
        theme: localStorage.getItem('themePreference') || 'dark', // Add theme preference
        // Image settings
        imageResolution: imageResolution.value,
        imageShift: imageShift.value
    };
    try {
        localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
        showAlert('Settings saved successfully!', 'success');
        updateSystemPromptIndicator();
    } catch (error) {
        console.error("Error saving settings to Local Storage:", error);
        showAlert('Failed to save settings.', 'error');
    }
}

function loadSettings() {
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('dark'); // Default to dark if nothing saved
    }

    const savedSettingsString = localStorage.getItem('userSettings');
    if (savedSettingsString) {
        try {
            const loadedSettings = JSON.parse(savedSettingsString);

            if (loadedSettings.systemPrompt !== undefined) {
                 systemPromptInput.value = loadedSettings.systemPrompt;
            }
             if (loadedSettings.apiToken !== undefined) {
                 apiToken.value = loadedSettings.apiToken;
            }
             if (loadedSettings.model !== undefined) {
                 modelSelect.value = loadedSettings.model;
            }

            updateSystemPromptIndicator();
            if (loadedSettings.temperature !== undefined) {
                 temperature.value = loadedSettings.temperature;
                 updateTemperatureValue();
            }
             if (loadedSettings.maxTokens !== undefined) {
                 maxTokens.value = loadedSettings.maxTokens;
                 updateMaxTokensValue();
            }
            if (loadedSettings.stream !== undefined) {
                 streamCheckbox.checked = loadedSettings.stream;
            }
            if (loadedSettings.imageResolution !== undefined) {
                imageResolution.value = loadedSettings.imageResolution;
            }
            if (loadedSettings.imageShift !== undefined) {
                imageShift.value = loadedSettings.imageShift;
            }
        } catch (error) {
            console.error("Error loading settings from Local Storage:", error);
            localStorage.removeItem('userSettings');
        }
    }
}

function updateTemperatureValue() {
    if (tempValue) tempValue.textContent = temperature.value;
}

function updateMaxTokensValue() {
    if (maxTokensValue) maxTokensValue.textContent = maxTokens.value;
}

function setTheme(themeName) {
    const icon = themeToggle.querySelector('i');
    if (themeName === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('themePreference', 'dark');
        if (icon) icon.className = 'fas fa-sun text-white';
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('themePreference', 'light');
        if (icon) icon.className = 'fas fa-moon text-primary-500';
    }
}

function toggleTheme() {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    setTheme(newTheme);
}

function toggleParamsPanel() {
    if (paramsPanel.classList.contains('opacity-0')) {
        paramsPanel.classList.remove('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
        paramsPanel.classList.add('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
    } else {
        paramsPanel.classList.remove('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        paramsPanel.classList.add('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
    }
}

function toggleTokenVisibilityHandler() {
    if (apiToken.type === 'password') {
        apiToken.type = 'text';
        toggleTokenVisibility.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        apiToken.type = 'password';
        toggleTokenVisibility.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// --- System Prompt Editor Functions ---
function toggleSystemPromptEditor(show) {
    if (show) {
        systemPromptEditorModal.classList.remove('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
        systemPromptEditorModal.classList.add('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
    } else {
        systemPromptEditorModal.classList.remove('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        systemPromptEditorModal.classList.add('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
    }
}

function openSystemPromptEditor() {
    systemPromptEditorTextarea.value = systemPromptInput.value;
    toggleSystemPromptEditor(true);
    systemPromptEditorTextarea.focus();
}

function closeSystemPromptEditor() {
    toggleSystemPromptEditor(false);
}

function saveSystemPromptFromEditor() {
    systemPromptInput.value = systemPromptEditorTextarea.value;
    closeSystemPromptEditor();
    updateSystemPromptIndicator();
    // showAlert('System prompt updated.', 'success'); // Optionally provide feedback
}

function updateSystemPromptIndicator() {
    const systemPromptValue = systemPromptInput.value.trim();
    if (systemPromptIndicator) { // Check if element exists
        if (systemPromptValue) {
            systemPromptIndicator.classList.remove('hidden');
            const truncatedPrompt = systemPromptValue.length > 50
                ? systemPromptValue.substring(0, 50) + '...'
                : systemPromptValue;
            systemPromptIndicator.setAttribute('title', `Active System Prompt: "${truncatedPrompt}"`);
        } else {
            systemPromptIndicator.classList.add('hidden');
            systemPromptIndicator.setAttribute('title', ''); // Clear title when hidden
        }
    }
}

/**
 * Applies model-specific settings, like adjusting max tokens.
 * This function should be called after model selection changes or settings are loaded.
 */
function applyModelSpecificSettings() {
    if (!modelSelect || !maxTokens || typeof updateMaxTokensValue !== 'function' || typeof modelConfigurations === 'undefined') {
        console.warn("Cannot apply model-specific settings: required elements or config not found.");
        return;
    }

    const selectedModel = modelSelect.value;
    const config = modelConfigurations[selectedModel.toLowerCase()] || modelConfigurations['default'];

    if (config && config.maxTokens) {
        // First, update the max attribute of the slider itself
        maxTokens.max = config.maxTokens;
        // Then, set the value
        maxTokens.value = config.maxTokens;
        // Finally, update the text display
        updateMaxTokensValue(); // Update the UI to reflect the change
    }
}
// --- End Settings Functions ---