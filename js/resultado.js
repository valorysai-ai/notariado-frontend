// ─── FORMATEAR NÚMEROS ────────────────────────────────────────────────────────

function formatEuros(cantidad) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(cantidad)
}

// ─── CALCULAR PRECISIÓN ───────────────────────────────────────────────────────

function calcularPrecision(resultado, formulario) {
    let precision = 90

    if (resultado.nivel === 'municipio') precision -= 5
    if (resultado.nivel === 'provincia') precision -= 15

    if (formulario.anio) precision += 2
    if (formulario.tieneTerraza !== '') precision += 1
    if (formulario.tieneParking !== '') precision += 1

    return Math.min(95, Math.max(60, precision))
}

// ─── MOSTRAR RESULTADO ────────────────────────────────────────────────────────

function mostrarResultado() {
    const resultadoRaw  = sessionStorage.getItem('resultado')
    const formularioRaw = sessionStorage.getItem('formulario')

    if (!resultadoRaw || !formularioRaw) {
        window.location.href = 'index.html'
        return
    }

    const resultado  = JSON.parse(resultadoRaw)
    const formulario = JSON.parse(formularioRaw)

    // Rango
    document.getElementById('rango-bajo').textContent = formatEuros(resultado.rangoBajo)
    document.getElementById('rango-alto').textContent = formatEuros(resultado.rangoAlto)

    // Detalle
    const tipoInmueble = formulario.clase_finca_urbana_id === 14 ? 'Piso' : 'Casa'
    document.getElementById('resultado-detalle').textContent =
        `${formulario.cp} · ${formulario.superficie} m² · ${formulario.habitaciones} hab · ${tipoInmueble}`

    // Badge precisión
    const precision = calcularPrecision(resultado, formulario)
    document.getElementById('badge-precision').textContent = `⭐ Precisión ~${precision}%`

    // Badge fecha
    const fecha = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    const badgeFecha = document.getElementById('badge-fecha')
    badgeFecha.textContent = `📅 Actualizado ${fecha}`
    badgeFecha.style.display = 'inline-flex'

    // Aviso fallback
    if (resultado.aviso) {
        const avisoEl = document.getElementById('resultado-aviso')
        avisoEl.textContent = resultado.aviso
        avisoEl.style.display = 'block'
    }

    // Aviso si Supabase falló
    if (sessionStorage.getItem('supabase_error') === 'true') {
        sessionStorage.removeItem('supabase_error')
        const avisoEl = document.getElementById('resultado-aviso')
        avisoEl.textContent = '⚠️ No hemos podido registrar tus datos en este momento. Tu estimación es válida — intentaremos guardarla automáticamente en tu próxima visita.'
        avisoEl.style.display = 'block'
    }

    // Meta Pixel — evento ViewContent
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_name: 'Resultado Valoracion',
            value: resultado.valorCentral,
            currency: 'EUR'
        })
    }
}

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    mostrarResultado()
})