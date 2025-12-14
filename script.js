// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ФУНКЦИИ =====

// Эффект следования за курсором
let cursorEffect = null;
let logoElement = null;
let isCursorOverLogo = false;

// Инициализация эффекта курсора
function initCursorEffect() {
    cursorEffect = document.getElementById('cursorEffect');
    logoElement = document.getElementById('logo');
    
    if (!cursorEffect || !logoElement) return;
    
    // Следим за движением мыши
    document.addEventListener('mousemove', (e) => {
        if (!isCursorOverLogo) {
            cursorEffect.style.opacity = '0';
            return;
        }
        
        const logoRect = logoElement.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;
        
        // Рассчитываем расстояние от центра логотипа
        const distanceX = e.clientX - logoCenterX;
        const distanceY = e.clientY - logoCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Максимальное расстояние для эффекта
        const maxDistance = 150;
        
        if (distance < maxDistance) {
            // Позиция эффекта ближе к курсору, но сглаженная
            const effectX = logoCenterX + distanceX * 0.3;
            const effectY = logoCenterY + distanceY * 0.3;
            
            cursorEffect.style.left = effectX + 'px';
            cursorEffect.style.top = effectY + 'px';
            cursorEffect.style.opacity = '0.7';
            cursorEffect.classList.add('active');
            
            // Размер эффекта зависит от расстояния
            const size = 20 + (1 - distance / maxDistance) * 30;
            cursorEffect.style.width = size + 'px';
            cursorEffect.style.height = size + 'px';
        } else {
            cursorEffect.style.opacity = '0';
            cursorEffect.classList.remove('active');
        }
    });
    
    // Отслеживаем наведение на логотип
    logoElement.addEventListener('mouseenter', () => {
        isCursorOverLogo = true;
        cursorEffect.style.opacity = '0.7';
    });
    
    logoElement.addEventListener('mouseleave', () => {
        isCursorOverLogo = false;
        cursorEffect.style.opacity = '0';
        cursorEffect.classList.remove('active');
    });
}

// Сохранение данных пользователя
function saveUserData(username) {
    localStorage.setItem('brc_username', username);
    localStorage.setItem('brc_logged_in', 'true');
    localStorage.setItem('brc_login_time', new Date().toISOString());
    sessionStorage.setItem('brc_username', username);
}

// Получение данных пользователя
function getUserData() {
    const username = localStorage.getItem('brc_username');
    const isLoggedIn = localStorage.getItem('brc_logged_in') === 'true';
    return { username, isLoggedIn };
}

// Показать сообщение
function showMessage(text, type, elementId = 'message') {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Автоматическое скрытие сообщения
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Валидация никнейма
function validateUsername(username) {
    // Проверка на английские буквы, цифры и подчеркивание
    const englishRegex = /^[a-zA-Z0-9_]+$/;
    
    // Проверка что состоит из 2 частей (разделенных пробелом или подчеркиванием)
    const parts = username.split(/[\s_]+/).filter(part => part.length > 0);
    
    // Примеры валидных никнеймов: Tigr VZooparke, Arbiz Bokser, Andre_Philip, Forte_Evolar
    if (parts.length < 2) {
        return { isValid: false, message: 'Никнейм должен состоять из 2 слов (например: Tigr VZooparke или Andre_Philip)' };
    }
    
    // Проверка каждого слова на английские символы
    for (const part of parts) {
        if (!englishRegex.test(part)) {
            return { isValid: false, message: 'Используйте только английские буквы, цифры и подчеркивание' };
        }
        
        if (part.length < 2) {
            return { isValid: false, message: 'Каждое слово должно содержать минимум 2 символа' };
        }
    }
    
    // Проверка общей длины
    if (username.length < 5) {
        return { isValid: false, message: 'Никнейм должен содержать минимум 5 символов' };
    }
    
    if (username.length > 30) {
        return { isValid: false, message: 'Никнейм не должен превышать 30 символов' };
    }
    
    return { isValid: true, message: 'Никнейм валиден' };
}

// Обновление информации об авторизации в шапке
function updateHeaderAuth() {
    const { username, isLoggedIn } = getUserData();
    const headerAuth = document.getElementById('headerAuth');
    const headerUsername = document.getElementById('headerUsername');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    
    if (isLoggedIn && username && headerAuth && headerUsername) {
        headerAuth.style.display = 'flex';
        headerUsername.textContent = username;
        
        // Обработка выхода из шапки
        if (headerLogoutBtn) {
            headerLogoutBtn.onclick = logout;
        }
    } else {
        if (headerAuth) headerAuth.style.display = 'none';
    }
}

// Переключение между страницами
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    const activePage = document.getElementById(pageId + '-page');
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Обновить информацию в шапке
    updateHeaderAuth();
    
    // Если показываем личный кабинет, обновляем данные
    if (pageId === 'account') {
        updateAccountPage();
    }
}

