const API_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => Promise.reject(error));

// Глобальное состояние выбранной площадки для бронирования
let selectedFieldId = null;

// Функция парсинга JWT токена для извлечения роли и ID
def parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Показ красивых уведомлений
function showToast(message, type = 'success') {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = `fixed bottom-5 right-5 z-50 transform rounded-xl shadow-2xl flex items-center space-x-2 border px-5 py-3 transition-all duration-300 ease-out font-medium text-sm ${
        type === 'success' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : 'bg-rose-950/80 border-rose-500 text-rose-400'
    }`;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.transform = "translateY(20px)";
        toast.style.opacity = "0";
    }, 4000);
}

// Маршрутизатор страниц (Рендеринг на лету)
async function showPage(pageName) {
    const contentDiv = document.getElementById("app-content");
    updateNavbar();

    if (pageName === "login") {
        contentDiv.innerHTML = `
        <div class="max-w-md mx-auto my-12 bg-slate-900 border border-slate-900 rounded-2xl p-8 shadow-2xl">
            <h2 class="text-2xl font-black mb-1 tracking-tight">Авторизация</h2>
            <p class="text-xs text-slate-400 mb-6">Добро пожаловать в систему мониторинга полей</p>
            <form onsubmit="handleLogin(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Email</label>
                    <input type="email" id="auth-email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition">
                </div>
                <div>
                    <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Пароль</label>
                    <input type="password" id="auth-password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition">
                </div>
                <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 transition-all">Войти в систему</button>
            </form>
        </div>`;
    } 
    
    else if (pageName === "register") {
        contentDiv.innerHTML = `
        <div class="max-w-md mx-auto my-12 bg-slate-900 border border-slate-900 rounded-2xl p-8 shadow-2xl">
            <h2 class="text-2xl font-black mb-1 tracking-tight">Регистрация</h2>
            <p class="text-xs text-slate-400 mb-6">Создайте аккаунт спортсмена для быстрого бронирования</p>
            <form onsubmit="handleRegister(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Email</label>
                    <input type="email" id="reg-email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition">
                </div>
                <div>
                    <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Пароль</label>
                    <input type="password" id="reg-password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition">
                </div>
                <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/10 transition-all">Создать профиль</button>
            </form>
        </div>`;
    } 
    
    else if (pageName === "sportsman") {
        contentDiv.innerHTML = `
        <div class="space-y-10">
            <section>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-xl font-extrabold tracking-tight">Доступные спортивные локации</h2>
                        <p class="text-xs text-slate-400">Выберите интересующее поле для резервирования тайм-слота</p>
                    </div>
                </div>
                <div id="fields-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </section>
            <section class="border-t border-slate-900 pt-8">
                <h2 class="text-xl font-extrabold tracking-tight mb-4">Ваши активные бронирования</h2>
                <div class="overflow-hidden border border-slate-900 rounded-xl bg-slate-900/40">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-mono tracking-widest text-slate-400">
                                <th class="p-4">Площадка</th>
                                <th class="p-4">Тип</th>
                                <th class="p-4">Начало</th>
                                <th class="p-4">Конец</th>
                                <th class="p-4">Статус</th>
                                <th class="p-4 text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody id="my-bookings-table" class="divide-y divide-slate-900 text-sm"></tbody>
                    </table>
                </div>
            </section>
        </div>`;
        loadSportsmanData();
    } 
    
    else if (pageName === "admin") {
        contentDiv.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1 bg-slate-900 border border-slate-900 rounded-2xl p-6 h-fit">
                <h3 class="text-lg font-bold mb-1">Добавить площадку</h3>
                <p class="text-xs text-slate-400 mb-4">Ввод нового спортивного объекта в систему</p>
                <form onsubmit="handleCreateField(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Название</label>
                        <input type="text" id="f-name" required placeholder="Поле №3 (Теннис)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    <div>
                        <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Тип спорта</label>
                        <select id="f-type" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition">
                            <option value="Футбол">Футбол</option>
                            <option value="Теннис">Теннис</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Цена за 1 час (UZS)</label>
                        <input type="number" id="f-price" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition">Зарегистрировать локацию</button>
                </form>
            </div>
            <div class="lg:col-span-2 space-y-4">
                <h2 class="text-xl font-extrabold tracking-tight">Глобальный лог бронирований (Панель Администратора)</h2>
                <div class="overflow-hidden border border-slate-900 rounded-xl bg-slate-900/40">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-mono tracking-widest text-slate-400">
                                <th class="p-4">Пользователь</th>
                                <th class="p-4">Площадка</th>
                                <th class="p-4">Интервал времени</th>
                                <th class="p-4">Статус</th>
                                <th class="p-4 text-right">Управление</th>
                            </tr>
                        </thead>
                        <tbody id="admin-bookings-table" class="divide-y divide-slate-900 text-sm"></tbody>
                    </table>
                </div>
            </div>
        </div>`;
        loadAdminData();
    }
}

// Синхронизация шапки сайта с авторизацией
function updateNavbar() {
    const token = localStorage.getItem("token");
    const guestNav = document.getElementById("guest-nav");
    const userNav = document.getElementById("user-profile-nav");

    if (token) {
        const payload = parseJwt(token);
        guestNav.classList.add("hidden");
        userNav.classList.remove("hidden");
        userNav.classList.add("flex");
        document.getElementById("nav-user-email").innerText = payload.user_id;
        
        const roleBadge = document.getElementById("nav-user-role");
        roleBadge.innerText = payload.role;
        if(payload.role === 'admin') {
            roleBadge.className = "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30";
        } else {
            roleBadge.className = "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        }
    } else {
        guestNav.classList.remove("hidden");
        userNav.classList.add("hidden");
        userNav.classList.remove("flex");
    }
}

// Запросы: Вход и Регистрация
async function handleLogin(e) {
    e.preventDefault();
    try {
        const response = await api.post("/auth/login", {
            email: document.getElementById("auth-email").value,
            password: document.getElementById("auth-password").value
        });
        localStorage.setItem("token", response.data.access_token);
        showToast("Авторизация успешно пройдена");
        checkAuthAndRedirect();
    } catch (err) {
        showToast(err.response?.data?.detail || "Ошибка входа", "error");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    try {
        await api.post("/auth/register", {
            email: document.getElementById("reg-email").value,
            password: document.getElementById("reg-password").value
        });
        showToast("Учетная запись создана. Теперь войдите.");
        showPage("login");
    } catch (err) {
        showToast(err.response?.data?.detail || "Ошибка регистрации", "error");
    }
}

function logout() {
    localStorage.removeItem("token");
    showToast("Вы вышли из системы");
    showPage("login");
}

function checkAuthAndRedirect() {
    const token = localStorage.getItem("token");
    if (!token) {
        showPage("login");
        return;
    }
    const payload = parseJwt(token);
    if (payload && payload.role === "admin") {
        showPage("admin");
    } else {
        showPage("sportsman");
    }
}

// Логика Спортсмена: Загрузка площадок и личных броней
async function loadSportsmanData() {
    try {
        const fieldsRes = await api.get("/fields/");
        const grid = document.getElementById("fields-grid");
        grid.innerHTML = "";
        
        fieldsRes.data.forEach(f => {
            grid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-300">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-mono font-bold tracking-widest uppercase px-2 py-1 rounded bg-slate-950 border border-slate-800 ${f.type === 'Футбол' ? 'text-emerald-400' : 'text-sky-400'}">${f.type}</span>
                        <p class="text-sm font-mono text-indigo-400 font-bold">${parseFloat(f.price_per_hour).toLocaleString()} UZS/час</p>
                    </div>
                    <h3 class="text-lg font-black tracking-tight text-slate-100">${f.name}</h3>
                </div>
                <button onclick="openBookingModal('${f.id}', '${f.name}', '${f.price_per_hour}')" class="mt-6 w-full py-2.5 bg-slate-950 hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-600 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">Забронировать тайм</button>
            </div>`;
        });

        const bookingsRes = await api.get("/bookings/my");
        const table = document.getElementById("my-bookings-table");
        table.innerHTML = "";
        
        bookingsRes.data.forEach(b => {
            const start = new Date(b.start_time).toLocaleString('ru-RU');
            const end = new Date(b.end_time).toLocaleString('ru-RU');
            table.innerHTML += `
            <tr class="hover:bg-slate-900/30 transition">
                <td class="p-4 font-bold text-slate-200">${b.field.name}</td>
                <td class="p-4 font-mono text-xs text-slate-400">${b.field.type}</td>
                <td class="p-4 font-mono text-xs text-slate-300">${start}</td>
                <td class="p-4 font-mono text-xs text-slate-300">${end}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${b.status}</span></td>
                <td class="p-4 text-right">${b.status === 'confirmed' ? `<button onclick="cancelBooking('${b.id}')" class="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 px-2 py-1 rounded-lg transition">Отменить</button>` : '<span class="text-xs text-slate-600 font-mono">-</span>'}</td>
            </tr>`;
        });
    } catch (err) {
        showToast("Ошибка импорта данных", "error");
    }
}

