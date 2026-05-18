// Настройка базового URL для бэкенда
const API_URL = "http://127.0.0.1:8000/api/v1";

// Создаем инстанс Axios с базовыми настройками
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Перехватчик (Interceptor), который автоматически добавляет JWT-токен в заголовки
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Функция для переключения страниц (клиентский роутинг)
function showPage(pageName) {
    const contentDiv = document.getElementById("app-content");
    
    if (pageName === "login") {
        contentDiv.innerHTML = renderLoginPage();
    } else if (pageName === "register") {
        contentDiv.innerHTML = renderRegisterPage();
    }
    // Сюда добавим обработку страниц спортсмена и админа чуть позже
}

// Заглушки для функций рендеринга страниц авторизации (напишем их на следующем шаге)
function renderLoginPage() {
    return `<div class="text-center py-20"><h2 class="text-2xl font-bold">Страница входа разрабатывается...</h2></div>`;
}

function renderRegisterPage() {
    return `<div class="text-center py-20"><h2 class="text-2xl font-bold">Страница регистрации разрабатывается...</h2></div>`;
}

// При первом запуске проверяем, авторизован ли пользователь
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        showPage("login"); // Если токена нет — отправляем на вход
    } else {
        // Если токен есть — позже сделаем редирект на дашборд площадок
        showPage("login"); 
    }
});
