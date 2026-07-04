// ─── ESTADO ───────────────────────────────────────────────────────────────────

let precios = null

// ─── CARGAR DATOS ─────────────────────────────────────────────────────────────

async function cargarPrecios() {
    const response = await fetch('data/precios.json')
    precios = await response.json()
    console.log('Precios cargados:', precios.snapshot_date)
}

// ─── PARÁMETRO AGENTE ─────────────────────────────────────────────────────────

function getAgente() {
    const params = new URLSearchParams(window.location.search)
    return params.get('agente') || 'ivan-lopez-safti'
}

// ─── PROGRESO ─────────────────────────────────────────────────────────────────

function actualizarProgreso(paso) {
    const step1 = document.getElementById('progress-step-1')
    const step2 = document.getElementById('progress-step-2')
    const line  = document.getElementById('progress-line')

    if (paso === 1) {
        step1.className = 'form__progress-step active'
        step2.className = 'form__progress-step'
        line.className  = 'form__progress-line'
    } else {
        step1.className = 'form__progress-step done'
        step2.className = 'form__progress-step active'
        line.className  = 'form__progress-line done'
    }
}

// ─── VALIDACIONES ─────────────────────────────────────────────────────────────

function validarPaso1(f) {
    if (!/^\d{5}$/.test(f.cp))
        return 'El código postal debe tener 5 dígitos.'
    if (isNaN(f.superficie) || f.superficie < 25)
        return 'La superficie mínima es 25 m².'
    if (f.superficie > 500)
        return 'Para superficies mayores de 500 m², contacta directamente.'
    if (!f.clase_finca_urbana_id || isNaN(f.clase_finca_urbana_id))
        return 'Selecciona el tipo de inmueble.'
    if (!f.habitaciones)
        return 'Selecciona el número de habitaciones.'
    if (!f.planta)
        return 'Selecciona la planta.'
    if (document.getElementById('ascensor').value === '')
        return 'Indica si tiene ascensor.'
    if (!f.estado)
        return 'Selecciona el estado de conservación.'
    if (document.getElementById('tiene_terraza').value === '')
        return 'Indica si tiene terraza.'
    if (document.getElementById('tiene_parking').value === '')
        return 'Indica si incluye parking.'
    return null
}

function validarPaso2(nombre, email, telefono, rgpd) {
    if (!nombre)
        return 'Introduce tu nombre.'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return 'Introduce un email válido.'
    if (!telefono || !/^[679]\d{8}$/.test(telefono.replace(/\s/g, '')))
        return 'Introduce un teléfono español válido (9 dígitos, empieza por 6, 7 o 9).'
    if (!rgpd)
        return 'Debes aceptar la política de privacidad para continuar.'
    return null
}

// ─── OBTENER FORMULARIO ───────────────────────────────────────────────────────

function getFormulario() {
    const tipoInmuebleVal = document.getElementById('tipo_inmueble').value
    return {
        cp:                    document.getElementById('cp').value.trim(),
        superficie:            parseFloat(document.getElementById('superficie').value),
        habitaciones:          parseInt(document.getElementById('habitaciones').value),
        banos:                 parseInt(document.getElementById('banos').value),
        planta:                document.getElementById('planta').value,
        ascensor:              document.getElementById('ascensor').value === 'true',
        estado:                document.getElementById('estado').value,
        clase_finca_urbana_id: tipoInmuebleVal ? parseInt(tipoInmuebleVal) : null,
        tieneTerraza:          document.getElementById('tiene_terraza').value === 'true',
        m2Terraza:             parseFloat(document.getElementById('m2_terraza').value) || 0,
        tieneParking:          document.getElementById('tiene_parking').value === 'true',
        tieneTrastero:         document.getElementById('tiene_trastero').value === 'true',
        anio:                  document.getElementById('anio').value || null,
    }
}

// ─── PASO 1 — CALCULAR ────────────────────────────────────────────────────────

function handlePaso1(e) {
    e.preventDefault()

    if (!precios) {
        alert('Los datos aún se están cargando. Inténtalo de nuevo.')
        return
    }

    const formulario = getFormulario()
    const error = validarPaso1(formulario)
    if (error) { alert(error); return }

    const resultado = calcularValoracion(formulario, precios)
    if (resultado.error) { alert(resultado.error); return }

    sessionStorage.setItem('resultado', JSON.stringify(resultado))
    sessionStorage.setItem('formulario', JSON.stringify(formulario))
    sessionStorage.setItem('agente', getAgente())

    document.getElementById('paso-1').style.display = 'none'
    document.getElementById('paso-2').style.display = 'block'
    actualizarProgreso(2)

    document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' })
}

// ─── PASO 2 — CAPTURAR LEAD ───────────────────────────────────────────────────

async function handlePaso2(e) {
    e.preventDefault()

    const nombre         = document.getElementById('nombre').value.trim()
    const email          = document.getElementById('email').value.trim()
    const telefono       = document.getElementById('telefono').value.trim()
    const rgpd           = document.getElementById('rgpd').checked
    const rgpd_marketing = document.getElementById('rgpd_marketing') ? document.getElementById('rgpd_marketing').checked : false

    const error = validarPaso2(nombre, email, telefono, rgpd)
    if (error) { alert(error); return }

    const resultado  = JSON.parse(sessionStorage.getItem('resultado'))
    const formulario = JSON.parse(sessionStorage.getItem('formulario'))
    const agente     = sessionStorage.getItem('agente') || 'ivan-lopez-safti'

    const lead = {
        nombre,
        email,
        telefono,
        cp:                    formulario.cp,
        superficie:            formulario.superficie,
        tipo_inmueble:         formulario.clase_finca_urbana_id === 14 ? 'Piso' : 'Casa',
        estado:                formulario.estado,
        precio_estimado_bajo:  resultado.rangoBajo,
        precio_estimado_alto:  resultado.rangoAlto,
        nivel_dato:            resultado.nivel,
        rgpd:                  rgpd,
        rgpd_marketing:        rgpd_marketing,
        agente,
        created_at:            new Date().toISOString()
    }

    // ── Activar spinner ──
    const btn = e.submitter || document.querySelector('#form-lead button[type="submit"]')
    btn.classList.add('btn--loading')
    btn.disabled = true

    const enviado = await guardarLead(lead)

    if (!enviado) {
        // Supabase falló — guardamos aviso para mostrarlo en resultado.html
        sessionStorage.setItem('supabase_error', 'true')
    }

    // Redirigir siempre — el resultado está en sessionStorage
    window.location.href = 'resultado.html'
}

// ─── TOGGLE TERRAZA ───────────────────────────────────────────────────────────

function toggleTerraza() {
    const tieneTerraza = document.getElementById('tiene_terraza').value === 'true'
    document.getElementById('grupo_m2_terraza').style.display = tieneTerraza ? 'flex' : 'none'
}

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPrecios()

    // Reenviar lead pendiente si hay uno
    await reenviarLeadPendiente()

    document.getElementById('tiene_terraza').addEventListener('change', toggleTerraza)
    document.getElementById('form-calculadora').addEventListener('submit', handlePaso1)
    document.getElementById('form-lead').addEventListener('submit', handlePaso2)

    document.querySelectorAll('.faq__pregunta').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq__item')
            item.classList.toggle('open')
        })
    })

    document.querySelector('a[href="#calculadora"]')?.addEventListener('click', e => {
        e.preventDefault()
        document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' })
    })

    toggleTerraza()
    actualizarProgreso(1)
})