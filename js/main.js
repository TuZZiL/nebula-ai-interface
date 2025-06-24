// --- State Variables ---
let isImageModeActive = false; // Track if image generation mode is on

// --- Main Send Message Function (Orchestrator) ---
function sendMessage() {
    console.log("sendMessage called. isImageModeActive:", isImageModeActive);
    const prompt = userInput.value.trim(); // userInput should be from uiElements.js
    if (!prompt) return;

    // Ensure addUserTextMessage is available (from messageHandler.js)
    if (typeof addUserTextMessage === 'function') {
        addUserTextMessage('user', prompt);
    } else {
        console.error("addUserTextMessage function not found in sendMessage.");
        return;
    }
    
    userInput.value = '';
    if (typeof updateCharCount === 'function') updateCharCount(); // updateCharCount from uiInteractions.js

    let token = apiToken.value.trim(); // apiToken from uiElements.js
    if (!token) {
        token = DEFAULT_API_KEY; // DEFAULT_API_KEY from config.js
    }

    if (!token || token === "YOUR_DEFAULT_API_KEY_HERE") {
        // Ensure showAlert is available (from utils.js)
        if (typeof showAlert === 'function') showAlert('API token missing.', 'error');
        return;
    }

    if (isImageModeActive) {
        const timestamp = Date.now();
        const loadingId1 = `image-loading-1-${timestamp}`;
        const loadingId2 = `image-loading-2-${timestamp}`;

        // Ensure addImageLoadingIndicator and callImageAPI are available (from imageHandler.js)
        if (typeof addImageLoadingIndicator === 'function') {
            addImageLoadingIndicator(loadingId1, loadingId2, prompt);
        } else {
            console.error("addImageLoadingIndicator function not found.");
            return;
        }
        
        if (typeof callImageAPI === 'function') {
            Promise.allSettled([
                callImageAPI(prompt, token, loadingId1),
                callImageAPI(prompt, token, loadingId2)
            ]).then(results => {
                console.log("Image generation results:", results);
                // Ensure updateImageLoadingIndicator is available (from imageHandler.js)
                if (typeof updateImageLoadingIndicator === 'function') {
                    updateImageLoadingIndicator(loadingId1, results[0]);
                    updateImageLoadingIndicator(loadingId2, results[1]);
                } else {
                    console.error("updateImageLoadingIndicator function not found.");
                }
            });
        } else {
            console.error("callImageAPI function not found.");
            return;
        }
    } else {
        const loadingId = 'loading-' + Date.now();
        // Ensure addLoadingIndicator is available (from messageHandler.js)
        if (typeof addLoadingIndicator === 'function') {
            addLoadingIndicator(loadingId);
        } else {
            console.error("addLoadingIndicator function not found.");
            return;
        }
        
        const requestData = {
            model: modelSelect.value, // modelSelect from uiElements.js
            messages: getConversationHistory(), // getConversationHistory needs to be defined or moved
            stream: streamCheckbox.checked, // streamCheckbox from uiElements.js
            max_tokens: parseInt(maxTokens.value), // maxTokens from uiElements.js
            temperature: parseFloat(temperature.value) // temperature from uiElements.js
        };
        // Ensure callAPI (for text) is available (from api.js)
        if (typeof callAPI === 'function') {
            callAPI(requestData, loadingId);
        } else {
            console.error("callAPI (text) function not found.");
        }
    }
}

