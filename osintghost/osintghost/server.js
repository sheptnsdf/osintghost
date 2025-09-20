const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes for OSINT tools
app.post('/api/phone-lookup', (req, res) => {
    const { phone } = req.body;
    // Placeholder for phone lookup logic
    res.json({ 
        success: true, 
        data: { 
            phone: phone,
            country: "Russia",
            operator: "Example Operator",
            region: "Example Region"
        }
    });
});

app.post('/api/social-analysis', (req, res) => {
    const { username, platform } = req.body;
    // Placeholder for social media analysis
    res.json({ 
        success: true, 
        data: { 
            username: username,
            platform: platform,
            status: "Profile found",
            info: "Basic information retrieved"
        }
    });
});

app.post('/api/metadata-analysis', (req, res) => {
    const { fileInfo } = req.body;
    // Placeholder for metadata analysis
    res.json({ 
        success: true, 
        data: { 
            filename: fileInfo,
            metadata: {
                created: "2024-01-01",
                camera: "Example Camera",
                location: "Unknown"
            }
        }
    });
});

app.post('/api/geolocation', (req, res) => {
    const { query } = req.body;
    // Placeholder for geolocation
    res.json({ 
        success: true, 
        data: { 
            query: query,
            coordinates: "55.7558, 37.6176",
            location: "Moscow, Russia",
            accuracy: "City level"
        }
    });
});

app.post('/api/document-verify', (req, res) => {
    const { docType, docNumber } = req.body;
    // Placeholder for document verification
    res.json({ 
        success: true, 
        data: { 
            docType: docType,
            docNumber: docNumber,
            status: "Valid format",
            region: "Example Region"
        }
    });
});

app.post('/api/neural-assistant', (req, res) => {
    const { message } = req.body;
    // Simple neural assistant responses
    const responses = [
        "Привет! Я Крис, ваш OSINT ассистент. Чем могу помочь?",
        "Для эффективного поиска рекомендую начать с базовой информации о цели.",
        "Попробуйте использовать несколько источников для проверки данных.",
        "Помните о важности конфиденциальности и этичности в OSINT работе.",
        "Могу помочь с анализом полученных данных или выбором инструментов."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({ 
        success: true, 
        response: randomResponse
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Anomaly OSINT Tool запущен на http://0.0.0.0:${PORT}`);
});