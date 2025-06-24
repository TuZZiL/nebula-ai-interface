function updateCharCount() {
    if (userInput && charCount) { // Ensure elements exist
        const count = userInput.value.length;
        charCount.textContent = `${count}/1000`;

        if (count > 1000) {
            charCount.classList.add('text-red-500');
            charCount.classList.remove('dark:text-sora-gray-light');
        } else {
            charCount.classList.remove('text-red-500');
            charCount.classList.add('dark:text-sora-gray-light');
        }
    }
}

// Function to handle clicks within the messages container
function handleMessageContainerClick(event) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    // Handle Regenerate Images Button Click
    const regenerateButton = event.target.closest('.regenerate-images-btn');
    if (regenerateButton) {
        regenerateButton.classList.add('active');
        setTimeout(() => {
            regenerateButton.classList.remove('active');
        }, 200);
        const messageDiv = regenerateButton.closest('[data-image-prompt]');
        if (messageDiv && messageDiv.dataset.imagePrompt) {
            // Ensure regenerateImages function is accessible (e.g., from imageHandler.js)
            if (typeof regenerateImages === 'function') {
                regenerateImages(messageDiv);
            } else {
                console.error("regenerateImages function not found.");
                if(typeof showAlert === 'function') showAlert('Error: Image regeneration feature is unavailable.', 'error');
            }
        } else {
            console.error("Could not find original prompt for regeneration");
            if(typeof showAlert === 'function') showAlert('Error: Could not find original prompt.', 'error');
        }
        return;
    }

    // Handle Code Block Click (for adding copy buttons if not already present)
    const codeBlock = event.target.closest('pre code');
    if (codeBlock && !codeBlock.parentElement.querySelector('.code-copy-btn')) {
        const pre = codeBlock.parentElement;
        if (pre && pre.tagName === 'PRE') {
            pre.style.position = 'relative';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.title = 'Copy code';
            copyBtn.dataset.codeToCopy = codeBlock.textContent;
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(copyBtn.dataset.codeToCopy).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    if(typeof showAlert === 'function') showAlert('Code copied!', 'success');
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
                }).catch(err => {
                    console.error('Clipboard write failed:', err);
                    if(typeof showAlert === 'function') showAlert('Failed to copy code.', 'error');
                });
            });
            pre.appendChild(copyBtn);
        }
        return;
    }

    // Handle General Copy Button Click (for non-code block messages)
    const copyButton = event.target.closest('.copy-button:not(.code-copy-btn)'); // Exclude code-copy-btn
    if (copyButton) {
        const rawContent = copyButton.dataset.rawContent;
        if (rawContent) {
            // Ensure escapeHtml is available (e.g. from utils.js)
            const cleanedContent = typeof escapeHtml === 'function' ? rawContent.replace(/([*_`~#])/g, '') : rawContent.replace(/([*_`~#])/g, ''); // Basic cleaning
            navigator.clipboard.writeText(cleanedContent).then(() => {
                const icon = copyButton.querySelector('i');
                if (icon) icon.classList.replace('fa-copy', 'fa-check');
                if(typeof showAlert === 'function') showAlert('Copied to clipboard!', 'success');
                setTimeout(() => {
                    if (icon) icon.classList.replace('fa-check', 'fa-copy');
                }, 1500);
            }).catch(err => {
                console.error('Clipboard write failed:', err);
                if(typeof showAlert === 'function') showAlert('Failed to copy text.', 'error');
            });
        }
        return;
    }

    // Handle Image Thumbnail Click
    const imageThumbnail = event.target.closest('.chat-image-thumbnail');
    if (imageThumbnail) {
        const imageUrl = imageThumbnail.getAttribute('src');
        if (imageUrl) {
            const fullSizeImagePreview = document.getElementById('fullSizeImagePreview');
            const loadingIndicator = document.getElementById('imageLoadingIndicator');

            if (fullSizeImagePreview) {
                if (loadingIndicator) loadingIndicator.classList.remove('hidden');
                fullSizeImagePreview.classList.add('opacity-0');

                const preloadImage = new Image();
                preloadImage.onload = function() {
                    fullSizeImagePreview.setAttribute('src', imageUrl);
                    if (loadingIndicator) loadingIndicator.classList.add('hidden');
                    setTimeout(() => { fullSizeImagePreview.classList.remove('opacity-0'); }, 50);
                };
                preloadImage.onerror = function() {
                    if(typeof showAlert === 'function') showAlert('Failed to load full-size image', 'error');
                    if (loadingIndicator) loadingIndicator.classList.add('hidden');
                    // Optionally show error in preview area
                };
                preloadImage.src = imageUrl;
                // Ensure toggleImagePreviewModal is accessible (e.g. from imageHandler.js)
                if (typeof toggleImagePreviewModal === 'function') {
                    toggleImagePreviewModal(true);
                } else {
                     console.error("toggleImagePreviewModal function not found.");
                }
            }
        }
    }
}
// Feature 1: Dynamic Textarea Resizing
function resizeTextarea() {
    if (!userInput) return; // Ensure userInput element exists

    // Get max-height from CSS (e.g., "7.5rem") and convert to pixels
    // This is a simplified approach. A more robust method would be to use getComputedStyle
    // or CSS custom properties if the value is dynamic or complex.
    const cssMaxHeight = getComputedStyle(userInput).maxHeight; // e.g., "120px" or "7.5rem"
    let maxHeightInPx;

    if (cssMaxHeight.endsWith('px')) {
        maxHeightInPx = parseFloat(cssMaxHeight);
    } else if (cssMaxHeight.endsWith('rem')) {
        // Assuming 1rem = 16px (browser default). This might not always be accurate.
        // A better way is to get the root font size: parseFloat(getComputedStyle(document.documentElement).fontSize)
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        maxHeightInPx = parseFloat(cssMaxHeight) * rootFontSize;
    } else {
        // Fallback if parsing fails, e.g. if max-height is 'none' or an unexpected unit
        // Use a sensible default or log an error. For now, using a default based on 5 lines.
        const approxLineHeight = parseFloat(getComputedStyle(userInput).lineHeight) || 24; // Approx line height in px
        maxHeightInPx = approxLineHeight * 5; // Default to 5 lines
        console.warn(`Could not parse userInput maxHeight ('${cssMaxHeight}'). Falling back to ${maxHeightInPx}px.`);
    }


    userInput.style.height = 'auto'; // Temporarily shrink to content
    let newHeight = userInput.scrollHeight;

    if (newHeight > maxHeightInPx) {
        userInput.style.height = maxHeightInPx + 'px';
        userInput.style.overflowY = 'auto';
    } else {
        userInput.style.height = newHeight + 'px';
        userInput.style.overflowY = 'hidden';
    }
}

// Initialize and add event listener for textarea resizing
// Ensure this runs after userInput is defined and the DOM is ready.
// If uiElements.js defines userInput, this should be fine if uiInteractions.js is loaded after it.
// Otherwise, wrap in DOMContentLoaded or ensure uiElements are available.
if (userInput) {
    userInput.addEventListener('input', resizeTextarea);
    // Initial resize on page load
    // Add a small delay to ensure styles are applied, especially if loaded async
    setTimeout(resizeTextarea, 50);
} else {
    // Fallback if userInput is not immediately available
    document.addEventListener('DOMContentLoaded', () => {
        // userInput should be globally available or from uiElements.js
        // This assumes uiElements.js has run and populated global/exported variables
        if (typeof userInput !== 'undefined' && userInput) {
             userInput.addEventListener('input', resizeTextarea);
             setTimeout(resizeTextarea, 50); // Initial resize
        } else {
            console.error("userInput element not found for dynamic resizing.");
        }
    });
}
// Feature 2: "Clear Input" Button
function setupClearInputButton() {
    // Assume clearInputBtn and userInput are available (e.g., from uiElements.js or globally)
    // If not, ensure they are selected here or passed as arguments.
    const clearButton = clearInputBtn; // Assuming clearInputBtn is a global const from uiElements.js
    const inputField = userInput; // Assuming userInput is a global const from uiElements.js

    if (!clearButton || !inputField) {
        console.error("Clear input button or user input field not found.");
        return;
    }

    const toggleClearButtonVisibility = () => {
        if (inputField.value.length > 0) {
            clearButton.classList.remove('hidden');
        } else {
            clearButton.classList.add('hidden');
        }
    };

    inputField.addEventListener('input', () => {
        toggleClearButtonVisibility();
        // resizeTextarea(); // resizeTextarea is already called by its own listener
    });

    clearButton.addEventListener('click', () => {
        inputField.value = '';
        clearButton.classList.add('hidden');
        // Dispatch an input event to trigger other listeners (like char count, resize)
        inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        inputField.focus();
    });

    // Initial check for visibility on page load
    toggleClearButtonVisibility();
}

// Call setup function
// Ensure this runs after clearInputBtn and userInput are defined and the DOM is ready.
// Similar to resizeTextarea, this depends on when uiElements.js runs.
if (typeof clearInputBtn !== 'undefined' && clearInputBtn && typeof userInput !== 'undefined' && userInput) {
    setupClearInputButton();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        // This assumes uiElements.js has run and populated global/exported variables
        if (typeof clearInputBtn !== 'undefined' && clearInputBtn && typeof userInput !== 'undefined' && userInput) {
            setupClearInputButton();
        } else {
            console.error("userInput or clearInputBtn element not found for clear button setup.");
            // Attempt to select them if not globally available
            const localClearInputBtn = document.getElementById('clearInputBtn');
            const localUserInput = document.getElementById('userInput');
            if (localClearInputBtn && localUserInput) {
                // Make them available for the function if found
                window.clearInputBtn = localClearInputBtn; // Or pass as params
                window.userInput = localUserInput; // Or pass as params
                setupClearInputButton();
            } else {
                 console.error("Failed to find userInput or clearInputBtn even after DOMContentLoaded.");
            }
        }
    });
}
// --- Prompt Library Modal ---

