// api/ahorro.js — POST /api/ahorro
const { leer, escribir, rc, FILAS, cors } = require('./_sheets')

const METAS_ORDEN = [
  'Fondo de emergencia hogar','Vacaciones / Viaje juntos',
  'Fondo arriendo / deuda','Inversión conjunta',
  'Meta hogar 1','Meta hogar 2','Meta hogar 3','Meta hogar 4',
]

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const { mes, nombreMeta, aporte, pctP1 = 0.5, metaTotal = 0 } = req.body

    const fila = await _filaMeta(mes, nombreMeta)
    if (!fila) return res.status(400).json({ error: `Meta no encontrada: ${nombreMeta}` })

    await escribir(mes, rc(fila, 4), [[aporte, pctP1]])
    if (metaTotal) await escribir(mes, rc(fila, 8), [[metaTotal]])

    res.json({ ok: true, fila })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function _filaMeta(mes, nombre) {
  const { SAV_START, SAV_END } = FILAS
  const datos = await leer(mes, rc(SAV_START, 2), rc(SAV_END, 2))
  for (let i = 0; i < datos.length; i++) {
    if (datos[i]?.[0] === nombre) return SAV_START + i
  }
  const idx = METAS_ORDEN.indexOf(nombre)
  return idx >= 0 ? SAV_START + idx : null
}
