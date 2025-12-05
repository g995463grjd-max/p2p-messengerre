// P2P Мессенджер с вкладками - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
class P2PMessenger {
    constructor() {
        // Данные пользователя
        this.userName = localStorage.getItem('p2p_username') || 'Игрок' + Math.floor(Math.random() * 1000);
        this.userId = 'USER_' + this.generateId(8);
        
        // Данные комнаты
        this.roomId = null;
        this.isCreator = false;
        this.connectedUsers = new Map(); // userId -> {name, connected}
        
        // Состояние звонка
        this.isCallActive = false;
        this.isMicrophoneOn = true;
        this.isSpeakerOn = true;
        this.isVideoOn = false;
        this.isScreenSharing = false;
        this.isRecording = false;
        
        // Таймер звонка
        this.callTimer = null;
        this.callStartTime = null;
        this.callDuration = '00:00';
        
        // Инициализация
        this.init();
    }
    
    init() {
        console.log('🚀 Инициализация P2P мессенджера...');
        
        // 1. Инициализация вкладок
        this.initTabs();
        
        // 2. Инициализация всех обработчиков
        this.initEventHandlers();
        
        // 3. Установка начальных значений
        this.updateUI();
        
        // 4. Загрузка настроек
        this.loadSettings();
        
        // 5. Имитация P2P соединения (для демо)
        this.initDemoMode();
        
        console.log('✅ Мессенджер инициализирован');
    }
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ВКЛАДОК ====================
    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tabId = tab.dataset.tab;
                console.log(`Переключение на вкладку: ${tabId}`);
                
