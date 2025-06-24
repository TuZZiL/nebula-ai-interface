require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use environment port or default to 3000

// Enable CORS for requests from any origin (adjust if needed for security)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the target API URL from environment or default
const TARGET_API_URL = process.env.IMAGE_API_URL || 'https://chutes-hidream.chutes.ai/generate';

// Proxy endpoint
app.post('/generate-image', async (req, res) => {
    console.log('Proxy received request body:', req.body); // Log received data
    console.log('Proxy received authorization header:', req.headers.authorization); // Log received token

    // Extract token and prompt data from the incoming request
    const apiToken = req.headers.authorization; // Get token from Authorization header
    const requestData = req.body; // The frontend will send the API parameters in the body

    if (!apiToken || !apiToken.startsWith('Bearer ')) {
        console.error('Proxy Error: Missing or invalid Authorization header');
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    if (!requestData || !requestData.prompt) {
         console.error('Proxy Error: Missing prompt in request body');
        return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    try {
        console.log(`Proxying request to ${TARGET_API_URL} with prompt: ${requestData.prompt}`);
        const apiResponse = await axios.post(TARGET_API_URL, requestData, {
            headers: {
                'Authorization': apiToken, // Forward the token
                'Content-Type': 'application/json',
                'Accept': 'image/*' // Accept image types
            },
             // Expect binary data (ArrayBuffer)
            responseType: 'arraybuffer',
            // Add timeout?
            // timeout: 30000 // e.g., 30 seconds
        });

        console.log('Proxy received response from target API:', apiResponse.status);
        // Get content type from the actual API response
        const contentType = apiResponse.headers['content-type'];
        console.log('Proxy forwarding Content-Type:', contentType);

        // Forward the successful raw image data and content type back to the frontend
        res.setHeader('Content-Type', contentType || 'application/octet-stream'); // Default if header missing
        res.status(apiResponse.status).send(apiResponse.data);

    } catch (error) {
        console.error('Proxy Error calling target API:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Target API Response Status:', error.response.status);
            console.error('Target API Response Data:', error.response.data);
            // Forward the error response from the target API
            res.status(error.response.status).json(error.response.data || { error: 'Target API error' });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Target API No Response:', error.request);
            res.status(504).json({ error: 'No response received from target API (Gateway Timeout)' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Proxy Setup Error:', error.message);
            res.status(500).json({ error: 'Internal proxy server error' });
        }
    }
});

// API endpoint to get configuration (without sensitive data)
app.get('/api/config', (req, res) => {
    res.json({
        defaultApiKey: process.env.DEFAULT_API_KEY || "YOUR_DEFAULT_API_KEY_HERE",
        imageApiUrl: process.env.IMAGE_API_URL || 'https://chutes-hidream.chutes.ai/generate',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Nebula AI Interface server listening on port ${port}`);
    console.log(`Visit: http://localhost:${port}`);
});