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

    // Menos preciso si usamos fallback
    if (resultado.nivel === 'municipio') precision -= 5
    if (resultado.nivel === 'provincia') precision -= 15

    // Más preciso si tenemos más datos
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

    // Precio central y por m²
    document.getElementById('precio-central').textContent = formatEuros(resultado.valorCentral)
    const precioM2 = Math.round(resultado.valorCentral / formulario.superficie)
    document.getElementById('precio-m2').textContent = formatEuros(precioM2) + '/m²'

    // Detalle
    const tipoInmueble = formulario.clase_finca_urbana_id === 14 ? 'Piso' : 'Casa'
    document.getElementById('resultado-detalle').textContent =
        `${formulario.cp} · ${formulario.superficie} m² · ${formulario.habitaciones} hab · ${tipoInmueble}`

    // Badge precisión
    const precision = calcularPrecision(resultado, formulario)
    document.getElementById('badge-precision').textContent = `⭐ Precisión ~${precision}%`

    // Badge fecha
    const fecha = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    document.getElementById('badge-fecha').textContent = `📅 Actualizado ${fecha}`

    // Aviso fallback
    if (resultado.aviso) {
        const avisoEl = document.getElementById('resultado-aviso')
        avisoEl.textContent = resultado.aviso
        avisoEl.style.display = 'block'
    }

    // WhatsApp dinámico
    const agente = sessionStorage.getItem('agente') || 'ivan-lopez-safti'
    const mensaje = encodeURIComponent(
        `Hola Iván, acabo de obtener una estimación de ${formatEuros(resultado.rangoBajo)} - ${formatEuros(resultado.rangoAlto)} para mi vivienda en ${formulario.cp}. Me gustaría una valoración profesional.`
    )
    document.getElementById('btn-whatsapp').href = `https://wa.me/34600000000?text=${mensaje}`
}

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    mostrarResultado()
})