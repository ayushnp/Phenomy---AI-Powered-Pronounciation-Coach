// Initialize Navigo Router
const router = new Navigo('/');

// Route Definitions
router.on('/', () => showHomePage());
router.on('/login', () => showLoginPage());
router.on('/register', () => showRegisterPage());
router.on('/dashboard', () => showDashboard());

// Route Handlers
function showHomePage() {
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }
}

function showLoginPage() {
    if (window.location.pathname !== '/pages/login.html') {
        window.location.href = '/pages/login.html';
    }
}

function showRegisterPage() {
    if (window.location.pathname !== '/pages/register.html') {
        window.location.href = '/pages/register.html';
    }
}

function showDashboard() {
    if (window.location.pathname !== '/pages/dashboard.html') {
        window.location.href = '/pages/dashboard.html';
    }
}

// Initialize Router
router.resolve();
