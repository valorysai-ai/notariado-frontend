// ─── CONFIGURACIÓN SUPABASE ───────────────────────────────────────────────────

const SUPABASE_URL = 'https://aoauaprfomyzssovoebf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvYXVhcHJmb215enNzb3ZvZWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODU4NDgsImV4cCI6MjA5Nzg2MTg0OH0.nuYb3PYn5eFEZvSSZyDeoSu0uKpZN9eoCq43BVeZgko'

// ─── GUARDAR LEAD ─────────────────────────────────────────────────────────────

async function guardarLead(lead) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(lead)
        })

        if (!response.ok) {
            console.error('Error guardando lead:', response.status)
            return false
        }

        return true

    } catch (error) {
        console.error('Error de conexión:', error)
        return false
    }
}