// Проверка авторизации и показ личного кабинета
function checkAuthAndShowAccount() {
    const { isLoggedIn } = getUserData();
    
    if (isLoggedIn) {
        showPage('account');
    } else {
        showMessage('Для доступа к личному кабинету необходимо авторизоваться!', 'error');
        showPage('home');
    }
}

// Выход из аккаунта
function logout() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        localStorage.removeItem('brc_logged_in');
        localStorage.removeItem('brc_username');
        sessionStorage.removeItem('brc_username');
        
        // Если находимся в личном кабинете, переключаем на главную
        if (document.getElementById('account-page').classList.contains('active')) {
            showPage('home');
        }
        
        // Обновляем шапку
        updateHeaderAuth();
        
        // Показываем сообщение
        showMessage('Вы успешно вышли из аккаунта.', 'success');
    }
}

// Показать определенную секцию в личном кабинете
function showAccountSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.account-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показать выбранную секцию
    const activeSection = document.getElementById(sectionId + '-section');
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// Установка активного пункта в боковой панели
function setActiveSidebar(element) {
    // Убираем активный класс у всех элементов
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Добавляем активный класс выбранному элементу
    element.classList.add('active');
}

// Открыть Telegram бота
function openTelegramBot() {
    window.open('https://t.me/jobseo_bot?start=user1138352654', '_blank');
    showMessage('Открываю Telegram-бота... Не забудьте зарегистрироваться для получения бонуса!', 'info');
}

// Показать/скрыть форму восстановления пароля
function togglePasswordRecovery() {
    const loginForm = document.getElementById('loginForm').parentElement;
    const recoveryBox = document.getElementById('recoveryBox');
    
    if (loginForm.style.display !== 'none') {
        loginForm.style.display = 'none';
        recoveryBox.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        recoveryBox.style.display = 'none';
    }
}

