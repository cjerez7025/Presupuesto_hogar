// api/ingresos.js — POST /api/ingresos
const { leer, escribir, rc, FILAS, cors } = require('./_sheets')

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const { mes, tipo, descripcion = '', esperado = 0,
            recibido, fecha, quien, recurrente = false } = req.body

    const fila = await _filaLibre(mes, quien)
    if (!fila) return res.status(400).json({
      error: `Todas las filas de ingreso para ${quien} ya tienen datos.`
    })

    await escribir(mes, rc(fila, 3), [[
      esperado, recibido, '',
      fecha, descripcion || tipo,
      recurrente ? 'RECURRENTE' : '',
    ]])

    res.json({ ok: true, fila })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function _filaLibre(mes, quien) {
  const filas = quien === 'p1' ? FILAS.INC_P1 : FILAS.INC_P2
  for (const fila of filas) {
    const vals = await leer(mes, rc(fila, 4), rc(fila, 4))
    const v = vals?.[0]?.[0]
    if (!v || parseFloat(v) === 0) return fila
  }
  return null
}
