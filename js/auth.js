// Authentication Handler
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
    }

    async login(credentials) {
        // Will connect to your friend's API
        console.log('Login attempt:', credentials);
    }

    async register(userData) {
        // Will connect to your friend's API
        console.log('Register attempt:', userData);
    }

    logout() {
        this.isAuthenticated = false;
        this.user = null;
        router.navigate('/');
    }
}

const auth = new AuthManager();
