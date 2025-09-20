// Global application state
const app = {
    currentTheme: 'red',
    chatHistory: [],
    resultsArea: null,
    currentSection: 'about',
    databases: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    app.resultsArea = document.getElementById('results-area');
    
    // Initialize theme
    setTheme(app.currentTheme);
    
    // Setup event listeners
    setupEventListeners();
    
    // Show default section
    showSection('about');
    
    // Initialize neural assistant
    initializeNeuralAssistant();
    
    // Add button animations
    addButtonAnimations();
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Theme Management
function setTheme(theme) {
    app.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    
    // Update theme button states (both small and large)
    document.querySelectorAll('.theme-btn, .theme-btn-large').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll(`[data-theme="${theme}"]`).forEach(btn => {
        btn.classList.add('active');
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme buttons (both small and large)
    document.querySelectorAll('.theme-btn, .theme-btn-large').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.nav-btn').getAttribute('data-section');
            showSection(section);
            
            // Update active navigation state
            document.querySelectorAll('.nav-btn').forEach(navBtn => navBtn.classList.remove('active'));
            e.target.closest('.nav-btn').classList.add('active');
        });
    });
    
    // Neural assistant chat - use event delegation for dynamic content
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'send-chat') {
            sendChatMessage();
        }
    });
    
    document.addEventListener('keypress', function(e) {
        if (e.target && e.target.id === 'chat-input' && e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        app.currentSection = sectionName;
    }
    
    // Hide results area if switching sections
    const resultsArea = document.getElementById('results-area');
    if (resultsArea) {
        resultsArea.style.display = 'none';
    }
}

// Neural Assistant Functions
function initializeNeuralAssistant() {
    const welcomeMessage = "Добро пожаловать! Я Крис, ваш ИИ-ассистент для OSINT работы. Готов помочь с анализом данных и выбором инструментов.";
    addChatMessage(welcomeMessage, 'assistant');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Send to neural assistant API
    fetch('/api/neural-assistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addChatMessage(data.response, 'assistant');
        } else {
            addChatMessage('Извините, произошла ошибка. Попробуйте позже.', 'assistant');
        }
    })
    .catch(error => {
        console.error('Neural assistant error:', error);
        addChatMessage('Ошибка соединения с ассистентом.', 'assistant');
    });
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    // Create avatar and content structure
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'assistant' ? '🤖' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store in history
    app.chatHistory.push({ message, sender, timestamp: new Date() });
}

// OSINT Tool Functions
function phoneSearch() {
    const phone = document.getElementById('phone-input').value.trim();
    
    if (!phone) {
        showError('Введите номер телефона');
        return;
    }
    
    showLoading('Поиск информации по номеру...');
    
    fetch('/api/phone-lookup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayPhoneResults(data.data);
        } else {
            showError('Ошибка при поиске номера');
        }
    })
    .catch(error => {
        console.error('Phone search error:', error);
        showError('Ошибка соединения');
    });
}

function socialAnalysis() {
    const platform = document.getElementById('social-platform').value;
    const username = document.getElementById('social-username').value.trim();
    
    if (!username) {
        showError('Введите имя пользователя');
        return;
    }
    
    showLoading('Анализ профиля в социальной сети...');
    
    fetch('/api/social-analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform, username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySocialResults(data.data);
        } else {
            showError('Ошибка при анализе профиля');
        }
    })
    .catch(error => {
        console.error('Social analysis error:', error);
        showError('Ошибка соединения');
    });
}

function metadataAnalysis() {
    const fileInput = document.getElementById('metadata-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Выберите файл для анализа');
        return;
    }
    
    showLoading('Анализ метаданных файла...');
    
    // Simulate file analysis
    setTimeout(() => {
        fetch('/api/metadata-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileInfo: file.name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMetadataResults(data.data);
            } else {
                showError('Ошибка при анализе метаданных');
            }
        })
        .catch(error => {
            console.error('Metadata analysis error:', error);
            showError('Ошибка соединения');
        });
    }, 1500);
}

function geoSearch() {
    const query = document.getElementById('geo-query').value.trim();
    
    if (!query) {
        showError('Введите адрес, координаты или IP');
        return;
    }
    
    showLoading('Поиск геолокации...');
    
    fetch('/api/geolocation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayGeoResults(data.data);
        } else {
            showError('Ошибка при поиске геолокации');
        }
    })
    .catch(error => {
        console.error('Geolocation error:', error);
        showError('Ошибка соединения');
    });
}

