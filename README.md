# Nebula AI Interface

A modern, dark-themed web interface for interacting with Large Language Models (LLMs) and AI image generation services.

## ✨ Features

- **🌙 Dark Theme**: Beautiful dark interface with smooth animations
- **💬 Chat Interface**: Real-time streaming responses from LLMs
- **🖼️ Image Generation**: Generate images using AI models
- **📚 Prompt Library**: Save and manage your favorite prompts
- **🔧 System Prompts**: Built-in and customizable system prompts
- **⚙️ Flexible Settings**: Adjustable temperature, max tokens, and model selection
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Live Demo

Visit the live application: [Your Render URL will be here]

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Markdown**: Marked.js
- **Math Rendering**: KaTeX
- **Code Highlighting**: Prism.js
- **Backend**: Node.js, Express.js
- **Image Proxy**: Custom Express server for CORS handling

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nebula-ai-interface.git
   cd nebula-ai-interface
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   # DEFAULT_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Production Build

1. **Start the proxy server**
   ```bash
   npm run start-proxy
   ```

2. **Serve the frontend**
   Use any static file server to serve the HTML files.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# API Configuration
DEFAULT_API_KEY=your_api_key_here
IMAGE_API_URL=https://chutes-hidream.chutes.ai/generate
PORT=3000
NODE_ENV=production
```

### API Setup
1. Get your API key from your LLM provider
2. Add it to your `.env` file or enter it in the settings panel
3. Select your preferred model

### Security Notes
- Never commit your `.env` file to version control
- API keys are stored locally in your browser
- Use environment variables for production deployment

### System Prompts
- Choose from built-in prompts
- Create custom prompts
- Save prompts to your library

## 📁 Project Structure

```
nebula-ai-interface/
├── index.html              # Main application file
├── package.json            # Node.js dependencies
├── image-proxy-server.js   # Express server for image proxy
├── css/
│   └── main.css           # Custom styles
├── js/
│   ├── main.js            # Main application logic
│   ├── api.js             # API communication
│   ├── config.js          # Configuration
│   ├── settings.js        # Settings management
│   ├── messageHandler.js  # Message handling
│   ├── imageHandler.js    # Image generation
│   ├── rendering.js       # Content rendering
│   ├── uiElements.js      # UI element references
│   ├── uiInteractions.js  # UI interactions
│   ├── utils.js           # Utility functions
│   ├── thinkingUI.js      # Thinking animation
│   ├── systemPrompt_nsfwbase.js  # Built-in prompts
│   └── systemPromptManager.js    # Prompt management
└── README.md              # This file
```

## 🎯 Usage

### Basic Chat
1. Enter your message in the input field
2. Press Enter or click Send
3. Watch the AI respond in real-time

### Image Generation
1. Click the "Create Image" button
2. Enter your image prompt
3. Wait for the AI to generate images

### Prompt Management
1. Open Settings → System Prompt
2. Choose from built-in prompts or create custom ones
3. Save frequently used prompts to your library

## 🔒 Privacy & Security

- API keys are stored locally in your browser
- No data is sent to third-party servers except your chosen AI provider
- All conversations are stored locally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
- [Prism.js](https://prismjs.com/) for syntax highlighting
- [KaTeX](https://katex.org/) for math rendering
- [Marked.js](https://marked.js.org/) for markdown parsing

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for the AI community