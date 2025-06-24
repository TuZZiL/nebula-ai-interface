// API Call Function for text generation
function callAPI(requestData, loadingId) {
    let token = apiToken.value.trim() || DEFAULT_API_KEY; // Ensure apiToken and DEFAULT_API_KEY are accessible

    const thinkingModels = ["deepseek-ai/DeepSeek-R1", "Qwen/Qwen3-235B-A22B", "deepseek-ai/DeepSeek-R1-0528"];
    const isThinkingModel = thinkingModels.includes(requestData.model);
    console.log(`callAPI: isThinkingModel = ${isThinkingModel} for model ${requestData.model}`);

    // Scope variables for thinking model state to this callAPI invocation
    let isInsideThinkTag = false;
    let thinkingStartTime = null;
    let accumulatedThinkContent = "";
    let finalAnswerContent = "";
    let answerId = null; // This will be the ID for the final answer bubble
    let bufferForTagDetection = "";
    let thinkingSpoilerCreated = false;


    if (isThinkingModel) {
        console.log("Creating initial thinking spoiler for thinking model");
        // Ensure addOrUpdateThinkingSpoilerUI is accessible
        if (typeof addOrUpdateThinkingSpoilerUI === 'function') {
            addOrUpdateThinkingSpoilerUI(loadingId, "Waiting for model to start thinking...", null);
        } else {
            console.error("addOrUpdateThinkingSpoilerUI function not found in callAPI");
        }
    }

    if (!token || token === "YOUR_DEFAULT_API_KEY_HERE") {
        if (typeof showAlert === 'function') showAlert('API token missing.', 'error');
        // Ensure completeLoadingIndicator is accessible
        if (typeof completeLoadingIndicator === 'function') {
            completeLoadingIndicator(loadingId, "Error: API token is required.");
        }
        return;
    }

    fetch("https://llm.chutes.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            if (!requestData.stream) {
                return response.text().then(text => {
                    throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
                });
            } else {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        }
        if (requestData.stream) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialLine = '';
            let fullResponse = ""; // For non-thinking models

            function readStream() {
                reader.read().then(({done, value}) => {
                    if (done) {
                        if (isThinkingModel && answerId) {
                            if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(answerId, finalAnswerContent);
                            document.querySelectorAll('.message-chunk').forEach(chunk => chunk.remove());
                        } else if (!isThinkingModel) {
                            if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(loadingId, fullResponse);
                        }
                        return;
                    }

                    const chunk = decoder.decode(value, {stream: true});
                    const lines = (partialLine + chunk).split('\n');
                    partialLine = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim() || line === 'data: [DONE]') {
                            if (line === 'data: [DONE]') {
                                if (isThinkingModel && answerId) {
                                     if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(answerId, finalAnswerContent);
                                     document.querySelectorAll('.message-chunk').forEach(chunk => chunk.remove());
                                } else if (!isThinkingModel) {
                                     if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(loadingId, fullResponse);
                                }
                            }
                            continue;
                        }

                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = line.substring(6);
                                const data = JSON.parse(jsonData);

                                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                    const chunkContent = data.choices[0].delta.content;
                                    bufferForTagDetection = (bufferForTagDetection.slice(-20) + chunkContent);

                                    if (isThinkingModel) {
                                        if (!isInsideThinkTag && bufferForTagDetection.includes('<think>')) {
                                            isInsideThinkTag = true;
                                            thinkingStartTime = Date.now();
                                            const thinkTagIndex = bufferForTagDetection.indexOf('<think>');
                                            const tagInCurrentChunk = chunkContent.includes('<think>');
                                            let contentAfterTag = tagInCurrentChunk ? chunkContent.substring(chunkContent.indexOf('<think>') + 7) : chunkContent;
                                            accumulatedThinkContent += contentAfterTag;

                                            if (!thinkingSpoilerCreated) {
                                                if (typeof addOrUpdateThinkingSpoilerUI === 'function') addOrUpdateThinkingSpoilerUI(loadingId, accumulatedThinkContent, null);
                                                thinkingSpoilerCreated = true;
                                                const loadingElement = document.getElementById(loadingId);
                                                if (loadingElement) loadingElement.style.display = 'none';
                                            }
                                        } else if (isInsideThinkTag && bufferForTagDetection.includes('</think>')) {
                                            const tagInCurrentChunk = chunkContent.includes('</think>');
                                            let contentBeforeEndTag = tagInCurrentChunk ? chunkContent.substring(0, chunkContent.indexOf('</think>')) : chunkContent;
                                            accumulatedThinkContent += contentBeforeEndTag;
                                            
                                            const thinkingEndTime = Date.now();
                                            const thinkingDuration = (thinkingEndTime - thinkingStartTime) / 1000.0;

                                            if (thinkingSpoilerCreated && typeof addOrUpdateThinkingSpoilerUI === 'function') {
                                                addOrUpdateThinkingSpoilerUI(loadingId, accumulatedThinkContent, thinkingDuration);
                                            } else if (typeof addOrUpdateThinkingSpoilerUI === 'function') {
                                                addOrUpdateThinkingSpoilerUI(loadingId, accumulatedThinkContent, thinkingDuration);
                                                thinkingSpoilerCreated = true;
                                                const loadingElement = document.getElementById(loadingId);
                                                if (loadingElement) loadingElement.style.display = 'none';
                                            }
                                            
                                            isInsideThinkTag = false;
                                            let contentAfterEndTag = tagInCurrentChunk ? chunkContent.substring(chunkContent.indexOf('</think>') + 9) : "";
                                            finalAnswerContent += contentAfterEndTag;

                                            if (contentAfterEndTag.trim()) {
                                                answerId = "answer-" + Date.now();
                                                if (typeof addLoadingIndicator === 'function') addLoadingIndicator(answerId, true);
                                                if (typeof updateStreamingContent === 'function') updateStreamingContent(answerId, contentAfterEndTag);
                                            }
                                        } else if (isInsideThinkTag) {
                                            accumulatedThinkContent += chunkContent;
                                            if (thinkingSpoilerCreated && typeof addOrUpdateThinkingSpoilerUI === 'function') {
                                                addOrUpdateThinkingSpoilerUI(loadingId, accumulatedThinkContent, null);
                                            } else if (typeof addOrUpdateThinkingSpoilerUI === 'function') {
                                                addOrUpdateThinkingSpoilerUI(loadingId, accumulatedThinkContent, null);
                                                thinkingSpoilerCreated = true;
                                                const loadingElement = document.getElementById(loadingId);
                                                if (loadingElement) loadingElement.style.display = 'none';
                                            }
                                        } else { // Not inside think tag, and no start/end tag detected in this chunk
                                            if (!answerId) { // Create answer bubble if not already done
                                                answerId = "answer-" + Date.now();
                                                if (typeof addLoadingIndicator === 'function') addLoadingIndicator(answerId, true);
                                            }
                                            finalAnswerContent += chunkContent;
                                            if (typeof updateStreamingContent === 'function') updateStreamingContent(answerId, chunkContent);
                                            document.querySelectorAll('.message-chunk').forEach(elChunk => {
                                                if (elChunk.id !== answerId) elChunk.remove();
                                            });
                                        }
                                    } else { // Not a thinking model
                                        fullResponse += chunkContent;
                                        if (typeof updateStreamingContent === 'function') updateStreamingContent(loadingId, chunkContent);
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing stream chunk:', line, e);
                                if (isThinkingModel && answerId && typeof updateStreamingContent === 'function') {
                                    updateStreamingContent(answerId, "\n\n[Error parsing stream data]");
                                } else if (typeof updateStreamingContent === 'function') {
                                    updateStreamingContent(loadingId, "\n\n[Error parsing stream data]");
                                }
                            }
                        }
                    }
                    readStream();
                }).catch(streamError => {
                    console.error('Stream reading error:', streamError);
                    const errorMsg = `\n\n[Stream reading error: ${streamError.message}]`;
                    if (isThinkingModel && answerId && typeof completeLoadingIndicator === 'function') {
                        completeLoadingIndicator(answerId, finalAnswerContent + errorMsg);
                        document.querySelectorAll('.message-chunk').forEach(chunk => chunk.remove());
                    } else if (typeof completeLoadingIndicator === 'function') {
                        completeLoadingIndicator(loadingId, fullResponse + errorMsg);
                    }
                    if (typeof showAlert === 'function') showAlert(`Stream Error: ${streamError.message}`, 'error');
                });
            }
            readStream(); // Start reading
        } else { // Non-streaming
            return response.json();
        }
    })
    .then(data => {
        if (!requestData.stream && data) {
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                 if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(loadingId, data.choices[0].message.content);
            } else {
                 console.error("Unexpected non-stream response format:", data);
                 if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(loadingId, "[Received unexpected data format]");
                 if (typeof showAlert === 'function') showAlert("Received unexpected API response format", 'error');
            }
        }
    })
    .catch(error => {
        console.error('API Call Error:', error);
        if (typeof completeLoadingIndicator === 'function') completeLoadingIndicator(loadingId, `Error: ${error.message}`);
        if (typeof showAlert === 'function') showAlert(`API Error: ${error.message}`, 'error');
    });
}

