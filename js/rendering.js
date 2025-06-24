// KaTeX rendering options
const katexOptions = {
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
    ],
    throwOnError: false, // Don't stop rendering on error
    trust: true, // Allow all commands
    strict: false // Don't be strict about parsing errors
};

// Function to explicitly initialize KaTeX rendering
function initKaTeX(element) {
    if (typeof renderMathInElement === 'function') {
        try {
            console.log('Initializing KaTeX for element:', element);
            renderMathInElement(element, katexOptions);
            console.log('KaTeX initialization complete');
        } catch (e) {
            console.warn('KaTeX initialization error:', e);
        }
    } else {
        console.warn('KaTeX renderMathInElement function not available');
    }
}

// Configure marked.js to use Prism for syntax highlighting and preserve LaTeX
marked.setOptions({
    highlight: function(code, lang) {
        try {
            // Skip PHP highlighting as it causes errors
            if (lang === 'php') {
                console.log('Skipping PHP highlighting in marked.js due to known issues');
                return code;
            }

            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            } else {
                // If language is not supported, use plaintext
                console.log(`Language grammar for ${lang} not loaded in marked.js, using plaintext`);
                if (Prism.languages.plaintext) {
                    return Prism.highlight(code, Prism.languages.plaintext, 'plaintext');
                } else {
                    return code;
                }
            }
        } catch (e) {
            console.warn('Error highlighting code in marked.js:', e);
            return code;
        }
    },
    breaks: true,
    gfm: true
});

// Function to apply syntax highlighting to all code blocks in an element
function highlightCodeBlocks(element) {
    if (!element) return;

    // Find all code blocks
    const codeBlocks = element.querySelectorAll('pre code');

    // Apply syntax highlighting to each block
    codeBlocks.forEach(block => {
        // Skip if already highlighted
        if (block.classList.contains('hljs') || block.dataset.highlighted === 'true') return;

        try {
            // Try to detect language if not specified
            if (!block.className.includes('language-')) {
                const codeContent = block.textContent;
                let detectedLang = 'plaintext';

                if (codeContent.includes('function') || codeContent.includes('const ') ||
                    codeContent.includes('let ') || codeContent.includes('var ')) {
                    detectedLang = 'javascript';
                } else if (codeContent.includes('def ') || codeContent.includes('import ') ||
                           (codeContent.includes('class ') && codeContent.includes(':'))) { // Corrected class detection
                    detectedLang = 'python';
                } else if (codeContent.includes('<html') || codeContent.includes('<div') ||
                           codeContent.includes('</')) {
                    detectedLang = 'html';
                }

                // Add the language class
                block.className = `language-${detectedLang}`;
            }

            // Apply Prism.js highlighting
            if (window.Prism) {
                try {
                    // Check if the language is supported
                    const langClass = block.className.match(/language-(\w+)/);
                    if (langClass && langClass[1]) {
                        const lang = langClass[1];
                        // Skip PHP highlighting as it causes errors
                        if (lang === 'php') {
                            console.log('Skipping PHP highlighting due to known issues');
                            return;
                        }

                        // Only highlight if the language grammar is loaded
                        if (Prism.languages[lang]) {
                            Prism.highlightElement(block);
                        } else {
                            console.log(`Language grammar for ${lang} not loaded, using plaintext`);
                            block.className = 'language-plaintext';
                            Prism.highlightElement(block);
                        }
                    } else {
                        // No language specified, use plaintext
                        block.className = 'language-plaintext';
                        Prism.highlightElement(block);
                    }
                } catch (e) {
                    console.warn('Error highlighting code block:', e);
                }
            }

            // Mark as highlighted
            block.dataset.highlighted = 'true';
        } catch (e) {
            console.warn('Error highlighting code block:', e);
        }
    });
}

// Function to render a message with proper formatting
// This function assumes 'processMarkdownWithLaTeX' and 'initKaTeX' are available (e.g. from utils.js or this file)
// and 'highlightCodeBlocks' is also available.
function renderMessage(message, container) {
    // Process the message content with our custom processor
    const processedContent = processMarkdownWithLaTeX(message.content); // Ensure processMarkdownWithLaTeX is defined

    // Set the HTML content
    container.innerHTML = processedContent;

    // Apply syntax highlighting to code blocks
    highlightCodeBlocks(container);

    // Render LaTeX after the content is added to the DOM
    initKaTeX(container); // Ensure initKaTeX is defined
}