// --- Image Generation & Mode Toggle Functions ---
function toggleImageMode() {
    isImageModeActive = !isImageModeActive; // Toggle state

    const baseClasses = ['text-xs', 'px-3', 'py-1', 'rounded-full', 'transition-colors'];
    const defaultClasses = ['bg-gray-200', 'hover:bg-gray-300', 'text-gray-600', 'dark:bg-sora-gray-medium', 'dark:hover:bg-sora-gray-light', 'dark:text-white'];
    const activeClasses = ['bg-primary-600', 'hover:bg-primary-500', 'text-white', 'dark:bg-white', 'dark:text-black'];

    if (isImageModeActive) {
        createImageBtn.className = [...baseClasses, ...activeClasses].join(' ');
        userInput.placeholder = "Type image prompt...";
        imageSettings.classList.remove('hidden');
        imageSettings.classList.add('flex');
    } else {
        createImageBtn.className = [...baseClasses, ...defaultClasses].join(' ');
        userInput.placeholder = "Type your message here...";
        imageSettings.classList.remove('flex');
        imageSettings.classList.add('hidden');
    }
}

function addImageLoadingIndicator(id1, id2, prompt) {
    const messagesContainer = document.getElementById('messagesContainer'); // Ensure messagesContainer is accessible
    if (!messagesContainer) {
        console.error("messagesContainer not found in addImageLoadingIndicator");
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.id = `msg-${id1}`; // Use a unique ID for the main message bubble
    messageDiv.className = 'relative bg-gray-100 dark:bg-sora-gray-medium rounded-lg p-4 max-w-[90%] w-fit fade-in';
    messageDiv.dataset.imagePrompt = prompt;

    const loadingContent = `
        <div class="flex flex-col">
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-600 flex items-center justify-center shrink-0">
                    <i class="fas fa-images text-white dark:text-white text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-gray-700 dark:text-white">Image Generation (2)</p>
                    <div class="flex space-x-2 mt-2">
                        <div id="${id1}" class="flex-1 p-2 border dark:border-sora-gray-dark rounded-md bg-gray-200 dark:bg-sora-gray-dark flex items-center justify-center text-xs text-gray-500 dark:text-sora-gray-light min-h-[60px]">
                            <div class="flex flex-col items-center">
                                <i class="fas fa-spinner fa-spin mb-1"></i>
                                <span>Generating image 1...</span>
                            </div>
                        </div>
                        <div id="${id2}" class="flex-1 p-2 border dark:border-sora-gray-dark rounded-md bg-gray-200 dark:bg-sora-gray-dark flex items-center justify-center text-xs text-gray-500 dark:text-sora-gray-light min-h-[60px]">
                            <div class="flex flex-col items-center">
                                <i class="fas fa-spinner fa-spin mb-1"></i>
                                <span>Generating image 2...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-3 flex justify-center w-full">
                <button class="regenerate-images-btn text-sm bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-sora-gray-dark dark:hover:bg-sora-gray-medium dark:text-white px-3 py-1.5 rounded-full transition-colors w-auto">
                    <i class="fas fa-redo-alt mr-1"></i> Generate New Variants
                </button>
            </div>
        </div>
    `;
    messageDiv.innerHTML = loadingContent;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateImageLoadingIndicator(placeholderId, result) {
    const placeholderDiv = document.getElementById(placeholderId);
    if (!placeholderDiv) {
         console.error(`Placeholder div with ID ${placeholderId} not found.`);
         return;
    }

    placeholderDiv.innerHTML = '';
    placeholderDiv.classList.remove('p-2', 'border', 'dark:border-sora-gray-dark', 'bg-gray-200', 'dark:bg-sora-gray-dark', 'flex', 'items-center', 'justify-center', 'text-xs', 'text-gray-500', 'dark:text-sora-gray-light', 'min-h-[50px]');
    placeholderDiv.classList.add('flex-1');

    if (result.status === 'rejected') {
         const errorReason = result.reason || new Error("Unknown promise rejection");
         const errorMessage = typeof errorReason.message === 'string' ? errorReason.message : 'Failed to generate image.';
         placeholderDiv.innerHTML = `<span class="text-red-500 text-xs p-1">Error: ${escapeHtml(errorMessage)}</span>`;
    } else {
         const innerResult = result.value;
         if (innerResult.status === 'rejected') {
             const errorReason = innerResult.reason || new Error("Unknown API error");
             const errorMessage = typeof errorReason.message === 'string' ? errorReason.message : 'Failed to generate image.';
             placeholderDiv.innerHTML = `<span class="text-red-500 text-xs p-1">Error: ${escapeHtml(errorMessage)}</span>`;
         } else if (innerResult.status === 'fulfilled' && innerResult.value) {
             const imageUrl = innerResult.value;
             placeholderDiv.innerHTML = `
                 <img src="${imageUrl}" alt="Generated Image" class="block max-w-full w-full h-auto rounded-lg border dark:border-sora-gray-medium cursor-pointer chat-image-thumbnail object-contain">
             `;
             console.log(`Successfully loaded image for ${placeholderId}`);
         } else {
              placeholderDiv.innerHTML = `<span class="text-red-500 text-xs p-1">Error: Invalid result format.</span>`;
         }
    }

    const messagesContainer = document.getElementById('messagesContainer'); // Ensure messagesContainer is accessible
    if (messagesContainer) {
        const messageDiv = document.getElementById(`msg-${placeholderId.split('-')[2]}`); // Assuming ID format like image-loading-1-timestamp
        if (messageDiv) {
            const regenerateBtn = messageDiv.querySelector('.regenerate-images-btn');
            if (regenerateBtn) {
                regenerateBtn.style.animation = 'none';
                setTimeout(() => {
                    regenerateBtn.style.animation = 'fadeIn 0.5s ease-in-out';
                }, 10);
            }
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

async function callImageAPI(prompt, token, loadingId) {
    try {
        const resolution = imageResolution.value;
        const shift = parseFloat(imageShift.value);

        const response = await fetch("http://localhost:3000/generate-image", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "seed": null,
                "shift": shift,
                "prompt": prompt,
                "resolution": resolution,
                "guidance_scale": 5,
                "num_inference_steps": 50
            })
        });

        if (!response.ok) {
            let errorText = response.statusText;
            try {
                const errorData = await response.json();
                errorText = errorData.detail || errorData.message || JSON.stringify(errorData);
            } catch (e) { /* Ignore */ }
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const imageBlob = await response.blob();
        if (!imageBlob.type.startsWith('image/')) {
            throw new Error(`Received non-image content type: ${imageBlob.type}`);
        }
        const imageObjectURL = URL.createObjectURL(imageBlob);
        return { status: 'fulfilled', value: imageObjectURL };
    } catch (error) {
        console.error(`Image Generation API Call Error for ${loadingId}:`, error);
        showAlert(`Image Generation Error: ${error.message}`, 'error');
        return { status: 'rejected', reason: error };
    }
}

function regenerateImages(messageDiv) {
    const prompt = messageDiv.dataset.imagePrompt;
    if (!prompt) {
        console.error("No prompt found in data attribute:", messageDiv);
        showAlert('Error: Could not find original prompt for regeneration', 'error');
        return;
    }
    showAlert(`Generating new variants with the same prompt...`, 'success');
    let token = apiToken.value.trim() || DEFAULT_API_KEY;

    if (!token || token === "YOUR_DEFAULT_API_KEY_HERE") { // Ensure DEFAULT_API_KEY is defined
        showAlert('API token missing. Please enter one or configure the default.', 'error');
        return;
    }

    const timestamp = Date.now();
    const loadingId1 = `image-loading-1-${timestamp}`;
    const loadingId2 = `image-loading-2-${timestamp}`;

    addImageLoadingIndicator(loadingId1, loadingId2, prompt);

    Promise.allSettled([
        callImageAPI(prompt, token, loadingId1),
        callImageAPI(prompt, token, loadingId2)
    ]).then(results => {
        updateImageLoadingIndicator(loadingId1, results[0]);
        updateImageLoadingIndicator(loadingId2, results[1]);
    });
}

// --- Image Preview Modal Functions ---
function toggleImagePreviewModal(show) {
    const modal = document.getElementById('imagePreviewModal');
    if (!modal) return;

    if (show) {
        modal.classList.remove('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
        modal.classList.add('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeModalOnEsc);
    } else {
        modal.classList.remove('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'scale-95', 'invisible', 'pointer-events-none');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', closeModalOnEsc);

        const imgElement = document.getElementById('fullSizeImagePreview');
        const loadingIndicator = document.getElementById('imageLoadingIndicator');
        if (imgElement) {
            setTimeout(() => {
                imgElement.setAttribute('src', '');
                imgElement.classList.remove('opacity-0');
                const errorMessages = document.querySelectorAll('#imagePreviewModal .text-red-500');
                errorMessages.forEach(el => el.remove());
            }, 300);
        }
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

function closeModalOnEsc(e) {
    if (e.key === 'Escape') {
        toggleImagePreviewModal(false);
    }
}
// --- End Image Generation & Mode Toggle Functions ---