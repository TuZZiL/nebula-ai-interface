// --- System Prompt Manager ---
// Manages different sources of system prompts: built-in files, manual input, and library

/**
 * System prompt source types
 */
const PROMPT_SOURCES = {
    FILE: 'file',
    MANUAL: 'manual',
    LIBRARY: 'library'
};

/**
 * Current system prompt configuration
 */
let currentSystemPromptConfig = {
    source: PROMPT_SOURCES.FILE, // Default to built-in file
    promptId: 'nsfwbase', // Default built-in prompt ID
    content: '' // Current active content
};

/**
 * Initialize system prompt manager
 */
function initializeSystemPromptManager() {
    // Load saved configuration
    loadSystemPromptConfig();
    
    // Set up event listeners
    setupSystemPromptEventListeners();
    
    // Initialize UI
    updateSystemPromptUI();
    
    // Load built-in prompt content
    loadBuiltInPromptContent();
    
    // Populate library prompts
    populateLibraryPrompts();
}

/**
 * Load system prompt configuration from localStorage
 */
function loadSystemPromptConfig() {
    try {
        const savedConfig = localStorage.getItem('systemPromptConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            currentSystemPromptConfig = { ...currentSystemPromptConfig, ...config };
        }
    } catch (error) {
        console.error('Error loading system prompt config:', error);
    }
}

/**
 * Save system prompt configuration to localStorage
 */
function saveSystemPromptConfig() {
    try {
        localStorage.setItem('systemPromptConfig', JSON.stringify(currentSystemPromptConfig));
    } catch (error) {
        console.error('Error saving system prompt config:', error);
    }
}

/**
 * Set up event listeners for system prompt elements
 */
function setupSystemPromptEventListeners() {
    // Source selector change
    if (systemPromptSource) {
        systemPromptSource.addEventListener('change', handleSystemPromptSourceChange);
    }
    
    // Copy file prompt button
    if (copyFilePromptBtn) {
        copyFilePromptBtn.addEventListener('click', copyFilePromptToManual);
    }
    
    // Library prompt selector change
    if (libraryPromptSelect) {
        libraryPromptSelect.addEventListener('change', handleLibraryPromptChange);
    }
    
    // Manual input change
    if (systemPromptInput) {
        systemPromptInput.addEventListener('input', handleManualPromptChange);
    }
}

/**
 * Handle system prompt source change
 */
function handleSystemPromptSourceChange() {
    const newSource = systemPromptSource.value;
    currentSystemPromptConfig.source = newSource;
    
    updateSystemPromptUI();
    updateSystemPromptContent();
    saveSystemPromptConfig();
}

/**
 * Handle library prompt selection change
 */
function handleLibraryPromptChange() {
    const selectedPromptId = libraryPromptSelect.value;
    if (selectedPromptId) {
        const prompts = getPrompts(); // From settings.js
        const selectedPrompt = prompts[selectedPromptId];
        if (selectedPrompt) {
            currentSystemPromptConfig.promptId = selectedPromptId;
            currentSystemPromptConfig.content = selectedPrompt.content;
            
            // Update preview
            if (libraryPromptPreview) {
                libraryPromptPreview.textContent = selectedPrompt.content;
                libraryPromptPreview.classList.remove('hidden');
            }
            
            updateSystemPromptStatus();
            saveSystemPromptConfig();
        }
    } else {
        if (libraryPromptPreview) {
            libraryPromptPreview.classList.add('hidden');
        }
    }
}

/**
 * Handle manual prompt input change
 */
function handleManualPromptChange() {
    currentSystemPromptConfig.content = systemPromptInput.value;
    updateSystemPromptStatus();
    saveSystemPromptConfig();
}

/**
 * Copy file prompt to manual input
 */
function copyFilePromptToManual() {
    if (typeof getDefaultBuiltInPrompt === 'function') {
        const builtInPrompt = getDefaultBuiltInPrompt();
        if (builtInPrompt && systemPromptInput) {
            systemPromptInput.value = builtInPrompt.content;
            currentSystemPromptConfig.source = PROMPT_SOURCES.MANUAL;
            currentSystemPromptConfig.content = builtInPrompt.content;
            
            // Update UI
            systemPromptSource.value = PROMPT_SOURCES.MANUAL;
            updateSystemPromptUI();
            updateSystemPromptStatus();
            saveSystemPromptConfig();
            
            // Show success message
            if (typeof showAlert === 'function') {
                showAlert('Built-in prompt copied to manual settings!', 'success');
            }
        }
    }
}

/**
 * Update system prompt UI based on current source
 */
