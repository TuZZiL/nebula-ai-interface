// --- Configuration ---
// Default API key - should be set by user in the interface
// For development, you can set this in .env file as DEFAULT_API_KEY
const DEFAULT_API_KEY = "YOUR_DEFAULT_API_KEY_HERE";
// --- End Configuration ---

// --- Model Specific Configurations ---
const modelConfigurations = {
    'deepseek-ai/deepseek-r1-0528': { // Corrected to lowercase to match select option value
        maxTokens: 161840
    },
    // Add other model-specific settings here in the future
    'default': {
        maxTokens: 4096 // A sensible default for other models
    }
};