// Модальное управление бронированием
function openBookingModal(id, name, price) {
    selectedFieldId = id;
    document.getElementById("modal-field-name").innerText = name;
    document.getElementById("modal-field-price").innerText = `${parseFloat(price).toLocaleString()} UZS / Час`;
    
    // Установка сегодняшней даты по умолчанию
    document.getElementById("book-date").value = new Date().toISOString().split('T')[0];
    
    const modal = document.getElementById("booking-modal");
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.children[0].classList.remove("scale-95");
}

function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.children[0].classList.add("scale-95");
}

async function executeBooking() {
    const date = document.getElementById("book-date").value;
    const start = document.getElementById("book-start").value;
    const end = document.getElementById("book-end").value;

    if(!start || !end) {
        showToast("Укажите полный временной интервал", "error");
        return;
    }

    try {
        await api.post("/bookings/", {
            field_id: selectedFieldId,
            start_time: `${date}T${start}:00`,
            end_time: `${date}T${end}:00`
        });
        showToast("Поле успешно зарезервировано!");
        closeBookingModal();
        showPage("sportsman");
    } catch (err) {
        showToast(err.response?.data?.detail || "Ошибка овербукинга времени", "error");
    }
}

async function cancelBooking(id) {
    try {
        await api.patch(`/bookings/${id}/cancel`);
        showToast("Бронирование успешно аннулировано");
        checkAuthAndRedirect();
    } catch (err) {
        showToast("Не удалось отменить бронь", "error");
    }
}