function populatePromptList() {
    const promptListContainer = document.getElementById('promptListContainer');
    if (!promptListContainer) return;

    promptListContainer.innerHTML = ''; // Clear existing list
    const prompts = getPrompts();
    const sortedPrompts = Object.entries(prompts).sort((a, b) => a[1].title.localeCompare(b[1].title));

    if (sortedPrompts.length === 0) {
        promptListContainer.innerHTML = `<p class="text-center text-sm text-gray-500 dark:text-sora-gray-light p-4">No prompts saved yet.</p>`;
        return;
    }

    for (const [id, prompt] of sortedPrompts) {
        const item = document.createElement('div');
        item.className = 'flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-sora-gray-medium transition-colors';
        item.dataset.id = id;

        const titleSpan = document.createElement('span');
        titleSpan.textContent = prompt.title;
        titleSpan.className = 'flex-grow';

        const useButton = document.createElement('button');
        useButton.className = 'p-1 rounded text-gray-400 hover:text-primary-500 dark:hover:text-white transition-colors ml-2';
        useButton.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i>';
        useButton.title = 'Use this prompt';
        
        useButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the item click from firing
            const prompts = getPrompts();
            const selectedPrompt = prompts[id];
            if (selectedPrompt) {
                systemPromptInput.value = selectedPrompt.content;
                showAlert('Prompt applied!', 'success');
                updateSystemPromptIndicator();
                // Close both modals
                const promptLibraryModal = document.getElementById('promptLibraryModal');
                if (promptLibraryModal) {
                    const toggleModal = (show) => {
                         if (show) {
                            promptLibraryModal.classList.remove('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
                            promptLibraryModal.classList.add('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
                        } else {
                            promptLibraryModal.classList.remove('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
                            promptLibraryModal.classList.add('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
                        }
                    };
                    toggleModal(false);
                }
                toggleParamsPanel(); // Also close the main settings panel
            }
        });

        item.addEventListener('click', () => {
            const selected = document.querySelector('.prompt-item-selected');
            if (selected) {
                selected.classList.remove('prompt-item-selected', 'bg-primary-100', 'dark:bg-primary-900');
            }
            item.classList.add('prompt-item-selected', 'bg-primary-100', 'dark:bg-primary-900');
            loadPromptIntoEditor(id);
        });
        
        item.appendChild(titleSpan);
        item.appendChild(useButton);
        promptListContainer.appendChild(item);
    }
}

function loadPromptIntoEditor(id) {
    const prompts = getPrompts();
    const prompt = prompts[id];
    if (prompt) {
        document.getElementById('promptTitleInput').value = prompt.title;
        document.getElementById('promptContentTextarea').value = prompt.content;
        document.getElementById('savePromptBtn').dataset.id = id;
        document.getElementById('deletePromptBtn').dataset.id = id;
        document.getElementById('deletePromptBtn').classList.remove('hidden');
    }
}

function clearEditor() {
    document.getElementById('promptTitleInput').value = '';
    document.getElementById('promptContentTextarea').value = '';
    document.getElementById('savePromptBtn').removeAttribute('data-id');
    document.getElementById('deletePromptBtn').removeAttribute('data-id');
    document.getElementById('deletePromptBtn').classList.add('hidden');
    const selected = document.querySelector('.prompt-item-selected');
    if (selected) {
        selected.classList.remove('prompt-item-selected', 'bg-primary-100', 'dark:bg-primary-900');
    }
}

function setupPromptLibraryModal() {
    const promptLibraryBtn = document.getElementById('promptLibraryBtn');
    const promptLibraryModal = document.getElementById('promptLibraryModal');
    const closePromptLibraryBtn = document.getElementById('closePromptLibraryBtn');
    const addNewPromptBtn = document.getElementById('addNewPromptBtn');
    const savePromptBtn = document.getElementById('savePromptBtn');
    const deletePromptBtn = document.getElementById('deletePromptBtn');

    if (!promptLibraryBtn || !promptLibraryModal || !closePromptLibraryBtn || !addNewPromptBtn || !savePromptBtn || !deletePromptBtn) {
        console.error('Prompt library modal elements not found.');
        return;
    }

    const toggleModal = (show) => {
        if (show) {
            populatePromptList();
            clearEditor();
            promptLibraryModal.classList.remove('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
            promptLibraryModal.classList.add('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        } else {
            promptLibraryModal.classList.remove('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
            promptLibraryModal.classList.add('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
        }
    };

    promptLibraryBtn.addEventListener('click', () => toggleModal(true));
    closePromptLibraryBtn.addEventListener('click', () => toggleModal(false));
    addNewPromptBtn.addEventListener('click', clearEditor);

    savePromptBtn.addEventListener('click', () => {
        const id = savePromptBtn.dataset.id || `prompt_${Date.now()}`;
        const title = document.getElementById('promptTitleInput').value.trim();
        const content = document.getElementById('promptContentTextarea').value.trim();

        if (!title || !content) {
            showAlert('Title and content cannot be empty.', 'error');
            return;
        }

        savePrompt(id, title, content);
        showAlert('Prompt saved!', 'success');
        populatePromptList();
        
        // Refresh library prompts in system prompt manager
        if (typeof refreshLibraryPrompts === 'function') {
            refreshLibraryPrompts();
        }
        // Highlight the saved prompt
        setTimeout(() => {
            const items = document.querySelectorAll('#promptListContainer > div');
            items.forEach(item => {
                if (item.dataset.id === id) {
                    item.classList.add('prompt-item-selected', 'bg-primary-100', 'dark:bg-primary-900');
                    loadPromptIntoEditor(id);
                }
            });
        }, 100);
    });

    deletePromptBtn.addEventListener('click', () => {
        const id = deletePromptBtn.dataset.id;
        if (id && confirm('Are you sure you want to delete this prompt?')) {
            deletePrompt(id);
            showAlert('Prompt deleted.', 'success');
            populatePromptList();
            clearEditor();
            
            // Refresh library prompts in system prompt manager
            if (typeof refreshLibraryPrompts === 'function') {
                refreshLibraryPrompts();
            }
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !promptLibraryModal.classList.contains('invisible')) {
            toggleModal(false);
        }
    });
}

// Call the setup function after DOM is loaded
document.addEventListener('DOMContentLoaded', setupPromptLibraryModal);