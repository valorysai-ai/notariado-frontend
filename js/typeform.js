// ─── ESTADO ───────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 10
let currentStep = 1
let map = null
let mapMarker = null

const datos = {
    cp: null,
    tipo_inmueble: null,
    superficie: null,
    habitaciones: null,
    banos: null,
    planta: null,
    ascensor: null,
    estado: null,
    tieneTerraza: null,
    m2Terraza: null,
    tieneParking: null,
    tieneTrastero: null,
}

let precios = null

// ─── CARGAR DATOS ─────────────────────────────────────────────────────────────

async function cargarPrecios() {
    const response = await fetch('data/precios.json')
    precios = await response.json()
}

// ─── PROGRESO ─────────────────────────────────────────────────────────────────

function actualizarProgreso(step) {
    const pct = Math.round((step / TOTAL_STEPS) * 100)
    document.getElementById('progress-fill').style.width = `${pct}%`
    document.getElementById('progress-text').textContent = `${step} de ${TOTAL_STEPS}`
}

// ─── NAVEGACIÓN ───────────────────────────────────────────────────────────────

function showStep(from, to, direction) {
    const fromEl = document.getElementById(`step-${from}`)
    const toEl   = document.getElementById(`step-${to}`)

    toEl.style.transition = 'none'
    toEl.style.transform  = direction === 'back' ? 'translateX(-60px)' : 'translateX(60px)'
    toEl.style.opacity    = '0'
    toEl.style.position   = 'absolute'
    toEl.classList.remove('active', 'exit-left')

    toEl.offsetHeight

    fromEl.style.transition = ''
    fromEl.style.transform  = direction === 'back' ? 'translateX(60px)' : 'translateX(-60px)'
    fromEl.style.opacity    = '0'

    toEl.style.transition = ''
    toEl.style.transform  = 'translateX(0)'
    toEl.style.opacity    = '1'
    toEl.style.position   = 'relative'

    setTimeout(() => {
        fromEl.classList.remove('active')
        fromEl.style.cssText = ''
        fromEl.style.position = 'absolute'

        toEl.classList.add('active')
        toEl.style.cssText = ''

        actualizarProgreso(to)
        currentStep = to

        const input = toEl.querySelector('.tf-input')
        if (input) setTimeout(() => input.focus(), 100)

        restaurarSeleccion(to)

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 600)
}

function nextStep(from) {
    if (!validarStep(from)) return
    showStep(from, from + 1, 'forward')
}

function prevStep(from) {
    if (from <= 1) return
    showStep(from, from - 1, 'back')
}

// ─── VALIDACIONES ─────────────────────────────────────────────────────────────

function validarStep(step) {
    switch(step) {
        case 1:
            if (!datos.cp || !/^\d{5}$/.test(datos.cp)) {
                shakeInput('tf-cp', 'Introduce un código postal válido (5 dígitos)')
                return false
            }
            return true
        case 2:
            if (!datos.tipo_inmueble) {
                mostrarError('Selecciona el tipo de inmueble')
                return false
            }
            return true
        case 3:
            const sup = parseFloat(document.getElementById('tf-superficie').value)
            if (isNaN(sup) || sup < 25) {
                shakeInput('tf-superficie', 'La superficie mínima es 25 m²')
                return false
            }
            if (sup > 500) {
                shakeInput('tf-superficie', 'Para superficies mayores de 500 m², contacta directamente')
                return false
            }
            datos.superficie = sup
            return true
        case 4:
            if (!datos.habitaciones) {
                mostrarError('Selecciona el número de habitaciones')
                return false
            }
            return true
        case 5:
            if (!datos.banos) {
                mostrarError('Selecciona el número de baños')
                return false
            }
            return true
        case 6:
            if (!datos.planta) {
                mostrarError('Selecciona la planta y si tiene ascensor')
                return false
            }
            return true
        case 7:
            if (!datos.estado) {
                mostrarError('Selecciona el estado de conservación')
                return false
            }
            return true
        case 8:
            if (datos.tieneTerraza === null) {
                mostrarError('Selecciona la opción de terraza')
                return false
            }
            return true
        case 9:
            if (datos.tieneParking === null) {
                mostrarError('Selecciona los extras')
                return false
            }
            return true
        default:
            return true
    }
}

// ─── ERRORES Y FEEDBACK ───────────────────────────────────────────────────────

function shakeInput(id, mensaje) {
    const el = document.getElementById(id)
    el.style.borderBottomColor = '#ef4444'
    el.classList.add('shake')
    setTimeout(() => {
        el.classList.remove('shake')
        el.style.borderBottomColor = ''
    }, 600)
    mostrarError(mensaje)
}

function mostrarError(mensaje) {
    const prev = document.querySelector('.tf-error')
    if (prev) prev.remove()

    const err = document.createElement('p')
    err.className = 'tf-error'
    err.textContent = '⚠️ ' + mensaje
    err.style.cssText = 'color:#ef4444;font-size:14px;margin-top:8px;animation:fadeIn 0.2s ease'

    const activeStep = document.querySelector('.tf-step.active .tf-nav')
    if (activeStep) activeStep.before(err)

    setTimeout(() => err.remove(), 3000)
}

// ─── SELECCIÓN DE OPCIONES ────────────────────────────────────────────────────

function selectOption(el, campo, step) {
    el.closest('.tf-options').querySelectorAll('.tf-option').forEach(o => {
        o.classList.remove('selected')
    })
    el.classList.add('selected')

    const valor = el.dataset.value

    switch(campo) {
        case 'tipo_inmueble':
            datos.tipo_inmueble = parseInt(valor)
            break
        case 'habitaciones':
            datos.habitaciones = parseInt(valor)
            break
        case 'banos':
            datos.banos = parseInt(valor)
            break
        case 'planta_ascensor':
            const [planta, ascensor] = valor.split('|')
            datos.planta   = planta
            datos.ascensor = ascensor === 'true'
            break
        case 'estado':
            datos.estado = valor
            break
        case 'terraza':
            const [tieneTerraza, m2] = valor.split('|')
            datos.tieneTerraza = tieneTerraza === 'true'
            datos.m2Terraza    = parseFloat(m2)
            break
        case 'extras':
            const [parking, trastero] = valor.split('|')
            datos.tieneParking  = parking === 'true'
            datos.tieneTrastero = trastero === 'true'
            break
    }

    if (step < 10) {
        setTimeout(() => nextStep(step), 300)
    }
}

// ─── RESTAURAR SELECCIÓN AL VOLVER ATRÁS ──────────────────────────────────────

function restaurarSeleccion(step) {
    const stepEl = document.getElementById(`step-${step}`)

    switch(step) {
        case 1:
            if (datos.cp) {
                document.getElementById('tf-cp').value = datos.cp
                buscarCP(datos.cp)
            }
            break
        case 2:
            if (datos.tipo_inmueble) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.tipo_inmueble) {
                        o.classList.add('selected')
                    }
                })
            }
            break
        case 3:
            if (datos.superficie) {
                document.getElementById('tf-superficie').value = datos.superficie
            }
            break
        case 4:
            if (datos.habitaciones) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.habitaciones) {
                        o.classList.add('selected')
                    }
                })
            }
            break
        case 5:
            if (datos.banos) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.banos) {
                        o.classList.add('selected')
                    }
                })
            }
            break
        case 6:
            if (datos.planta) {
                const val = `${datos.planta}|${datos.ascensor}`
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === val) o.classList.add('selected')
                })
            }
            break
        case 7:
            if (datos.estado) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === datos.estado) o.classList.add('selected')
                })
            }
            break
        case 8:
            if (datos.tieneTerraza !== null) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    const [tiene, m2] = o.dataset.value.split('|')
                    if (tiene === String(datos.tieneTerraza) && parseFloat(m2) === datos.m2Terraza) {
                        o.classList.add('selected')
                    }
                })
            }
            break
        case 9:
            if (datos.tieneParking !== null) {
                const val = `${datos.tieneParking}|${datos.tieneTrastero}`
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === val) o.classList.add('selected')
                })
            }
            break
    }
}