// Логика Админа: Загрузка всех броней и создание полей
async function loadAdminData() {
    try {
        const response = await api.get("/bookings/admin/all");
        const table = document.getElementById("admin-bookings-table");
        table.innerHTML = "";

        response.data.forEach(b => {
            const start = new Date(b.start_time).toLocaleString('ru-RU');
            const end = new Date(b.end_time).toLocaleString('ru-RU');
            table.innerHTML += `
            <tr class="hover:bg-slate-900/30 transition">
                <td class="p-4 font-mono text-xs text-indigo-400 font-bold">${b.user_id.substring(0,8)}...</td>
                <td class="p-4 font-bold text-slate-200">${b.field.name} <span class="text-xs text-slate-500 font-normal">(${b.field.type})</span></td>
                <td class="p-4 font-mono text-xs text-slate-300">${start} — ${end}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${b.status}</span></td>
                <td class="p-4 text-right">${b.status === 'confirmed' ? `<button onclick="cancelBooking('${b.id}')" class="text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 px-2 py-1 rounded-lg transition">Снять бронь</button>` : '<span class="text-slate-600">-</span>'}</td>
            </tr>`;
        });
    } catch (err) {
        showToast("Отказ в доступе к логам", "error");
    }
}

async function handleCreateField(e) {
    e.preventDefault();
    try {
        await api.post("/fields/", {
            name: document.getElementById("f-name").value,
            type: document.getElementById("f-type").value,
            price_per_hour: parseFloat(document.getElementById("f-price").value)
        });
        showToast("Новая локация развернута успешно");
        showPage("admin");
    } catch (err) {
        showToast("Ошибка создания площадки", "error");
    }
}

// Запуск системы авторизации при старте
window.addEventListener("DOMContentLoaded", () => {
    checkAuthAndRedirect();
});
