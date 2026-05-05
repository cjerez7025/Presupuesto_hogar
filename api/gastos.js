// api/gastos.js — POST /api/gastos  |  GET /api/gastos?historial=1&mes=Mayo
const { leer, escribir, rc, FILAS, cors } = require('./_sheets')

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    // GET historial
    if (req.method === 'GET') {
      const { mes, limite = 20 } = req.query
      const { VAR_START, VAR_END } = FILAS
      const datos = await leer(mes, rc(VAR_START, 2), rc(VAR_END, 11))
      const result = []
      for (const row of [...datos].reverse()) {
        if (!row?.[0]) continue
        result.push({
          descripcion: row[0] || '',
          fecha:       row[1] || '',
          monto:       parseFloat(row[2]) || 0,
          categoria:   row[3] || '',
          quien:       row[4] || '',
          metodoPago:  row[5] || '',
          compartido:  row[6] === 'Sí',
          notas:       row[8] || '',
          recurrente:  row[9] === 'RECURRENTE',
        })
        if (result.length >= Number(limite)) break
      }
      return res.json({ registros: result })
    }

    // POST guardar gasto
    if (req.method === 'POST') {
      const { mes, descripcion, fecha, monto, categoria, quien,
              metodoPago = 'Débito', compartido = false,
              notas = '', recurrente = false } = req.body

      const fila = await _filaLibre(mes)
      if (!fila) return res.status(400).json({ error: 'No hay filas disponibles.' })

      await escribir(mes, rc(fila, 2), [[
        descripcion, fecha, monto, categoria, quien,
        metodoPago, compartido ? 'Sí' : '', '', notas,
        recurrente ? 'RECURRENTE' : '',
      ]])
      return res.json({ ok: true, fila })
    }

    res.status(405).json({ error: 'Método no permitido' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function _filaLibre(mes) {
  const { VAR_START, VAR_END } = FILAS
  const datos = await leer(mes, rc(VAR_START, 2), rc(VAR_END, 2))
  for (let i = 0; i < datos.length; i++) {
    if (!datos[i]?.[0]) return VAR_START + i
  }
  return null
}