// ─── MAPA LEAFLET ─────────────────────────────────────────────────────────────

async function buscarCP(cp) {
    if (cp.length !== 5) return

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=ES&format=json&limit=1`
        )
        const data = await res.json()

        if (data.length === 0) {
            document.getElementById('tf-map-label').textContent = ''
            return
        }

        const { lat, lon, display_name } = data[0]
        const ciudad = display_name.split(',')[0]

        document.getElementById('tf-map-label').textContent = `📍 ${ciudad}`
        document.getElementById('tf-map').classList.add('visible')

        if (!map) {
            map = L.map('tf-map', { zoomControl: false, attributionControl: false })
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        }

        map.setView([lat, lon], 13)

        if (mapMarker) mapMarker.remove()
        mapMarker = L.circleMarker([lat, lon], {
            radius: 10,
            fillColor: '#10b981',
            color: '#059669',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)

        datos.cp = cp

    } catch (e) {
        console.error('Error buscando CP:', e)
    }
}

// ─── VERIFICAR TELÉFONO ───────────────────────────────────────────────────────

async function verificarTelefono(telefono, prefijo) {
    try {
        console.log('SUPABASE_URL:', SUPABASE_URL)
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/clever-function`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ telefono, prefijo })
            }
        )
        const data = await response.json()
        console.log('Twilio response:', data)
        return data.valid
    } catch (e) {
        console.warn('Error verificando teléfono:', e)
        return true
    }
}

