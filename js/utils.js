// Utility to escape HTML for data attribute
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    // Add base classes including transitions
    alertDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white opacity-0 transition-opacity duration-300 ease-in-out ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    // Force reflow to ensure initial state (opacity-0) is applied before transition starts
    void alertDiv.offsetWidth;

    // Fade in
    alertDiv.classList.remove('opacity-0');
    alertDiv.classList.add('opacity-100');

    // Set timeout to fade out
    setTimeout(() => {
        alertDiv.classList.remove('opacity-100');
        alertDiv.classList.add('opacity-0');
        // Remove element after transition completes
        setTimeout(() => {
            alertDiv.remove();
        }, 300); // Match transition duration
    }, 3000);
}

// Function to process markdown with LaTeX preservation
function processMarkdownWithLaTeX(text) {
    // Create a map to store LaTeX expressions and their placeholders
    const latexMap = new Map();
    let placeholderIndex = 0;

    // Function to create a unique placeholder
    const createPlaceholder = () => `LATEX_PLACEHOLDER_${placeholderIndex++}`;

    // Replace LaTeX expressions with placeholders
    let processedText = text
        // Handle display math with $$
        .replace(/\$\$([\s\S]*?)\$\$/g, function(match) {
            const placeholder = createPlaceholder();
            latexMap.set(placeholder, match);
            return placeholder;
        })
        // Handle inline math with single $
        .replace(/\$([^\$\n]+?)\$/g, function(match) {
            const placeholder = createPlaceholder();
            latexMap.set(placeholder, match);
            return placeholder;
        })
        // Handle display math with \[ \]
        .replace(/\\\[([\s\S]*?)\\\]/g, function(match) {
            const placeholder = createPlaceholder();
            latexMap.set(placeholder, match);
            return placeholder;
        })
        // Handle inline math with \( \)
        .replace(/\\\(([\s\S]*?)\\\)/g, function(match) {
            const placeholder = createPlaceholder();
            latexMap.set(placeholder, match);
            return placeholder;
        });

    // Process the text with markdown parser
    let result = marked.parse(processedText); // Ensure 'marked' is available globally or imported

    // Replace placeholders with original LaTeX expressions
    latexMap.forEach((latex, placeholder) => {
        result = result.replace(placeholder, latex);
    });

    return result;
}