// ===== ГЛАВНАЯ СТРАНИЦА =====
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем эффект курсора
    initCursorEffect();
    
    // Проверка авторизации при загрузке
    const { username, isLoggedIn } = getUserData();
    
    // Обновляем шапку
    updateHeaderAuth();
    
    // Если пользователь авторизован, показываем приветствие вместо формы
    if (isLoggedIn && username) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.style.display = 'none';
            const authBox = document.querySelector('.auth-box');
            
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'welcome-message';
            welcomeMessage.innerHTML = `
                <h3><i class="fas fa-check-circle"></i> Вы уже авторизованы</h3>
                <p>Привет, <strong>${username}</strong>!</p>
                <p>Вы можете перейти в <a href="#" onclick="checkAuthAndShowAccount()" style="color: var(--accent);">личный кабинет</a> или <a href="#" onclick="logout()" style="color: var(--primary);">выйти</a> из системы.</p>
            `;
            
            authBox.appendChild(welcomeMessage);
        }
    }
    
    // ===== ОБРАБОТКА ФОРМЫ АВТОРИЗАЦИИ =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Валидация никнейма
            const validation = validateUsername(username);
            if (!validation.isValid) {
                showMessage(validation.message, 'error');
                usernameInput.focus();
                return;
            }
            
            // Валидация пароля
            if (password.length < 6) {
                showMessage('Пароль должен содержать минимум 6 символов', 'error');
                passwordInput.focus();
                return;
            }
            
            // Сохраняем данные пользователя
            saveUserData(username);
            
            // Симуляция успешной авторизации
            showMessage(`Добро пожаловать, ${username}! Перенаправляем в личный кабинет...`, 'success');
            
            // Очистка формы
            loginForm.reset();
            
            // Обновляем шапку
            updateHeaderAuth();
            
            // Перенаправление в личный кабинет через 1.5 секунды
            setTimeout(() => {
                showPage('account');
                updateAccountPage();
            }, 1500);
        });
    }
    
    // ===== ОБРАБОТКА КНОПОК ПОКУПКИ =====
    document.querySelectorAll('.btn-offer').forEach(button => {
        button.addEventListener('click', function() {
            const offerTitle = this.getAttribute('data-offer');
            const offerPrice = this.getAttribute('data-price');
            
            // Проверяем, авторизован ли пользователь
            const { isLoggedIn } = getUserData();
            
            if (isLoggedIn) {
                // Если авторизован, перенаправляем в кабинет
                showMessage('Для покупки необходимо пополнить баланс в личном кабинете', 'info');
                showPage('account');
                showAccountSection('balance');
            } else {
                // Если не авторизован, просим войти
                showMessage(`Для покупки "${offerTitle}" за ${offerPrice} ₽ необходимо войти в систему.`, 'error');
            }
        });
    });
    
    // ===== ОБРАБОТКА ССЫЛКИ РЕГИСТРАЦИИ =====
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('Регистрация временно недоступна. Используйте тестовый вход. Требования: английские буквы, 2 слова (например: Tigr VZooparke или Andre_Philip)', 'info');
        });
    }
    
    // ===== ОБРАБОТКА "ЗАБЫЛИ ПАРОЛЬ" =====
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            togglePasswordRecovery();
        });
    }
    
    // ===== ОБРАБОТКА ВОЗВРАТА КО ВХОДУ =====
    const backToLoginLink = document.getElementById('backToLoginLink');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            togglePasswordRecovery();
        });
    }
    
    // ===== ОБРАБОТКА ФОРМЫ ВОССТАНОВЛЕНИЯ ПАРОЛЯ =====
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('recoveryEmail').value.trim();
            const recoveryUsername = document.getElementById('recoveryUsername').value.trim();
            
            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Введите корректный email адрес', 'error', 'recoveryMessage');
                return;
            }
            
            // Валидация никнейма
            const validation = validateUsername(recoveryUsername);
            if (!validation.isValid) {
                showMessage(validation.message, 'error', 'recoveryMessage');
                return;
            }
            
            // Симуляция отправки ссылки
            showMessage(`Ссылка для восстановления пароля отправлена на ${email}. Проверьте вашу почту.`, 'success', 'recoveryMessage');
            
            // Очистка формы
            recoveryForm.reset();
            
            // Возврат к форме входа через 3 секунды
            setTimeout(() => {
                togglePasswordRecovery();
            }, 3000);
        });
    }
    
    // ===== ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Пропускаем ссылки без якоря или якорь "#"
            if (href === '#' || href === '') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== АНИМАЦИИ ПРИ НАВЕДЕНИИ НА КНОПКИ =====
    const dynamicButtons = document.querySelectorAll('.btn-dynamic');
    dynamicButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
    });
    
    // Анимация для динамических карточек
    const dynamicCards = document.querySelectorAll('.card-dynamic');
    dynamicCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0)';
        });
    });
});

// ===== ЛИЧНЫЙ КАБИНЕТ =====
// Обновление страницы личного кабинета
function updateAccountPage() {
    const { username } = getUserData();
    
    // Обновляем имя пользователя
    const userNameElement = document.getElementById('userName');
    if (userNameElement && username) {
        userNameElement.textContent = username;
    }
    
    // Показываем первую секцию по умолчанию
    showAccountSection('dashboard');
}

// Добавление нового игрового аккаунта
function addGameAccount() {
    const accountName = prompt('Введите имя вашего игрового аккаунта в Black Russia (английские буквы, 2 слова):');
    if (accountName && accountName.trim() !== '') {
        // Валидация введенного никнейма
        const validation = validateUsername(accountName);
        if (validation.isValid) {
            showMessage(`Аккаунт "${accountName}" успешно добавлен! Теперь вы можете пополнить его баланс.`, 'success');
            // После добавления аккаунта показываем раздел баланса
            showAccountSection('balance');
        } else {
            showMessage(validation.message, 'error');
        }
    }
}

// Показать метод пополнения
function showDepositMethod(method) {
    const methodNames = {
        'card': 'банковской картой',
        'qiwi': 'QIWI кошельком',
        'crypto': 'криптовалютой'
    };
    
    const amount = prompt(`Введите сумму пополнения ${methodNames[method]} (минимум 100 рублей):`);
    
    if (amount && parseInt(amount) >= 100) {
        showMessage(`Запрос на пополнение ${amount} рублей ${methodNames[method]} принят. Перейдите в Telegram-бота для завершения операции.`, 'info');
        
        // Открываем Telegram бота в новой вкладке
        setTimeout(() => {
            openTelegramBot();
        }, 2000);
    } else if (amount) {
        showMessage('Минимальная сумма пополнения - 100 рублей', 'error');
    }
}