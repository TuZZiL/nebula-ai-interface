// Function to create or update the thinking spoiler UI
function addOrUpdateThinkingSpoilerUI(spoilerLoadingId, thinkContent, durationInSeconds) {
    const messagesContainer = document.getElementById('messagesContainer'); // Ensure messagesContainer is accessible
    if (!messagesContainer) {
        console.error("messagesContainer not found in addOrUpdateThinkingSpoilerUI");
        return;
    }
    // Find or create the spoiler div
    let spoilerDiv = document.getElementById(`thinking-spoiler-${spoilerLoadingId}`);
    const loadingElement = document.getElementById(spoilerLoadingId); // The initial loading bubble

    if (!spoilerDiv) {
        // Create new spoiler div if it doesn't exist
        spoilerDiv = document.createElement('div');
        spoilerDiv.id = `thinking-spoiler-${spoilerLoadingId}`;
        spoilerDiv.className = 'thinking-spoiler-bubble fade-in';

        const spoilerHeader = document.createElement('div');
        spoilerHeader.className = 'spoiler-header';

        const headerLeft = document.createElement('div');
        headerLeft.className = 'spoiler-header-left';

        const brainIcon = document.createElement('i');
        brainIcon.className = 'fas fa-brain icon';
        headerLeft.appendChild(brainIcon);

        const headerText = document.createElement('span');
        headerText.className = 'spoiler-header-text';
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        headerText.textContent = durationInSeconds
            ? `Thought for ${durationInSeconds.toFixed(1)}s (${timeString})`
            : `Thinking... (${timeString})`;
        headerLeft.appendChild(headerText);
        spoilerHeader.appendChild(headerLeft);

        const chevronIcon = document.createElement('i');
        chevronIcon.className = 'fas fa-chevron-down chevron-icon';
        spoilerHeader.appendChild(chevronIcon);

        const spoilerContent = document.createElement('div');
        spoilerContent.className = 'spoiler-content prose prose-invert dark:prose-invert max-w-none';
        spoilerContent.innerHTML = `<div id="thinking-content-${spoilerLoadingId}"></div>`;

        spoilerHeader.addEventListener('click', () => {
            spoilerDiv.classList.toggle('expanded');
            chevronIcon.style.transform = spoilerDiv.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0)';
        });

        spoilerDiv.appendChild(spoilerHeader);
        spoilerDiv.appendChild(spoilerContent);

        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.insertBefore(spoilerDiv, loadingElement);
        } else {
            messagesContainer.appendChild(spoilerDiv);
        }

        if (loadingElement) {
            loadingElement.style.display = 'none'; // Hide the original loading bubble
        }
    }

    const contentElement = document.getElementById(`thinking-content-${spoilerLoadingId}`);
    if (contentElement) {
        // Ensure processMarkdownWithLaTeX, highlightCodeBlocks, and initKaTeX are available
        // These might be in rendering.js or utils.js
        contentElement.innerHTML = processMarkdownWithLaTeX(thinkContent);
        highlightCodeBlocks(contentElement);
        initKaTeX(contentElement);
    }

    if (durationInSeconds !== null) {
        const headerText = spoilerDiv.querySelector('.spoiler-header-text');
        if (headerText) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            headerText.textContent = `Thought for ${durationInSeconds.toFixed(1)}s (${timeString})`;
        }
    }
    
    if (loadingElement && loadingElement.style.display !== 'none' && spoilerDiv) {
        // If spoiler is created and loading element is still somehow visible, hide it.
        loadingElement.style.display = 'none';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}