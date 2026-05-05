// src/services/api.js
// Dev:  llama a proxy local en localhost:3001
// Prod: llama a /api/proxy (Vercel serverless)
const PROXY = import.meta.env.DEV
  ? 'http://localhost:3001'
  : '/api/proxy'

async function call(data) {
  const res  = await fetch(PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json
}

let _cache = null
async function getConfig() {
  if (_cache) return _cache
  _cache = await call({ action: 'config' })
  return _cache
}

export const getNombres     = async () => { const c = await getConfig(); return { p1: c.p1, p2: c.p2 } }
export const getGastosFijos = async () => { const c = await getConfig(); return { items: c.gastosFijos } }
export const getMetasAhorro = async () => { const c = await getConfig(); return { metas: c.metas } }
export const getMesActivo   = async () => { const c = await getConfig(); return { mes: c.mesActivo } }
export const getResumen     = (mes)    => call({ action: 'resumen', mes })
export const getHistorial   = (mes, limite=20) => call({ action: 'historial', mes, limite })
export const guardarGasto   = (d)      => call({ action: 'gasto',   ...d })
export const guardarIngreso = (d)      => call({ action: 'ingreso', ...d })
export const guardarAhorro  = (d)      => call({ action: 'ahorro',  ...d })