// ─── SUBMIT LEAD ──────────────────────────────────────────────────────────────

async function submitLead() {
    // Anti-bot: verificar honeypot PRIMERO
    if (document.getElementById('tf-honeypot').value) {
        window.location.href = 'resultado.html'
        return
    }

    const nombre         = document.getElementById('tf-nombre').value.trim()
    const email          = document.getElementById('tf-email').value.trim()
    const telefono       = document.getElementById('tf-telefono').value.trim()
    const prefijo        = document.getElementById('tf-prefijo').value
    const rgpd           = document.getElementById('tf-rgpd').checked
    const rgpd_marketing = document.getElementById('tf-rgpd-marketing').checked

    if (!nombre) { mostrarError('Introduce tu nombre'); return }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError('Introduce un email válido'); return
    }
    if (!telefono) {
        mostrarError('Introduce tu número de teléfono'); return
    }
    if (!rgpd) { mostrarError('Debes aceptar la política de privacidad'); return }

    // Calcular valoración
    const formulario = {
        cp:                    datos.cp,
        superficie:            datos.superficie,
        habitaciones:          datos.habitaciones,
        banos:                 datos.banos,
        planta:                datos.planta,
        ascensor:              datos.ascensor,
        estado:                datos.estado,
        clase_finca_urbana_id: datos.tipo_inmueble,
        tieneTerraza:          datos.tieneTerraza,
        m2Terraza:             datos.m2Terraza,
        tieneParking:          datos.tieneParking,
        tieneTrastero:         datos.tieneTrastero,
        anio:                  null,
    }

    const resultado = calcularValoracion(formulario, precios)
    if (resultado.error) { mostrarError(resultado.error); return }

    sessionStorage.setItem('resultado',  JSON.stringify(resultado))
    sessionStorage.setItem('formulario', JSON.stringify(formulario))

    // Spinner
    const btn = document.getElementById('btn-step-10')
    btn.classList.add('tf-btn--loading')
    btn.disabled = true

    // Verificar teléfono con Twilio
    const telefonoValido = await verificarTelefono(telefono, prefijo)
    if (!telefonoValido) {
        btn.classList.remove('tf-btn--loading')
        btn.disabled = false
        mostrarError('El número de teléfono no es válido. Por favor compruébalo.')
        return
    }

    const lead = {
        nombre,
        email,
        telefono:              `${prefijo}${telefono.replace(/\s/g, '')}`,
        cp:                    datos.cp,
        superficie:            datos.superficie,
        tipo_inmueble:         datos.tipo_inmueble === 14 ? 'Piso' : 'Casa',
        estado:                datos.estado,
        precio_estimado_bajo:  resultado.rangoBajo,
        precio_estimado_alto:  resultado.rangoAlto,
        nivel_dato:            resultado.nivel,
        rgpd:                  true,
        rgpd_marketing,
        agente:                new URLSearchParams(window.location.search).get('agente') || 'ivan-lopez-safti',
        created_at:            new Date().toISOString()
    }

    const enviado = await guardarLead(lead)
    if (!enviado) sessionStorage.setItem('supabase_error', 'true')

    // Meta Pixel — evento Lead
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Valoracion Inmobiliaria',
            content_category: datos.tipo_inmueble === 14 ? 'Piso' : 'Casa',
            value: resultado.valorCentral,
            currency: 'EUR'
        })
    }

    window.location.href = 'resultado.html'
}

// ─── TECLADO ──────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const activeStep = document.querySelector('.tf-step.active')
        if (!activeStep) return
        const step = parseInt(activeStep.id.replace('step-', ''))
        if (step < 10) nextStep(step)
    }
})

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPrecios()
    await reenviarLeadPendiente()

    document.getElementById('step-1').classList.add('active')
    actualizarProgreso(1)

    document.getElementById('tf-cp').addEventListener('input', e => {
        const cp = e.target.value.trim()
        datos.cp = cp.length === 5 ? cp : null
        if (cp.length === 5) buscarCP(cp)
    })
})