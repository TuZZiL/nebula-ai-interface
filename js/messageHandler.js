// Store the accumulated text for each message
const streamBuffers = {};

// Check if a code block is complete (has matching opening and closing backticks)
function isCodeBlockComplete(text) {
    const codeBlockStarts = (text.match(/```[a-zA-Z0-9]*/g) || []).length;
    const codeBlockEnds = (text.match(/```\s*$/gm) || []).length; // Ensure end is at line end or followed by whitespace
    return codeBlockStarts === codeBlockEnds;
}

// Safely apply syntax highlighting to a code block
function safeHighlightElement(block) {
    try {
        if (window.Prism && block.textContent.trim()) {
            const langMatch = block.className.match(/language-(\w+)/);
            const lang = langMatch ? langMatch[1] : 'plaintext';

            if (Prism.languages[lang]) {
                Prism.highlightElement(block);
            } else {
                console.log(`Language grammar for ${lang} not loaded, using plaintext`);
                block.className = 'language-plaintext';
                Prism.highlightElement(block);
            }
        }
    } catch (e) {
        console.warn('Error highlighting code during streaming:', e);
    }
}


function addUserTextMessage(role, content) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) {
        console.error("messagesContainer not found in addUserTextMessage");
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = `relative bg-gray-100 dark:bg-sora-gray-medium rounded-lg p-4 max-w-[90%] w-fit fade-in ${role === 'user' ? 'ml-auto bg-primary-100 dark:bg-sora-gray-dark/50' : ''}`;

    const hasCodeBlock = content.includes('```');
    // Ensure processMarkdownWithLaTeX, highlightCodeBlocks, and initKaTeX are available globally or imported
    let displayContent = (typeof processMarkdownWithLaTeX === 'function') ? processMarkdownWithLaTeX(content) : content;

    const messageContent = `
        <div class="flex items-center justify-between space-x-3">
            <div class="flex items-start space-x-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-full ${role === 'user' ? 'bg-primary-600 dark:bg-sora-gray-medium' : 'bg-gray-600 dark:bg-sora-gray-dark'} flex items-center justify-center shrink-0">
                    <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'} text-white dark:text-white text-sm"></i>
                </div>
                <div class="flex-1 w-full overflow-hidden">
                    <p class="font-medium ${role === 'user' ? 'text-primary-700 dark:text-sora-gray-light' : 'text-gray-500 dark:text-sora-gray-light'}">${role === 'user' ? 'You' : 'Nebula AI'}</p>
                    <div class="text-gray-800 dark:text-white mt-1 message-stream prose prose-invert dark:prose-invert max-w-none w-full overflow-hidden">${displayContent}</div>
                </div>
            </div>
            <button class="p-1 rounded text-gray-400 hover:text-gray-600 dark:text-sora-gray-light dark:hover:text-white hover:bg-gray-200 dark:hover:bg-sora-gray-medium transition-colors copy-button shrink-0" data-raw-content="${escapeHtml(content)}">
                <i class="fas fa-copy text-xs"></i>
            </button>
        </div>
    `;

    messageDiv.innerHTML = messageContent;
    messagesContainer.appendChild(messageDiv);

    if (hasCodeBlock && typeof highlightCodeBlocks === 'function') {
        const msgStream = messageDiv.querySelector('.message-stream');
        if (msgStream) {
            highlightCodeBlocks(msgStream);
            msgStream.querySelectorAll('pre code').forEach(block => {
                const pre = block.parentElement;
                if (pre && pre.tagName === 'PRE' && !pre.previousSibling?.className?.includes('code-title')) {
                    const langMatch = block.className.match(/language-(\w+)/);
                    if (langMatch && langMatch[1]) {
                        const codeTitle = document.createElement('div');
                        codeTitle.className = 'code-title';
                        codeTitle.textContent = langMatch[1];
                        pre.parentNode.insertBefore(codeTitle, pre);
                    }
                }
            });
        }
    }

    if (typeof initKaTeX === 'function') {
        initKaTeX(messageDiv);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addLoadingIndicator(id, isFinalAnswer = false) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) {
        console.error("messagesContainer not found in addLoadingIndicator");
        return;
    }
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    const chunkClass = !isFinalAnswer ? 'message-chunk' : ''; // Used by thinking model logic
    loadingDiv.className = `relative bg-gray-100 dark:bg-sora-gray-medium rounded-lg p-4 max-w-[90%] w-fit fade-in ${chunkClass}`;

    const loadingContent = `
        <div class="flex items-center justify-between space-x-3">
            <div class="flex items-start space-x-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-full bg-gray-600 dark:bg-sora-gray-dark flex items-center justify-center shrink-0">
                    <i class="fas fa-robot text-white dark:text-white text-sm"></i>
                </div>
                <div class="flex-1 w-full overflow-hidden">
                    <p class="font-medium text-gray-500 dark:text-sora-gray-light">Nebula AI</p>
                    <p class="text-gray-800 dark:text-white mt-1 typing-indicator">Thinking</p>
                </div>
            </div>
            <button class="p-1 rounded text-gray-400 hover:text-gray-600 dark:text-sora-gray-light dark:hover:text-white hover:bg-gray-200 dark:hover:bg-sora-gray-medium transition-colors copy-button shrink-0" data-raw-content="">
                <i class="fas fa-copy text-xs"></i>
            </button>
        </div>
    `;
    loadingDiv.innerHTML = loadingContent;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateStreamingContent(id, chunk) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const loadingDiv = document.getElementById(id);
    if (loadingDiv) {
        const messageContentEl = loadingDiv.querySelector('.message-stream') || loadingDiv.querySelector('.typing-indicator');

        if (!streamBuffers[id]) {
            streamBuffers[id] = '';
        }

        if (messageContentEl && messageContentEl.classList.contains('typing-indicator')) {
            messageContentEl.classList.replace('typing-indicator', 'message-stream');
            messageContentEl.textContent = '';
            messageContentEl.classList.remove('text-gray-800');
            messageContentEl.classList.add('dark:text-white');
        }

        streamBuffers[id] += chunk;

        if (messageContentEl && typeof processMarkdownWithLaTeX === 'function') {
            try {
                messageContentEl.innerHTML = processMarkdownWithLaTeX(streamBuffers[id]);
                if (isCodeBlockComplete(streamBuffers[id]) && typeof highlightCodeBlocks === 'function') {
                    highlightCodeBlocks(messageContentEl);
                    messageContentEl.querySelectorAll('pre code').forEach(block => {
                        const pre = block.parentElement;
                        if (pre && !pre.querySelector('.code-copy-btn')) {
                            pre.style.position = 'relative';
                            const copyBtn = document.createElement('button');
                            copyBtn.className = 'code-copy-btn';
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                            copyBtn.title = 'Copy code';
                            copyBtn.dataset.codeToCopy = block.textContent;
                            copyBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(copyBtn.dataset.codeToCopy).then(() => {
                                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                                    if(typeof showAlert === 'function') showAlert('Code copied!', 'success');
                                    setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
                                }).catch(err => {
                                    if(typeof showAlert === 'function') showAlert('Failed to copy.', 'error');
                                });
                            });
                            pre.appendChild(copyBtn);
                        }
                        if (pre && pre.tagName === 'PRE' && !pre.previousSibling?.className?.includes('code-title')) {
                            const langMatch = block.className.match(/language-(\w+)/);
                            if (langMatch && langMatch[1]) {
                                const codeTitle = document.createElement('div');
                                codeTitle.className = 'code-title';
                                codeTitle.textContent = langMatch[1];
                                pre.parentNode.insertBefore(codeTitle, pre);
                            }
                        }
                    });
                }
                if (typeof initKaTeX === 'function') initKaTeX(messageContentEl);
            } catch (e) {
                console.error('Error updating streaming content:', e);
                messageContentEl.textContent += chunk; // Fallback
            }
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function completeLoadingIndicator(id, content) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const loadingDiv = document.getElementById(id);
    if (loadingDiv) {
        const msgStream = loadingDiv.querySelector('.message-stream') || loadingDiv.querySelector('.typing-indicator');
        const copyBtn = loadingDiv.querySelector('.copy-button');

        const existingChunks = document.querySelectorAll('.message-chunk');
        existingChunks.forEach(chunk => {
            if (chunk.id !== id) chunk.remove();
        });

        let finalContentToRender = content;
        if (streamBuffers[id] && streamBuffers[id] !== content) {
            // If buffer exists and is different, prefer the complete content argument
            // This handles cases where the stream might have ended abruptly or the final content is definitive
            finalContentToRender = content;
        } else if (streamBuffers[id]) {
            // If buffer exists and matches, or if content is empty (stream ended cleanly), use buffer
            finalContentToRender = streamBuffers[id] || content;
        }


        if (msgStream && typeof processMarkdownWithLaTeX === 'function') {
            if (msgStream.classList.contains('typing-indicator')) {
                msgStream.classList.replace('typing-indicator', 'message-stream');
            }
            msgStream.innerHTML = processMarkdownWithLaTeX(finalContentToRender);
            msgStream.classList.remove('text-gray-800');
            msgStream.classList.add('dark:text-white');

            if (typeof highlightCodeBlocks === 'function') highlightCodeBlocks(msgStream);
            msgStream.querySelectorAll('pre code').forEach(block => {
                const pre = block.parentElement;
                 if (pre && pre.tagName === 'PRE' && !pre.previousSibling?.className?.includes('code-title')) {
                    const langMatch = block.className.match(/language-(\w+)/);
                    if (langMatch && langMatch[1]) {
                        const codeTitle = document.createElement('div');
                        codeTitle.className = 'code-title';
                        codeTitle.textContent = langMatch[1];
                        pre.parentNode.insertBefore(codeTitle, pre);
                    }
                }
                if (pre && !pre.querySelector('.code-copy-btn')) {
                    pre.style.position = 'relative';
                    const localCopyBtn = document.createElement('button');
                    localCopyBtn.className = 'code-copy-btn';
                    localCopyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    localCopyBtn.title = 'Copy code';
                    localCopyBtn.dataset.codeToCopy = block.textContent;
                    localCopyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(localCopyBtn.dataset.codeToCopy).then(() => {
                            localCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            if(typeof showAlert === 'function') showAlert('Code copied!', 'success');
                            setTimeout(() => { localCopyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1500);
                        }).catch(err => {
                             if(typeof showAlert === 'function') showAlert('Failed to copy.', 'error');
                        });
                    });
                    pre.appendChild(localCopyBtn);
                }
            });
        }

        if (copyBtn && typeof escapeHtml === 'function') {
            copyBtn.dataset.rawContent = finalContentToRender; // Use final rendered content for copy
        }
        if (typeof initKaTeX === 'function') initKaTeX(loadingDiv);
        delete streamBuffers[id]; // Clean up buffer
    }
}

function clearMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
}