function documentVerify() {
    const docType = document.getElementById('doc-type').value;
    const docNumber = document.getElementById('doc-number').value.trim();
    
    if (!docNumber) {
        showError('Введите номер документа');
        return;
    }
    
    showLoading('Проверка документа...');
    
    fetch('/api/document-verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ docType, docNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayDocumentResults(data.data);
        } else {
            showError('Ошибка при проверке документа');
        }
    })
    .catch(error => {
        console.error('Document verification error:', error);
        showError('Ошибка соединения');
    });
}

// Database Functions
function databaseSearch() {
    const query = document.getElementById('database-query').value.trim();
    
    if (!query) {
        showError('Введите запрос для поиска');
        return;
    }
    
    if (app.databases.length === 0) {
        showError('Нет загруженных баз данных. Загрузите базу в настройках.');
        return;
    }
    
    showLoading('Поиск в базах данных...');
    
    // Search in local databases
    let results = [];
    app.databases.forEach(db => {
        if (db.data) {
            const matches = db.data.filter(item => {
                return Object.values(item).some(value => 
                    String(value).toLowerCase().includes(query.toLowerCase())
                );
            });
            if (matches.length > 0) {
                results.push({ database: db.name, matches });
            }
        }
    });
    
    // Also try API search
    fetch('/api/database-search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.length > 0) {
            results.push({ database: 'Онлайн база', matches: data.data });
        }
        displayDatabaseResults({ query, results });
    })
    .catch(error => {
        console.error('Database search error:', error);
        if (results.length > 0) {
            displayDatabaseResults({ query, results });
        } else {
            showError('Ошибка поиска в базах данных');
        }
    });
}

function uploadDatabase() {
    const fileInput = document.getElementById('database-file');
    const files = fileInput.files;
    
    if (!files || files.length === 0) {
        showError('Выберите файлы базы данных');
        return;
    }
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let data;
                const extension = file.name.split('.').pop().toLowerCase();
                
                if (extension === 'json') {
                    data = JSON.parse(e.target.result);
                } else if (extension === 'csv') {
                    data = parseCSV(e.target.result);
                } else if (extension === 'txt') {
                    data = e.target.result.split('\n').filter(line => line.trim());
                } else {
                    throw new Error('Неподдерживаемый формат файла');
                }
                
                app.databases.push({
                    name: file.name,
                    type: extension,
                    data: data,
                    uploadDate: new Date()
                });
                
                updateDatabaseList();
                showToast(`База "${file.name}" успешно загружена`);
                
            } catch (error) {
                showError(`Ошибка загрузки файла ${file.name}: ${error.message}`);
            }
        };
        reader.readAsText(file);
    });
    
    // Clear file input
    fileInput.value = '';
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        data.push(obj);
    }
    
    return data;
}

function updateDatabaseList() {
    const databaseList = document.getElementById('database-list');
    if (!databaseList) return;
    
    if (app.databases.length === 0) {
        databaseList.innerHTML = '<div class="no-databases">Нет загруженных баз данных</div>';
        return;
    }
    
    const html = app.databases.map(db => `
        <div class="database-item">
            <div class="db-info">
                <strong>${db.name}</strong>
                <span class="db-meta">${db.type.toUpperCase()} • ${Array.isArray(db.data) ? db.data.length : 'N/A'} записей</span>
            </div>
            <button onclick="removeDatabase('${db.name}')" class="remove-btn">🗑️</button>
        </div>
    `).join('');
    
    databaseList.innerHTML = html;
}

function removeDatabase(name) {
    app.databases = app.databases.filter(db => db.name !== name);
    updateDatabaseList();
    showToast(`База "${name}" удалена`);
}