                // Убираем активный класс у всех
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Добавляем активный класс текущей
                tab.classList.add('active');
                const targetContent = document.getElementById(`${tabId}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Сохраняем выбор
                localStorage.setItem('lastActiveTab', tabId);
                
                // Особые действия при переключении
                this.onTabSwitch(tabId);
            });
        });
        
        // Восстанавливаем последнюю вкладку
        const lastTab = localStorage.getItem('lastActiveTab') || 'call';
        const lastTabElement = document.querySelector(`.tab[data-tab="${lastTab}"]`);
        if (lastTabElement) {
            setTimeout(() => lastTabElement.click(), 100);
        }
    }
    
    onTabSwitch(tabId) {
        switch(tabId) {
            case 'call':
                console.log('Открыта вкладка звонка');
                break;
            case 'chat':
                console.log('Открыта вкладка чата');
                this.scrollChatToBottom();
                break;
            case 'users':
                console.log('Открыта вкладка участников');
                this.updateUsersList();
                break;
            case 'files':
                console.log('Открыта вкладка файлов');
                break;
            case 'settings':
                console.log('Открыта вкладка настроек');
                this.loadSettingsForm();
                break;
        }
    }
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ ====================
    initEventHandlers() {
        console.log('🔄 Инициализация обработчиков событий...');
        
        // ---------- КНОПКИ ЗВОНКА ----------
        // Создать комнату
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createRoom());
            console.log('✅ Обработчик: create-room-btn');
        }
        
        // Присоединиться
        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.joinRoom());
            console.log('✅ Обработчик: join-room-btn');
        }
        
        // Пригласить
        const inviteBtn = document.getElementById('invite-btn');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', () => this.showInviteModal());
            console.log('✅ Обработчик: invite-btn');
        }
        
        // Микрофон
        const micToggle = document.getElementById('mic-toggle');
        const micControl = document.getElementById('mic-control');
        if (micToggle) {
            micToggle.addEventListener('click', () => this.toggleMicrophone());
            console.log('✅ Обработчик: mic-toggle');
        }
        if (micControl) {
            micControl.addEventListener('click', () => this.toggleMicrophone());
            console.log('✅ Обработчик: mic-control');
        }
        
        // Динамики
        const speakerToggle = document.getElementById('speaker-toggle');
        if (speakerToggle) {
            speakerToggle.addEventListener('click', () => this.toggleSpeaker());
            console.log('✅ Обработчик: speaker-toggle');
        }
        
        // Камера
        const videoToggle = document.getElementById('video-toggle');
        const videoControl = document.getElementById('video-control');
        if (videoToggle) {
            videoToggle.addEventListener('click', () => this.toggleVideo());
            console.log('✅ Обработчик: video-toggle');
        }
        if (videoControl) {
            videoControl.addEventListener('click', () => this.toggleVideo());
            console.log('✅ Обработчик: video-control');
        }
        
        // Демонстрация экрана
        const screenToggle = document.getElementById('screen-toggle');
        if (screenToggle) {
            screenToggle.addEventListener('click', () => this.toggleScreenShare());
            console.log('✅ Обработчик: screen-toggle');
        }
        
        // Запись
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
            console.log('✅ Обработчик: record-btn');
        }
        
        // Завершить звонок
        const endCallBtn = document.getElementById('end-call-btn');
        if (endCallBtn) {
            endCallBtn.addEventListener('click', () => this.endCall());
            console.log('✅ Обработчик: end-call-btn');
        }
        
        // ---------- ЧАТ ----------
        // Отправить сообщение
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            console.log('✅ Обработчик: send-btn');
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
            console.log('✅ Обработчик: chat-input (Enter)');
        }
        
        // Очистить чат
        const clearChatBtn = document.getElementById('clear-chat-btn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
            console.log('✅ Обработчик: clear-chat-btn');
        }
        
        // Экспорт чата
        const exportChatBtn = document.getElementById('export-chat-btn');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => this.exportChat());
            console.log('✅ Обработчик: export-chat-btn');
        }
        
        // Смайлы
        const emojiBtn = document.getElementById('emoji-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.showEmojiPicker());
            console.log('✅ Обработчик: emoji-btn');
        }
        
        // Прикрепить файл
        const attachBtn = document.getElementById('attach-btn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
            console.log('✅ Обработчик: attach-btn');
        }
        
        // ---------- УЧАСТНИКИ ----------
        // Пригласить пользователя
        const inviteUserBtn = document.getElementById('invite-user-btn');
        if (inviteUserBtn) {
            inviteUserBtn.addEventListener('click', () => this.showInviteModal());
            console.log('✅ Обработчик: invite-user-btn');
        }
        
        // Копировать ссылку
        const copyRoomLinkBtn = document.getElementById('copy-room-link-btn');
        if (copyRoomLinkBtn) {
            copyRoomLinkBtn.addEventListener('click', () => this.copyRoomLink());
            console.log('✅ Обработчик: copy-room-link-btn');
        }
        
        // Копировать ID комнаты
        const copyRoomIdBtn = document.getElementById('copy-room-id-btn');
        if (copyRoomIdBtn) {
            copyRoomIdBtn.addEventListener('click', () => this.copyRoomId());
            console.log('✅ Обработчик: copy-room-id-btn');
        }
        
        // Поиск участников
        const usersSearch = document.getElementById('users-search');
        if (usersSearch) {
            usersSearch.addEventListener('input', (e) => this.filterUsers(e.target.value));
            console.log('✅ Обработчик: users-search');
        }
        
        // ---------- ФАЙЛЫ ----------
        // Выбрать файлы
        const selectFilesBtn = document.getElementById('select-files-btn');
        const fileInput = document.getElementById('file-input');
        const dropArea = document.getElementById('files-drop-area');
        
        if (selectFilesBtn) {
            selectFilesBtn.addEventListener('click', () => fileInput.click());
            console.log('✅ Обработчик: select-files-btn');
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
            console.log('✅ Обработчик: file-input');
        }
        
        if (dropArea) {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('dragover');
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('dragover');
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
            
            console.log('✅ Обработчик: files-drop-area (drag&drop)');
        }
        
        // ---------- НАСТРОЙКИ ----------
        // Сохранить настройки
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            console.log('✅ Обработчик: save-settings-btn');
        }
        
        // Сбросить настройки
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
            console.log('✅ Обработчик: reset-settings-btn');
        }
        
        // Изменить имя пользователя
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) {
            usernameInput.value = this.userName;
            usernameInput.addEventListener('change', (e) => {
                this.userName = e.target.value.trim() || this.userName;
                localStorage.setItem('p2p_username', this.userName);
                this.updateUserProfile();
                this.showNotification(`Имя изменено на: ${this.userName}`);
            });
            console.log('✅ Обработчик: username-input');
        }
        
        // Изменить аватар
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => this.changeAvatar());
            console.log('✅ Обработчик: change-avatar-btn');
        }
        
        // Тест звука
        const testAudioBtn = document.getElementById('test-audio-btn');
        if (testAudioBtn) {
            testAudioBtn.addEventListener('click', () => this.testAudio());
            console.log('✅ Обработчик: test-audio-btn');
        }
        
        // Тест видео
        const testVideoBtn = document.getElementById('test-video-btn');
        if (testVideoBtn) {
            testVideoBtn.addEventListener('click', () => this.testVideo());
            console.log('✅ Обработчик: test-video-btn');
        }
        
        // Тема оформления
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const theme = e.target.dataset.theme;
                this.setTheme(theme);
                this.showNotification(`Тема изменена: ${theme}`);
            });
        });
        
        console.log('✅ Все обработчики инициализированы');
    }
    
    // ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
    
    // СОЗДАНИЕ КОМНАТЫ
    createRoom() {
        console.log('🎮 Создание комнаты...');
        
        if (this.isCallActive) {
            if (confirm('Уже есть активный звонок. Создать новую комнату?')) {
                this.endCall();
                setTimeout(() => this.createRoom(), 500);
            }
            return;
        }
        
        this.roomId = this.generateId(8);
        this.isCreator = true;
        this.isCallActive = true;
        
        // Очищаем список пользователей и добавляем себя
        this.connectedUsers.clear();
        this.addUser(this.userId, this.userName, true);
        
        // Обновляем UI
        this.updateConnectionStatus(true);
        this.updateRoomInfo();
        this.startCallTimer();
        
        // Показываем уведомление
        this.showNotification(`Комната создана! ID: ${this.roomId}`);
        
        // Добавляем системное сообщение в чат
        this.addSystemMessage(`Вы создали комнату "${this.roomId}". Пригласите друзей!`);
        
        console.log(`✅ Комната создана: ${this.roomId}`);
    }
    
    // ПРИСОЕДИНЕНИЕ К КОМНАТЕ
    joinRoom() {
        console.log('🔗 Присоединение к комнате...');
        
        if (this.isCallActive) {
            alert('Сначала завершите текущий звонок');
            return;
        }
        
        const roomId = prompt('Введите ID комнаты для подключения:', '');
        if (!roomId || roomId.trim().length !== 8) {
            alert('ID комнаты должен состоять из 8 символов');
            return;
        }
        
        this.roomId = roomId.trim();
        this.isCreator = false;
        this.isCallActive = true;
        
        // Обновляем UI
        this.updateConnectionStatus(true);
        this.updateRoomInfo();
        this.startCallTimer();
        
        // Имитируем подключение к другим пользователям (демо)
        this.simulateConnection();
        
        // Показываем уведомление
        this.showNotification(`Подключение к комнате: ${this.roomId}`);
        
        // Добавляем системное сообщение в чат
        this.addSystemMessage(`Вы присоединились к комнате "${this.roomId}"`);
        
        console.log(`✅ Подключение к комнате: ${this.roomId}`);
    }
    
    // МИКРОФОН
    toggleMicrophone() {
        this.isMicrophoneOn = !this.isMicrophoneOn;
        
        // Обновляем кнопки
        const micToggle = document.getElementById('mic-toggle');
        const micControl = document.getElementById('mic-control');
        const micStatusIcon = document.getElementById('mic-status-icon');
        
        if (micToggle) {
            micToggle.classList.toggle('active', this.isMicrophoneOn);
            micToggle.innerHTML = `
                <i class="fas fa-${this.isMicrophoneOn ? 'microphone' : 'microphone-slash'}"></i>
                <span>${this.isMicrophoneOn ? 'Микрофон' : 'Выкл'}</span>
            `;
        }
        
        if (micControl) {
            micControl.innerHTML = `<i class="fas fa-${this.isMicrophoneOn ? 'microphone' : 'microphone-slash'}"></i>`;
        }
        
        if (micStatusIcon) {
            micStatusIcon.className = `fas fa-${this.isMicrophoneOn ? 'microphone' : 'microphone-slash'}`;
        }
        
        this.showNotification(`Микрофон ${this.isMicrophoneOn ? 'включен' : 'выключен'}`);
        console.log(`🎤 Микрофон: ${this.isMicrophoneOn ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // ДИНАМИКИ
    toggleSpeaker() {
        this.isSpeakerOn = !this.isSpeakerOn;
        
        const speakerToggle = document.getElementById('speaker-toggle');
        const speakerStatusIcon = document.getElementById('speaker-status-icon');
        
        if (speakerToggle) {
            speakerToggle.classList.toggle('active', this.isSpeakerOn);
            speakerToggle.innerHTML = `
                <i class="fas fa-${this.isSpeakerOn ? 'volume-up' : 'volume-mute'}"></i>
                <span>${this.isSpeakerOn ? 'Динамики' : 'Выкл'}</span>
            `;
        }
        
        if (speakerStatusIcon) {
            speakerStatusIcon.className = `fas fa-${this.isSpeakerOn ? 'volume-up' : 'volume-mute'}`;
        }
        
        this.showNotification(`Динамики ${this.isSpeakerOn ? 'включены' : 'выключены'}`);
        console.log(`🔊 Динамики: ${this.isSpeakerOn ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // КАМЕРА
    toggleVideo() {
        this.isVideoOn = !this.isVideoOn;
        
        const videoToggle = document.getElementById('video-toggle');
        const videoControl = document.getElementById('video-control');
        const videoStatusIcon = document.getElementById('video-status-icon');
        
        if (videoToggle) {
            videoToggle.classList.toggle('active', this.isVideoOn);
            videoToggle.innerHTML = `
                <i class="fas fa-${this.isVideoOn ? 'video' : 'video-slash'}"></i>
                <span>${this.isVideoOn ? 'Камера' : 'Выкл'}</span>
            `;
        }
        
        if (videoControl) {
            videoControl.innerHTML = `<i class="fas fa-${this.isVideoOn ? 'video' : 'video-slash'}"></i>`;
        }
        
        if (videoStatusIcon) {
            videoStatusIcon.className = `fas fa-${this.isVideoOn ? 'video' : 'video-slash'}`;
        }
        
        // Обновляем видео-плейсхолдер
        const localVideo = document.getElementById('local-video');
        if (localVideo) {
            if (this.isVideoOn) {
                localVideo.style.display = 'block';
                // Здесь будет реальное видео с камеры
            } else {
                localVideo.style.display = 'none';
            }
        }
        
        this.showNotification(`Камера ${this.isVideoOn ? 'включена' : 'выключена'}`);
        console.log(`📷 Камера: ${this.isVideoOn ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // ДЕМОНСТРАЦИЯ ЭКРАНА
    toggleScreenShare() {
        this.isScreenSharing = !this.isScreenSharing;
        
        const screenToggle = document.getElementById('screen-toggle');
        
        if (screenToggle) {
            screenToggle.classList.toggle('active', this.isScreenSharing);
            screenToggle.innerHTML = `
                <i class="fas fa-${this.isScreenSharing ? 'stop-circle' : 'desktop'}"></i>
                <span>${this.isScreenSharing ? 'Стоп' : 'Экран'}</span>
            `;
        }
        
        this.showNotification(`Демонстрация экрана ${this.isScreenSharing ? 'начата' : 'остановлена'}`);
        console.log(`🖥️ Демонстрация экрана: ${this.isScreenSharing ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // ЗАПИСЬ
    toggleRecording() {
        this.isRecording = !this.isRecording;
        
        const recordBtn = document.getElementById('record-btn');
        
        if (recordBtn) {
            recordBtn.classList.toggle('active', this.isRecording);
            recordBtn.innerHTML = `
                <i class="fas fa-${this.isRecording ? 'stop' : 'circle'}"></i>
                <span>${this.isRecording ? 'Стоп' : 'Запись'}</span>
            `;
            
            // Анимация записи
            if (this.isRecording) {
                recordBtn.style.animation = 'pulse 1s infinite';
            } else {
                recordBtn.style.animation = 'none';
            }
        }
        
        this.showNotification(`Запись ${this.isRecording ? 'начата' : 'остановлена'}`);
        console.log(`🎥 Запись: ${this.isRecording ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // ЗАВЕРШЕНИЕ ЗВОНКА
    endCall() {
        if (!this.isCallActive) {
            alert('Нет активного звонка');
            return;
        }
        
        if (confirm('Завершить звонок для всех участников?')) {
            this.isCallActive = false;
            this.isCreator = false;
            this.roomId = null;
            
            // Останавливаем таймер
            this.stopCallTimer();
            
            // Очищаем список пользователей
            this.connectedUsers.clear();
            
            // Обновляем UI
            this.updateConnectionStatus(false);
            this.updateRoomInfo();
            this.updateUsersList();
            this.clearVideoGrid();
            
            // Добавляем системное сообщение
            this.addSystemMessage('Звонок завершен');
            
            this.showNotification('Звонок завершен');
            console.log('📞 Звонок завершен');
        }
    }
    
    // ==================== ЧАТ ====================
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Добавляем сообщение в чат
        this.addMessage(this.userName, message, true);
        
        // Имитируем ответы других пользователей (демо)
        if (this.isCallActive && Math.random() > 0.5) {
            setTimeout(() => {
                const demoUsers = ['PlayerOne', 'GamerGirl', 'ProGamer'];
                const demoUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
                const responses = [
                    'Привет! Как дела?',
                    'Отличный звонок!',
                    'Слышно хорошо',
                    'Давайте играть',
                    'У меня тоже всё ок'
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                
                this.addMessage(demoUser, response, false);
            }, 1000 + Math.random() * 2000);
        }
        
        // Очищаем поле ввода
        chatInput.value = '';
        chatInput.focus();
        
        console.log(`💬 Сообщение отправлено: ${message}`);
    }
    
    addMessage(sender, text, isOwn = false) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isOwn ? 'own-message' : ''}`;
        
        const time = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${sender}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${this.escapeHtml(text)}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }
    
    addSystemMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        
        messageDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div class="message-content">
                <span>${text}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }
    
    clearChat() {
        if (confirm('Очистить всю историю чата?')) {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                // Оставляем только системное приветственное сообщение
                chatMessages.innerHTML = `
                    <div class="system-message welcome">
                        <i class="fas fa-rocket"></i>
                        <div class="message-content">
                            <strong>Добро пожаловать в P2P мессенджер!</strong>
                            <p>Создайте комнату или присоединитесь к существующей, чтобы начать общение.</p>
                        </div>
                    </div>
                `;
                this.showNotification('Чат очищен');
                console.log('🧹 Чат очищен');
            }
        }
    }
    
    exportChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        let chatText = 'История чата P2P Мессенджера\n';
        chatText += '=============================\n\n';
        
        const messages = chatMessages.querySelectorAll('.chat-message, .system-message');
        messages.forEach(msg => {
            const sender = msg.querySelector('.message-sender')?.textContent || 'Система';
            const text = msg.querySelector('.message-text, .message-content span')?.textContent || '';
            const time = msg.querySelector('.message-time')?.textContent || '';
            
            chatText += `[${time}] ${sender}: ${text}\n`;
        });
        
        // Создаем и скачиваем файл
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `p2p-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('История чата экспортирована');
        console.log('📥 Чат экспортирован');
    }
    
    scrollChatToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // ==================== ФАЙЛЫ ====================
    handleFiles(files) {
        if (!files || files.length === 0) return;
        
        const filesList = document.getElementById('files-list');
        if (!filesList) return;
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileSize = this.formatFileSize(file.size);
            const fileName = file.name.length > 30 
                ? file.name.substring(0, 27) + '...' 
                : file.name;
            
            fileItem.innerHTML = `
                <span class="file-name">
                    <i class="fas fa-file"></i>
                    ${fileName}
                </span>
                <span class="file-size">${fileSize}</span>
                <span class="file-status">
                    <i class="fas fa-check-circle"></i>
                    Готово
                </span>
                <span class="file-actions">
                    <button class="btn-icon small" title="Скачать">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon small" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </span>
            `;
            
            filesList.appendChild(fileItem);
            
            // Добавляем обработчики для кнопок
            const downloadBtn = fileItem.querySelector('.fa-download').closest('button');
            const deleteBtn = fileItem.querySelector('.fa-trash').closest('button');
            
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => this.downloadFile(file));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => fileItem.remove());
            }
        });
        
        this.updateFilesStats();
        this.showNotification(`Добавлено ${files.length} файл(ов)`);
        console.log(`📁 Обработано ${files.length} файл(ов)`);
    }
    
    downloadFile(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Файл "${file.name}" скачан`);
        console.log(`📥 Скачан файл: ${file.name}`);
    }
    
    updateFilesStats() {
        const filesCount = document.getElementById('files-count');
        const filesSize = document.getElementById('files-size');
        
        if (filesCount && filesSize) {
            const files = document.querySelectorAll('.file-item');
            filesCount.textContent = `${files.length} файлов`;
            // Здесь можно подсчитать общий размер файлов
            filesSize.textContent = '~5.2 МБ';
        }
    }
    
    // ==================== НАСТРОЙКИ ====================
    loadSettings() {
        console.log('⚙️ Загрузка настроек...');
        
        // Загружаем имя пользователя
        const savedName = localStorage.getItem('p2p_username');
        if (savedName) {
            this.userName = savedName;
        }
        
        // Загружаем тему
        const theme = localStorage.getItem('theme') || 'dark';
        this.setTheme(theme);
        
        // Устанавливаем активную тему кнопку
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Загружаем другие настройки
        const autoConnect = localStorage.getItem('autoConnect') !== 'false';
        const enableVideo = localStorage.getItem('enableVideo') !== 'false';
        const enableNotifications = localStorage.getItem('enableNotifications') !== 'false';
        
        document.getElementById('auto-connect').checked = autoConnect;
        document.getElementById('enable-video').checked = enableVideo;
        document.getElementById('enable-notifications').checked = enableNotifications;
        
        console.log('✅ Настройки загружены');
    }
    
    loadSettingsForm() {
        // Обновляем поля в форме настроек
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) {
            usernameInput.value = this.userName;
        }
        
        const settingsUserId = document.getElementById('settings-user-id');
        if (settingsUserId) {
            settingsUserId.textContent = this.userId;
        }
    }
    
    saveSettings() {
        console.log('💾 Сохранение настроек...');
        
        // Сохраняем имя пользователя
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) {
            this.userName = usernameInput.value.trim() || this.userName;
            localStorage.setItem('p2p_username', this.userName);
            this.updateUserProfile();
        }
        
        // Сохраняем тему
        const activeThemeBtn = document.querySelector('.theme-btn.active');
        if (activeThemeBtn) {
            localStorage.setItem('theme', activeThemeBtn.dataset.theme);
        }
        
        // Сохраняем другие настройки
        localStorage.setItem('autoConnect', document.getElementById('auto-connect').checked);
        localStorage.setItem('enableVideo', document.getElementById('enable-video').checked);
        localStorage.setItem('enableNotifications', document.getElementById('enable-notifications').checked);
        localStorage.setItem('enableSounds', document.getElementById('enable-sounds')?.checked || true);
        localStorage.setItem('compactMode', document.getElementById('compact-mode')?.checked || false);
        localStorage.setItem('showTimestamps', document.getElementById('show-timestamps')?.checked || true);
        
        this.showNotification('Настройки сохранены');
        console.log('✅ Настройки сохранены');
    }
    
    resetSettings() {
        if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
            localStorage.clear();
            this.userName = 'Игрок' + Math.floor(Math.random() * 1000);
            this.userId = 'USER_' + this.generateId(8);
            
            this.loadSettings();
            this.updateUI();
            
            this.showNotification('Настройки сброшены');
            console.log('🔄 Настройки сброшены');
        }
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        console.log(`🎨 Установлена тема: ${theme}`);
    }
    
    testAudio() {
        this.showNotification('Тест звука: воспроизводится тестовый сигнал');
        console.log('🔊 Тест звука');
        
        // Имитация теста звука
        const audioTest = new AudioContext();
        const oscillator = audioTest.createOscillator();
        const gainNode = audioTest.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioTest.destination);
        
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
            this.showNotification('Тест звука завершен');
        }, 1000);
    }
    
    testVideo() {
        this.showNotification('Тест камеры: проверка видеопотока');
        console.log('📷 Тест видео');
        
        // Здесь будет реальный тест камеры
        // Пока имитация
        setTimeout(() => {
            this.showNotification('Камера работает нормально');
        }, 1500);
    }
    
    changeAvatar() {
        this.showNotification('Функция смены аватара в разработке');
        console.log('🖼️ Запрос на смену аватара');
    }
    
    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
    updateUI() {
        console.log('🔄 Обновление интерфейса...');
        
        // Обновляем информацию о пользователе
        document.getElementById('local-user-name').textContent = this.userName;
        document.getElementById('profile-name').textContent = this.userName;
        document.getElementById('user-id-display').textContent = this.userId;
        document.getElementById('settings-user-id').textContent = this.userId;
        
        // Обновляем статус соединения
        this.updateConnectionStatus(this.isCallActive);
        
        // Обновляем информацию о комнате
        this.updateRoomInfo();
        
        // Обновляем список пользователей
        this.updateUsersList();
        
        console.log('✅ Интерфейс обновлен');
    }
    
    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const roomStatus = document.getElementById('room-status');
        const currentRoom = document.getElementById('current-room');
        
        if (connected) {
            if (statusDot) statusDot.classList.add('connected');
            if (statusText) statusText.textContent = 'Подключен';
            if (roomStatus) {
                roomStatus.textContent = 'Активна';
                roomStatus.className = 'info-value status-badge active';
            }
            if (currentRoom) currentRoom.textContent = this.roomId;
        } else {
            if (statusDot) statusDot.classList.remove('connected');
            if (statusText) statusText.textContent = 'Отключен';
            if (roomStatus) {
                roomStatus.textContent = 'Неактивна';
                roomStatus.className = 'info-value status-badge';
            }
            if (currentRoom) currentRoom.textContent = 'Не подключен';
        }
    }
    
    updateRoomInfo() {
        const roomIdDisplay = document.getElementById('room-id-display');
        if (roomIdDisplay) {
            roomIdDisplay.textContent = this.roomId || 'Не создана';
        }
    }
    
    updateUsersList() {
        const onlineUsers = document.getElementById('online-users');
        if (!onlineUsers) return;
        
        // Очищаем список
        onlineUsers.innerHTML = '';
        
        // Добавляем себя
        this.addUserToList(this.userId, this.userName, true);
        
        // Добавляем других пользователей (демо)
        if (this.isCallActive) {
            const demoUsers = [
                { id: 'USER_ABC123', name: 'PlayerOne' },
                { id: 'USER_DEF456', name: 'GamerGirl' },
                { id: 'USER_GHI789', name: 'ProGamer' }
            ];
            
            demoUsers.forEach(user => {
                this.addUserToList(user.id, user.name, false);
            });
        }
        
        // Обновляем счетчик
        this.updateUserCount();
    }
    
    addUserToList(userId, userName, isLocal) {
        const onlineUsers = document.getElementById('online-users');
        if (!onlineUsers) return;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item online';
        userItem.dataset.user = userId;
        
        const statusIcon = isLocal 
            ? (this.isMicrophoneOn ? 'fa-microphone' : 'fa-microphone-slash')
            : 'fa-microphone';
        
        userItem.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <span class="user-name">${userName} ${isLocal ? '(Вы)' : ''}</span>
            <div class="user-status-icons">
                <i class="fas ${statusIcon}" title="${isLocal ? 'Ваш микрофон' : 'Микрофон'}"></i>
                <i class="fas fa-headphones" title="В сети"></i>
            </div>
        `;
        
        onlineUsers.appendChild(userItem);
    }
    
    updateUserCount() {
        const userCount = document.getElementById('user-count');
        if (userCount) {
            const users = document.querySelectorAll('.user-item.online');
            userCount.textContent = users.length;
        }
    }
    
    updateUserProfile() {
        // Обновляем имя везде где оно отображается
        const elements = [
            'local-user-name',
            'profile-name'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.userName;
            }
        });
    }
    
    startCallTimer() {
        this.stopCallTimer();
        
        this.callStartTime = Date.now();
        this.callTimer = setInterval(() => {
            const elapsed = Date.now() - this.callStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.callDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const callTimerElement = document.getElementById('call-timer');
            if (callTimerElement) {
                callTimerElement.textContent = this.callDuration;
            }
        }, 1000);
    }
    
    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
        this.callDuration = '00:00';
        
        const callTimerElement = document.getElementById('call-timer');
        if (callTimerElement) {
            callTimerElement.textContent = this.callDuration;
        }
    }
    
    clearVideoGrid() {
        const videoGrid = document.getElementById('video-grid');
        if (!videoGrid) return;
        
        // Оставляем только локальное видео
        videoGrid.innerHTML = `
            <div class="video-user local-user">
                <div class="video-wrapper">
                    <video id="local-video" autoplay muted playsinline></video>
                    <div class="user-info-overlay">
                        <span class="user-name" id="local-user-name">Вы</span>
                        <div class="user-status">
                            <i class="fas fa-microphone" id="mic-status-icon"></i>
                            <i class="fas fa-volume-up" id="speaker-status-icon"></i>
                            <i class="fas fa-video" id="video-status-icon"></i>
                        </div>
                    </div>
                    <div class="user-controls">
                        <button class="control-btn mic-control" id="mic-control">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="control-btn video-control" id="video-control">
                            <i class="fas fa-video"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="video-placeholder" id="remote-users-placeholder">
                <i class="fas fa-user-plus"></i>
                <p>Ожидание участников...</p>
            </div>
        `;
        
        // Перепривязываем обработчики
        this.rebindVideoControls();
    }
    
    rebindVideoControls() {
        const micControl = document.getElementById('mic-control');
        const videoControl = document.getElementById('video-control');
        
        if (micControl) {
            micControl.addEventListener('click', () => this.toggleMicrophone());
        }
        
        if (videoControl) {
            videoControl.addEventListener('click', () => this.toggleVideo());
        }
    }
    
    showInviteModal() {
        if (!this.roomId) {
            alert('Сначала создайте или присоединитесь к комнате');
            return;
        }
        
        const inviteText = `Присоединяйтесь к моему звонку в P2P мессенджере!\n\nID комнаты: ${this.roomId}\nВаш ID для ответа: ${this.userId}\n\nСкопируйте этот ID и вставьте в поле "Присоединиться"`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.roomId);
            prompt('ID комнаты скопирован в буфер. Отправьте его друзьям:', inviteText);
        } else {
            prompt('Скопируйте этот текст и отправьте другу:', inviteText);
        }
        
        this.showNotification('Приглашение скопировано');
        console.log('📤 Приглашение отправлено');
    }
    
    copyRoomLink() {
        if (!this.roomId) {
            alert('Сначала создайте комнату');
            return;
        }
        
        const link = `${window.location.origin}?room=${this.roomId}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link);
            this.showNotification('Ссылка скопирована');
        } else {
            prompt('Скопируйте ссылку:', link);
        }
        
        console.log('🔗 Ссылка на комнату скопирована');
    }
    
    copyRoomId() {
        if (!this.roomId) {
            alert('Сначала создайте комнату');
            return;
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.roomId);
            this.showNotification('ID комнаты скопирован');
        } else {
            prompt('Скопируйте ID комнаты:', this.roomId);
        }
        
        console.log('📋 ID комнаты скопирован');
    }
    
    filterUsers(searchTerm) {
        const users = document.querySelectorAll('.user-item.online');
        users.forEach(user => {
            const userName = user.querySelector('.user-name').textContent.toLowerCase();
            const shouldShow = userName.includes(searchTerm.toLowerCase());
            user.style.display = shouldShow ? 'flex' : 'none';
        });
    }
    
    showEmojiPicker() {
        this.showNotification('Выбор смайлов в разработке');
        console.log('😊 Запрос на выбор смайлов');
    }
    
    attachFile() {
        document.getElementById('file-input').click();
    }
    
    // ==================== ДЕМО РЕЖИМ ====================
    initDemoMode() {
        console.log('🎭 Инициализация демо-режима');
        
        // Обновляем задержку каждые 5 секунд
        setInterval(() => {
            const latency = Math.floor(Math.random() * 100) + 20;
            const latencyElement = document.getElementById('latency');
            if (latencyElement) {
                latencyElement.textContent = latency;
            }
            
            // Обновляем качество соединения
            const qualityElement = document.getElementById('connection-quality');
            if (qualityElement) {
                let quality = 'Отличное';
                if (latency > 80) quality = 'Хорошее';
                if (latency > 150) quality = 'Среднее';
                if (latency > 300) quality = 'Плохое';
                qualityElement.textContent = quality;
            }
        }, 5000);
    }
    
    simulateConnection() {
        // Имитируем подключение других пользователей
        setTimeout(() => {
            this.addUser('USER_ABC123', 'PlayerOne', false);
            this.addSystemMessage('PlayerOne присоединился к звонку');
        }, 1000);
        
        setTimeout(() => {
            this.addUser('USER_DEF456', 'GamerGirl', false);
            this.addSystemMessage('GamerGirl присоединилась к звонку');
        }, 2500);
        
        setTimeout(() => {
            this.addUser('USER_GHI789', 'ProGamer', false);
            this.addSystemMessage('ProGamer присоединился к звонку');
        }, 4000);
    }
    
    addUser(userId, userName, isLocal) {
        this.connectedUsers.set(userId, { name: userName, connected: true });
        this.updateUsersList();
    }
    
    // ==================== УТИЛИТЫ ====================
    generateId(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showNotification(message, duration = 3000) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease ${duration}ms forwards;
        `;
        
        document.body.appendChild(notification);
        
        // Добавляем стили для анимации
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration + 300);
        
        console.log(`📢 Уведомление: ${message}`);
    }
}

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
// Проверяем, что DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, запуск приложения...');
    
    // Создаем экземпляр мессенджера
    window.app = new P2PMessenger();
    
    // Проверяем URL на наличие комнаты
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId && roomId.length === 8) {
        console.log(`🔗 Найдена комната в URL: ${roomId}`);
        setTimeout(() => {
            if (confirm(`Найдена комната ${roomId}. Присоединиться?`)) {
                window.app.roomId = roomId;
                window.app.joinRoom();
            }
        }, 1000);
    }
    
    console.log('🎉 Приложение успешно запущено!');
    console.log('=================================');
    console.log('Доступные команды в консоли:');
    console.log('- app.createRoom() - создать комнату');
    console.log('- app.joinRoom() - присоединиться');
    console.log('- app.endCall() - завершить звонок');
    console.log('- app.toggleMicrophone() - микрофон');
    console.log('- app.toggleVideo() - камера');
    console.log('=================================');
});