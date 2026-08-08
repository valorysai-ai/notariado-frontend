// ─── META PIXEL CON CONSENT MODE ─────────────────────────────────────────────

function inicializarPixel() {
    if (window.fbq) return

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    // Consent Mode — revocado por defecto (sin cookies, sin identificadores)
    fbq('consent', 'revoke')
    fbq('init', '506793339161273')
    fbq('track', 'PageView')
}

// ─── BANNER DE COOKIES ────────────────────────────────────────────────────────

function mostrarBannerCookies() {
    const preferencia = localStorage.getItem('cookies_aceptadas')
    const banner = document.getElementById('cookies-banner')

    // Inicializar pixel siempre — con consent revocado
    inicializarPixel()

    if (!preferencia) {
        if (banner) banner.classList.add('visible')
        return
    }

    // Si ya aceptó antes — grant consent
    if (preferencia === 'all') {
        fbq('consent', 'grant')
    }
}

function aceptarCookies() {
    localStorage.setItem('cookies_aceptadas', 'all')
    const banner = document.getElementById('cookies-banner')
    if (banner) banner.classList.remove('visible')
    fbq('consent', 'grant')
    fbq('track', 'PageView')
}

function rechazarCookies() {
    localStorage.setItem('cookies_aceptadas', 'necessary')
    const banner = document.getElementById('cookies-banner')
    if (banner) banner.classList.remove('visible')
    // consent ya está revocado — no hacemos nada más
}

document.addEventListener('DOMContentLoaded', mostrarBannerCookies)