// Display Functions
function displayPhoneResults(data) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card">
            <h4>📱 Результат поиска номера</h4>
            <p><strong>Номер:</strong> ${data.phone}</p>
            <p><strong>Страна:</strong> ${data.country}</p>
            <p><strong>Оператор:</strong> ${data.operator}</p>
            <p><strong>Регион:</strong> ${data.region}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function displaySocialResults(data) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card">
            <h4>📱 Анализ социальной сети</h4>
            <p><strong>Пользователь:</strong> ${data.username}</p>
            <p><strong>Платформа:</strong> ${data.platform}</p>
            <p><strong>Статус:</strong> ${data.status}</p>
            <p><strong>Информация:</strong> ${data.info}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function displayMetadataResults(data) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card">
            <h4>📄 Анализ метаданных</h4>
            <p><strong>Файл:</strong> ${data.filename}</p>
            <p><strong>Дата создания:</strong> ${data.metadata.created}</p>
            <p><strong>Устройство:</strong> ${data.metadata.camera}</p>
            <p><strong>Геолокация:</strong> ${data.metadata.location}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function displayGeoResults(data) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card">
            <h4>🌍 Результат геолокации</h4>
            <p><strong>Запрос:</strong> ${data.query}</p>
            <p><strong>Координаты:</strong> ${data.coordinates}</p>
            <p><strong>Местоположение:</strong> ${data.location}</p>
            <p><strong>Точность:</strong> ${data.accuracy}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function displayDocumentResults(data) {
    const docTypeNames = {
        'passport': 'Паспорт РФ',
        'inn': 'ИНН',
        'snils': 'СНИЛС',
        'oms': 'ОМС'
    };
    
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card">
            <h4>📋 Проверка документа</h4>
            <p><strong>Тип:</strong> ${docTypeNames[data.docType]}</p>
            <p><strong>Номер:</strong> ${data.docNumber}</p>
            <p><strong>Статус:</strong> ${data.status}</p>
            <p><strong>Регион:</strong> ${data.region}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function displayDatabaseResults(data) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    
    let html = `
        <div class="result-card">
            <h4>🗃️ Результаты поиска в базах данных</h4>
            <p><strong>Запрос:</strong> ${data.query}</p>
            <p><strong>Найдено:</strong> ${data.results.reduce((sum, db) => sum + db.matches.length, 0)} записей в ${data.results.length} базах</p>
        </div>
    `;
    
    data.results.forEach(result => {
        html += `
            <div class="result-card">
                <h5>База: ${result.database}</h5>
                <div class="database-matches">
        `;
        
        result.matches.slice(0, 10).forEach(match => { // Показываем только первые 10 результатов
            html += '<div class="match-item">';
            Object.entries(match).forEach(([key, value]) => {
                html += `<p><strong>${key}:</strong> ${value}</p>`;
            });
            html += '</div>';
        });
        
        if (result.matches.length > 10) {
            html += `<p class="more-results">... и ещё ${result.matches.length - 10} результатов</p>`;
        }
        
        html += '</div></div>';
    });
    
    if (data.results.length === 0) {
        html += `
            <div class="result-card">
                <p>По запросу "${data.query}" ничего не найдено в загруженных базах данных.</p>
            </div>
        `;
    }
    
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function showLoading(message) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div style="text-align: center; padding: 2rem;">
            <div class="loading"></div>
            <p style="margin-top: 1rem; color: var(--text-muted);">${message}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

function showError(message) {
    showResultsArea();
    const resultsContent = document.querySelector('.results-content');
    const html = `
        <div class="result-card" style="border-color: var(--error-color);">
            <h4 style="color: var(--error-color);">❌ Ошибка</h4>
            <p>${message}</p>
        </div>
    `;
    if (resultsContent) {
        resultsContent.innerHTML = html;
    } else {
        app.resultsArea.innerHTML = html;
    }
}

// Show results area and hide info cards
function showResultsArea() {
    const infoCards = document.querySelector('.info-cards');
    const resultsArea = document.getElementById('results-area');
    
    if (infoCards) {
        infoCards.style.display = 'none';
    }
    if (resultsArea) {
        resultsArea.style.display = 'block';
    }
}

// Show info cards and hide results area
function showInfoCards() {
    const infoCards = document.querySelector('.info-cards');
    const resultsArea = document.getElementById('results-area');
    
    if (infoCards) {
        infoCards.style.display = 'grid';
    }
    if (resultsArea) {
        resultsArea.style.display = 'none';
    }
}

// Add button animations
function addButtonAnimations() {
    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleString('ru-RU');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show toast notification
        showToast('Скопировано в буфер обмена');
    });
}

function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}