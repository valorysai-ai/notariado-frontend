// ─── META PIXEL ───────────────────────────────────────────────────────────────

function cargarMetaPixel() {
    if (window.fbq) return // ya cargado

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '506793339161273');
    fbq('track', 'PageView');
}

// ─── BANNER DE COOKIES ────────────────────────────────────────────────────────

function mostrarBannerCookies() {
    const preferencia = localStorage.getItem('cookies_aceptadas')
    const banner = document.getElementById('cookies-banner')

    if (!preferencia) {
        if (banner) banner.classList.add('visible')
        return
    }

    if (preferencia === 'all') {
        cargarMetaPixel()
    }
}

function aceptarCookies() {
    localStorage.setItem('cookies_aceptadas', 'all')
    const banner = document.getElementById('cookies-banner')
    if (banner) banner.classList.remove('visible')
    cargarMetaPixel()
}

function rechazarCookies() {
    localStorage.setItem('cookies_aceptadas', 'necessary')
    const banner = document.getElementById('cookies-banner')
    if (banner) banner.classList.remove('visible')
}

document.addEventListener('DOMContentLoaded', mostrarBannerCookies)