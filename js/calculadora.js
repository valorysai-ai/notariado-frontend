// ─── ESTADO ───────────────────────────────────────────────────────────────────

let precios = null
let resultado = null

// ─── CARGAR DATOS ─────────────────────────────────────────────────────────────

async function cargarPrecios() {
    const response = await fetch('data/precios.json')
    precios = await response.json()
    console.log('Precios cargados:', precios.snapshot_date)
}

// ─── MANEJO DEL FORMULARIO ────────────────────────────────────────────────────

function getFormulario() {
    return {
        cp:                   document.getElementById('cp').value.trim(),
        superficie:           parseFloat(document.getElementById('superficie').value),
        habitaciones:         parseInt(document.getElementById('habitaciones').value),
        banos:                parseInt(document.getElementById('banos').value),
        planta:               document.getElementById('planta').value,
        ascensor:             document.getElementById('ascensor').value === 'true',
        estado:               document.getElementById('estado').value,
        clase_finca_urbana_id: parseInt(document.getElementById('tipo_inmueble').value),
        tieneTerraza:         document.getElementById('tiene_terraza').value === 'true',
        m2Terraza:            parseFloat(document.getElementById('m2_terraza').value) || 0,
        tieneParking:         document.getElementById('tiene_parking').value === 'true',
        tieneTrastero:        document.getElementById('tiene_trastero').value === 'true',
        anio:                 document.getElementById('anio').value || null,
    }
}

function validarFormulario(f) {
    if (!/^\d{5}$/.test(f.cp)) return 'El código postal debe tener 5 dígitos.'
    if (isNaN(f.superficie) || f.superficie <= 0) return 'Introduce una superficie válida.'
    if (isNaN(f.habitaciones) || f.habitaciones <= 0) return 'Selecciona el número de habitaciones.'
    return null
}

// ─── MOSTRAR / OCULTAR CAMPO TERRAZA ─────────────────────────────────────────

function toggleTerraza() {
    const tieneTerraza = document.getElementById('tiene_terraza').value === 'true'
    document.getElementById('grupo_m2_terraza').style.display = tieneTerraza ? 'block' : 'none'
}

// ─── CALCULAR ─────────────────────────────────────────────────────────────────

async function calcular(e) {
    e.preventDefault()

    if (!precios) {
        alert('Los datos aún se están cargando. Inténtalo de nuevo.')
        return
    }

    const formulario = getFormulario()
    const error = validarFormulario(formulario)
    if (error) {
        alert(error)
        return
    }

    resultado = calcularValoracion(formulario, precios)

    if (resultado.error) {
        alert(resultado.error)
        return
    }

    // Guardar en sessionStorage para resultado.html
    sessionStorage.setItem('resultado', JSON.stringify(resultado))
    sessionStorage.setItem('formulario', JSON.stringify(formulario))

    // Redirigir a página de resultado
    window.location.href = 'resultado.html'
}

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPrecios()

    document.getElementById('tiene_terraza').addEventListener('change', toggleTerraza)
    document.getElementById('form-calculadora').addEventListener('submit', calcular)

    toggleTerraza()
})