// api/config.js — GET /api/config
const { leer, MESES, cors } = require('./_sheets')

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { tipo } = req.query

    if (tipo === 'nombres') {
      const vals = await leer('INICIO', 'C5', 'C7')
      return res.json({
        p1  : vals?.[0]?.[0] || 'Persona 1',
        p2  : vals?.[1]?.[0] || 'Persona 2',
        anio: vals?.[2]?.[0] || new Date().getFullYear(),
      })
    }

    if (tipo === 'gastos-fijos') {
      const left  = await leer('INICIO', 'B11', 'D16')
      const right = await leer('INICIO', 'F11', 'H16')
      const items = []
      ;[...left, ...right].forEach(row => {
        if (row?.[0]) items.push({
          nombre: row[0],
          pctP1:  parseFloat(row[1]) || 0.5,
          pctP2:  parseFloat(row[2]) || 0.5,
        })
      })
      return res.json({ items })
    }

    if (tipo === 'metas') {
      return res.json({ metas: [
        'Fondo de emergencia hogar','Vacaciones / Viaje juntos',
        'Fondo arriendo / deuda','Inversión conjunta',
        'Meta hogar 1','Meta hogar 2','Meta hogar 3','Meta hogar 4',
      ]})
    }

    if (tipo === 'mes-activo') {
      return res.json({ mes: MESES[new Date().getMonth()] })
    }

    if (tipo === 'resumen') {
      const { mes } = req.query
      const vals = await leer(mes, 'B5', 'J7')
      const v = (r, c) => parseFloat(vals?.[r]?.[c] || 0)
      return res.json({
        ingresoP1: v(0,0), gastoP1:    v(0,1), ahorroP1: v(0,2),
        ingresoP2: v(0,3), gastoP2:    v(0,4), ahorroP2: v(0,5),
        gastoHogar:v(0,6), balanceP1:  v(2,0), balanceP2:v(2,4),
      })
    }

    res.status(400).json({ error: 'tipo no válido' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