function testConnection() {
    let token = apiToken.value.trim() || DEFAULT_API_KEY; // Ensure apiToken and DEFAULT_API_KEY are accessible
    if (!token || token === "YOUR_DEFAULT_API_KEY_HERE") {
        if (typeof showAlert === 'function') showAlert('API token missing.', 'error');
        return;
    }

    testConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Testing...';
    testConnectionBtn.disabled = true;

    fetch("https://llm.chutes.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelSelect.value, // Ensure modelSelect is accessible
            messages: [{ role: "user", content: "Test connection." }],
            stream: false,
            max_tokens: 5,
            temperature: 0.1
        })
    })
    .then(response => {
        if (response.ok) {
            if (typeof showAlert === 'function') showAlert('Connection successful!', 'success');
            testConnectionBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Success';
        } else {
            if (typeof showAlert === 'function') showAlert(`Connection failed: ${response.status} ${response.statusText}`, 'error');
            testConnectionBtn.innerHTML = '<i class="fas fa-times mr-2"></i> Failed';
        }
        return response.json();
    })
    .catch(error => {
        console.error('Test Connection Error:', error);
        if (typeof showAlert === 'function') showAlert(`Connection error: ${error.message}`, 'error');
        testConnectionBtn.innerHTML = '<i class="fas fa-times mr-2"></i> Error';
    })
    .finally(() => {
        setTimeout(() => {
            testConnectionBtn.innerHTML = '<i class="fas fa-plug mr-2"></i> Test Connection';
            testConnectionBtn.disabled = false;
        }, 2000);
    });
}