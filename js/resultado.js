// ─── FORMATEAR NÚMERO ─────────────────────────────────────────────────────────

function formatEuros(cantidad) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(cantidad)
}

// ─── MOSTRAR RESULTADO ────────────────────────────────────────────────────────

function mostrarResultado() {
    const resultadoRaw = sessionStorage.getItem('resultado')
    const formularioRaw = sessionStorage.getItem('formulario')

    // Si no hay datos redirigir al formulario
    if (!resultadoRaw || !formularioRaw) {
        window.location.href = 'index.html'
        return
    }

    const resultado = JSON.parse(resultadoRaw)
    const formulario = JSON.parse(formularioRaw)

    // Mostrar rango
    document.getElementById('rango-bajo').textContent = formatEuros(resultado.rangoBajo)
    document.getElementById('rango-alto').textContent = formatEuros(resultado.rangoAlto)

    // Mostrar detalle del inmueble
    const tipoInmueble = formulario.clase_finca_urbana_id === 14 ? 'Piso' : 'Casa'
    document.getElementById('resultado-detalle').textContent =
        `${formulario.cp} · ${formulario.superficie} m² · ${formulario.habitaciones} hab · ${tipoInmueble}`

    // Mostrar aviso si hay fallback
    if (resultado.aviso) {
        const avisoEl = document.getElementById('resultado-aviso')
        avisoEl.textContent = resultado.aviso
        avisoEl.style.display = 'block'
    }
}

// ─── MANEJO DEL LEAD ──────────────────────────────────────────────────────────

async function enviarLead(e) {
    e.preventDefault()

    const resultado = JSON.parse(sessionStorage.getItem('resultado'))
    const formulario = JSON.parse(sessionStorage.getItem('formulario'))

    const lead = {
        nombre:                document.getElementById('nombre').value.trim(),
        email:                 document.getElementById('email').value.trim(),
        telefono:              document.getElementById('telefono').value.trim(),
        cp:                    formulario.cp,
        superficie:            formulario.superficie,
        tipo_inmueble:         formulario.clase_finca_urbana_id === 14 ? 'Piso' : 'Casa',
        estado:                formulario.estado,
        precio_estimado_bajo:  resultado.rangoBajo,
        precio_estimado_alto:  resultado.rangoAlto,
        nivel_dato:            resultado.nivel,
        created_at:            new Date().toISOString()
    }

    const enviado = await guardarLead(lead)

    if (enviado) {
        document.getElementById('form-lead').style.display = 'none'
        document.getElementById('lead-enviado').style.display = 'block'
    } else {
        alert('Ha habido un error. Por favor inténtalo de nuevo.')
    }
}

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    mostrarResultado()
    document.getElementById('form-lead').addEventListener('submit', enviarLead)
})