// ─── TABLAS DE MULTIPLICADORES ────────────────────────────────────────────────

const MULTIPLICADORES_ESTADO = {
    'a_reformar': 0.80,
    'bueno':      1.00,
    'muy_bueno':  1.10,
    'a_estrenar': 1.18,
}

const MULTIPLICADORES_PLANTA = {
    'bajo':  { true: 0.93, false: 0.93 },
    '1-2':   { true: 1.00, false: 0.95 },
    '3-5':   { true: 1.03, false: 0.88 },
    '6+':    { true: 1.06, false: 0.82 },
    'atico': { true: 1.10, false: 0.90 },
}

const MULTIPLICADORES_ANIO = {
    'pre1960':   0.95,
    '1960_79':   0.97,
    '1980_99':   1.00,
    '2000_2015': 1.03,
    'post2015':  1.08,
}

// ─── FUNCIONES AUXILIARES ─────────────────────────────────────────────────────

function getMultiplicadorTerraza(tieneTerraza, m2Terraza) {
    if (!tieneTerraza || m2Terraza <= 0) return 1.00
    if (m2Terraza < 5)  return 1.02
    if (m2Terraza <= 15) return 1.05
    if (m2Terraza <= 30) return 1.08
    return 1.12
}

function getMultiplicadorDistribucion(superficieM2, habitaciones) {
    const hab = Math.max(habitaciones, 1)
    const m2PorHab = superficieM2 / hab
    if (m2PorHab < 22) return 0.94
    if (m2PorHab > 35) return 1.03
    return 1.00
}

function getExtraParking(cp) {
    const cpNum = parseInt(cp.slice(2, 5))
    if (cp.startsWith('08') && cpNum >= 1 && cpNum <= 42) return 50000
    if (cp.startsWith('28') && cpNum >= 1 && cpNum <= 50) return 50000
    if (cp.startsWith('08') || cp.startsWith('28')) return 30000
    return 15000
}

function getPrecioM2(precios, cp, claseId) {
    // Nivel 1 — código postal
    if (precios.codigo_postal[cp]) {
        const precio = precios.codigo_postal[cp][claseId] 
            || precios.codigo_postal[cp]['99']
        if (precio) return { precio, nivel: 'codigo_postal', aviso: null }
    }

    // Nivel 2 — municipio (usando los 3 primeros dígitos del CP como aproximación)
    const cpProv = cp.slice(0, 2)
    const munMatch = Object.entries(precios.municipio).find(([cod]) => 
        cod.startsWith(cpProv)
    )
    if (munMatch) {
        const precio = munMatch[1][claseId] || munMatch[1]['99']
        if (precio) return { 
            precio, 
            nivel: 'municipio', 
            aviso: 'Estimación calculada con datos municipales.' 
        }
    }

    // Nivel 3 — provincia
    const prov = precios.provincia[cpProv]
    if (prov) {
        const precio = prov[claseId] || prov['99']
        if (precio) return { 
            precio, 
            nivel: 'provincia', 
            aviso: 'Estimación calculada con datos provinciales. Para mayor precisión, pide valoración profesional.' 
        }
    }

    return null
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

function calcularValoracion(formulario, precios) {
    // Validaciones
    if (formulario.superficie < 25) {
        return { error: 'Superficie demasiado pequeña para una valoración fiable. Contacta directamente.' }
    }
    if (formulario.superficie > 500) {
        return { error: 'Para inmuebles tan grandes, contacta directamente para una valoración personalizada.' }
    }

    // PASO 1 — Precio €/m² del CP
    const claseId = formulario.clase_finca_urbana_id.toString()
    const precioData = getPrecioM2(precios, formulario.cp, claseId)
    if (!precioData) {
        return { error: 'No encontramos datos para este código postal. Contacta directamente.' }
    }

    // PASO 2 — Valor base
    const valorBase = precioData.precio * formulario.superficie

    // PASO 3 — Multiplicadores
    const mEstado   = MULTIPLICADORES_ESTADO[formulario.estado] || 1.00
    const mPlanta   = MULTIPLICADORES_PLANTA[formulario.planta]?.[formulario.ascensor] || 1.00
    const mTerraza  = getMultiplicadorTerraza(formulario.tieneTerraza, formulario.m2Terraza || 0)
    const mDistrib  = getMultiplicadorDistribucion(formulario.superficie, formulario.habitaciones)
    const mAnio     = MULTIPLICADORES_ANIO[formulario.anio] || 1.00

    let multiplicadorTotal = mEstado * mPlanta * mTerraza * mDistrib * mAnio
    multiplicadorTotal = Math.max(0.60, Math.min(1.35, multiplicadorTotal))

    // PASO 4 — Valor ajustado
    const valorAjustado = valorBase * multiplicadorTotal

    // PASO 5 — Extras absolutos
    let extras = 0
    if (formulario.tieneParking) extras += getExtraParking(formulario.cp)
    if (formulario.tieneTrastero) extras += 8000

    const valorFinal = valorAjustado + extras

    // PASO 6 — Amplitud del rango
    let amplitud
    if (valorFinal < 150000)      amplitud = valorFinal * 0.10
    else if (valorFinal < 400000) amplitud = valorFinal * 0.08
    else                          amplitud = valorFinal * 0.06

    amplitud = Math.max(8000, Math.min(amplitud, 45000))

    // PASO 7 — Rango redondeado a múltiplos de 5.000
    const rangoBajo = Math.floor((valorFinal - amplitud) / 5000) * 5000
    const rangoAlto = Math.ceil((valorFinal + amplitud) / 5000) * 5000

    return {
        rangoBajo,
        rangoAlto,
        valorCentral: Math.round(valorFinal), // solo uso interno
        nivel: precioData.nivel,
        aviso: precioData.aviso,
        error: null
    }
}