function updateSystemPromptUI() {
    const source = currentSystemPromptConfig.source;
    
    // Hide all containers first
    if (filePromptPreview) filePromptPreview.classList.add('hidden');
    if (manualPromptInput) manualPromptInput.classList.add('hidden');
    if (libraryPromptSelector) libraryPromptSelector.classList.add('hidden');
    
    // Show appropriate container with animation
    setTimeout(() => {
        switch (source) {
            case PROMPT_SOURCES.FILE:
                if (filePromptPreview) {
                    filePromptPreview.classList.remove('hidden');
                    filePromptPreview.classList.add('prompt-source-transition');
                }
                break;
            case PROMPT_SOURCES.MANUAL:
                if (manualPromptInput) {
                    manualPromptInput.classList.remove('hidden');
                    manualPromptInput.classList.add('prompt-source-transition');
                }
                break;
            case PROMPT_SOURCES.LIBRARY:
                if (libraryPromptSelector) {
                    libraryPromptSelector.classList.remove('hidden');
                    libraryPromptSelector.classList.add('prompt-source-transition');
                }
                break;
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            if (filePromptPreview) filePromptPreview.classList.remove('prompt-source-transition');
            if (manualPromptInput) manualPromptInput.classList.remove('prompt-source-transition');
            if (libraryPromptSelector) libraryPromptSelector.classList.remove('prompt-source-transition');
        }, 300);
    }, 50);
    
    // Update source selector
    if (systemPromptSource) {
        systemPromptSource.value = source;
    }
    
    updateSystemPromptStatus();
}

/**
 * Update system prompt content based on current source
 */
function updateSystemPromptContent() {
    const source = currentSystemPromptConfig.source;
    
    switch (source) {
        case PROMPT_SOURCES.FILE:
            loadBuiltInPromptContent();
            break;
        case PROMPT_SOURCES.MANUAL:
            // Content is already in systemPromptInput
            currentSystemPromptConfig.content = systemPromptInput ? systemPromptInput.value : '';
            break;
        case PROMPT_SOURCES.LIBRARY:
            // Content is set when library prompt is selected
            break;
    }
}

/**
 * Load built-in prompt content
 */
function loadBuiltInPromptContent() {
    if (typeof getDefaultBuiltInPrompt === 'function') {
        const builtInPrompt = getDefaultBuiltInPrompt();
        if (builtInPrompt && filePromptText) {
            filePromptText.textContent = builtInPrompt.content;
            currentSystemPromptConfig.content = builtInPrompt.content;
            currentSystemPromptConfig.promptId = builtInPrompt.id;
        }
    }
}

/**
 * Populate library prompts dropdown
 */
function populateLibraryPrompts() {
    if (!libraryPromptSelect || typeof getPrompts !== 'function') return;
    
    const prompts = getPrompts();
    
    // Clear existing options (except the first one)
    while (libraryPromptSelect.children.length > 1) {
        libraryPromptSelect.removeChild(libraryPromptSelect.lastChild);
    }
    
    // Add prompts from library
    Object.keys(prompts).forEach(promptId => {
        const prompt = prompts[promptId];
        const option = document.createElement('option');
        option.value = promptId;
        option.textContent = prompt.title || promptId;
        libraryPromptSelect.appendChild(option);
    });
    
    // If current source is library, select the current prompt
    if (currentSystemPromptConfig.source === PROMPT_SOURCES.LIBRARY && currentSystemPromptConfig.promptId) {
        libraryPromptSelect.value = currentSystemPromptConfig.promptId;
        handleLibraryPromptChange();
    }
}

/**
 * Update system prompt status indicator
 */
function updateSystemPromptStatus() {
    if (!systemPromptStatusText) return;
    
    const source = currentSystemPromptConfig.source;
    let statusText = '';
    
    switch (source) {
        case PROMPT_SOURCES.FILE:
            statusText = 'Using built-in prompt';
            break;
        case PROMPT_SOURCES.MANUAL:
            const hasContent = currentSystemPromptConfig.content && currentSystemPromptConfig.content.trim();
            statusText = hasContent ? 'Using manual prompt' : 'No manual prompt set';
            break;
        case PROMPT_SOURCES.LIBRARY:
            if (currentSystemPromptConfig.promptId) {
                const prompts = getPrompts();
                const prompt = prompts[currentSystemPromptConfig.promptId];
                statusText = prompt ? `Using: ${prompt.title}` : 'Library prompt not found';
            } else {
                statusText = 'No library prompt selected';
            }
            break;
    }
    
    systemPromptStatusText.textContent = statusText;
}

/**
 * Get the current active system prompt content
 * This function is used by the conversation history builder
 */
function getCurrentSystemPromptContent() {
    const source = currentSystemPromptConfig.source;
    
    switch (source) {
        case PROMPT_SOURCES.FILE:
            if (typeof getDefaultBuiltInPrompt === 'function') {
                const builtInPrompt = getDefaultBuiltInPrompt();
                return builtInPrompt ? builtInPrompt.content : '';
            }
            return '';
        case PROMPT_SOURCES.MANUAL:
            return systemPromptInput ? systemPromptInput.value.trim() : '';
        case PROMPT_SOURCES.LIBRARY:
            return currentSystemPromptConfig.content || '';
        default:
            return '';
    }
}

/**
 * Refresh library prompts (call this when library is updated)
 */
function refreshLibraryPrompts() {
    populateLibraryPrompts();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSystemPromptManager,
        getCurrentSystemPromptContent,
        refreshLibraryPrompts,
        PROMPT_SOURCES
    };
}