// --- Conversation History ---
// This function was previously part of the main script block.
function getConversationHistory() {
    const messages = [];
    // Get system prompt from the system prompt manager
    const systemPromptValue = typeof getCurrentSystemPromptContent === 'function' 
        ? getCurrentSystemPromptContent() 
        : (systemPromptInput?.value.trim() || '');

    if (systemPromptValue) {
        messages.push({ role: 'system', content: systemPromptValue });
    }
    
    // messagesContainer needs to be defined here, or passed, or uiElements.js needs DOMContentLoaded
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        const messageElements = messagesContainer.querySelectorAll('.relative.rounded-lg.p-4');
        messageElements.forEach(el => {
            const roleElement = el.querySelector('p.font-medium');
            const roleText = roleElement?.textContent.trim().toLowerCase();
            const role = roleText === 'you' ? 'user' : 'assistant';

            const contentElement = el.querySelector('.message-stream');
            // Use rawContent from copy button if available, otherwise textContent
            const copyButton = el.querySelector('.copy-button');
            let content = contentElement?.textContent || '';
            if (copyButton && copyButton.dataset.rawContent) {
                content = copyButton.dataset.rawContent;
            }
            
            if (content && !el.querySelector('.typing-indicator') && !el.querySelector('.fa-images')) { // Exclude image bubbles
                messages.push({
                    role: role,
                    content: content.trim()
                });
            }
        });
    } else {
        console.warn("messagesContainer not found in getConversationHistory. History might be incomplete.");
    }
    return messages;
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // Define elements that might not exist before DOM is fully loaded
    const messagesContainer = document.getElementById('messagesContainer');
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const fullSizeImagePreview = document.getElementById('fullSizeImagePreview');
    const closeImagePreviewModalBtn = document.getElementById('closeImagePreviewModal'); // Renamed for clarity

    // Initialize functions that depend on DOM elements
    if (typeof updateCharCount === 'function') updateCharCount();
    if (typeof updateTemperatureValue === 'function') updateTemperatureValue(); // from settings.js
    if (typeof updateMaxTokensValue === 'function') updateMaxTokensValue();   // from settings.js
    if (typeof loadSettings === 'function') {
        loadSettings();                 // from settings.js
        // Apply model-specific settings right after loading the saved model
        if (typeof applyModelSpecificSettings === 'function') {
            setTimeout(applyModelSpecificSettings, 0); // Use a tiny delay to ensure DOM is ready
        }
    }
    if (typeof updateSystemPromptIndicator === 'function') updateSystemPromptIndicator(); // from settings.js
    
    // Initialize system prompt manager
    if (typeof initializeSystemPromptManager === 'function') {
        initializeSystemPromptManager();
    }

    // Attach Event Listeners
    // userInput, sendBtn, etc. are from uiElements.js and should be available globally if not using modules
    if (userInput) userInput.addEventListener('input', updateCharCount); // updateCharCount from uiInteractions.js
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    if (clearChat) clearChat.addEventListener('click', clearMessages); // clearMessages from messageHandler.js
    if (toggleParamsBtnHeader) toggleParamsBtnHeader.addEventListener('click', toggleParamsPanel); // from settings.js
    if (closeParamsModal) closeParamsModal.addEventListener('click', toggleParamsPanel); // from settings.js
    if (toggleTokenVisibility) toggleTokenVisibility.addEventListener('click', toggleTokenVisibilityHandler); // from settings.js
    if (temperature) temperature.addEventListener('input', updateTemperatureValue); // from settings.js
    if (maxTokens) maxTokens.addEventListener('input', updateMaxTokensValue);   // from settings.js
    if (modelSelect) modelSelect.addEventListener('change', applyModelSpecificSettings); // from settings.js
    if (testConnectionBtn) testConnectionBtn.addEventListener('click', testConnection); // from api.js
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);       // from settings.js
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings); // from settings.js
    if (settingsDarkBtn) settingsDarkBtn.addEventListener('click', () => setTheme('dark')); // setTheme from settings.js
    if (settingsLightBtn) settingsLightBtn.addEventListener('click', () => setTheme('light')); // setTheme from settings.js
    
    // System Prompt Editor Listeners (ensure elements are from uiElements.js)
    if (expandSystemPromptBtn) expandSystemPromptBtn.addEventListener('click', openSystemPromptEditor); // from settings.js
    if (closeSystemPromptEditorBtn) closeSystemPromptEditorBtn.addEventListener('click', closeSystemPromptEditor); // from settings.js
    if (cancelSystemPromptEditorBtn) cancelSystemPromptEditorBtn.addEventListener('click', closeSystemPromptEditor); // from settings.js
    if (saveSystemPromptEditorBtn) saveSystemPromptEditorBtn.addEventListener('click', saveSystemPromptFromEditor); // from settings.js
    if (systemPromptInput) systemPromptInput.addEventListener('input', updateSystemPromptIndicator); // from settings.js
    if (systemPromptIndicator) systemPromptIndicator.addEventListener('click', toggleParamsPanel); // from settings.js

    // Image Generation Listeners (ensure elements are from uiElements.js)
    if (createImageBtn) createImageBtn.addEventListener('click', toggleImageMode); // from imageHandler.js

    // Message Container Click Listener
    if (messagesContainer) {
        messagesContainer.addEventListener('click', handleMessageContainerClick); // from uiInteractions.js
    } else {
        console.error("ERROR: Could not find messagesContainer element in DOMContentLoaded!");
    }

    // Image Preview Modal Listeners
    if (closeImagePreviewModalBtn) {
         closeImagePreviewModalBtn.addEventListener('click', () => toggleImagePreviewModal(false)); // from imageHandler.js
    }
    if (imagePreviewModal) {
        imagePreviewModal.addEventListener('click', (e) => {
            if (e.target === imagePreviewModal) { // Click on backdrop
                if (typeof toggleImagePreviewModal === 'function') toggleImagePreviewModal(false);
            }
        });
    }
    
    // Initialize KaTeX and Prism.js for any existing content
    setTimeout(() => {
        if (typeof initKaTeX === 'function') initKaTeX(document.body); // from rendering.js
        if (window.Prism && typeof highlightCodeBlocks === 'function') { // from rendering.js
            document.querySelectorAll('pre code').forEach(block => {
                if (block.parentElement) highlightCodeBlocks(block.parentElement);
            });
        }
    }, 500);

    // Prism.js MutationObserver for dynamic content
    if (window.Prism && typeof highlightCodeBlocks === 'function') {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            const codeBlocks = node.querySelectorAll('pre code');
                            if (codeBlocks.length > 0) {
                                codeBlocks.forEach(function(block) {
                                   if (block.parentElement) highlightCodeBlocks(block.parentElement);
                                });
                            }
                        }
                    });
                }
            });
        });
        if (messagesContainer) observer.observe(messagesContainer, { childList: true, subtree: true });
    }
});

// Ensure Prism.js initialization script from <head> is still effective or replicated if needed.
// The Prism auto-loader and specific language components are loaded via CDN in <head>.
// The highlightCodeBlocks function should handle applying Prism to new and existing blocks.