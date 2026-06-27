// ─── BANNER DE COOKIES ────────────────────────────────────────────────────────

function mostrarBannerCookies() {
    const aceptadas = localStorage.getItem('cookies_aceptadas')
    if (!aceptadas) {
        document.getElementById('cookies-banner').classList.add('visible')
    }
}

function aceptarCookies() {
    localStorage.setItem('cookies_aceptadas', 'all')
    document.getElementById('cookies-banner').classList.remove('visible')
}

function rechazarCookies() {
    localStorage.setItem('cookies_aceptadas', 'necessary')
    document.getElementById('cookies-banner').classList.remove('visible')
}

document.addEventListener('DOMContentLoaded', mostrarBannerCookies)