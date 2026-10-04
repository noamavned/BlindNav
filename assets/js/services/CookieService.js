export default class CookieManager {
    constructor() {
        this.cookies = {};
    }

    setCookie(name, value, role, hours) {
    const expires = new Date(Date.now() + hours * 36e5).toUTCString();    
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
    document.cookie = name + '_role=' + encodeURIComponent(role) + '; expires=' + expires + '; path=/';
    }
    
    getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r
        }, '');
    }
}