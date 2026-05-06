import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { getHistorial } from '../services/api'

const fmt = n => '$' + Math.round(n).toLocaleString('es-CL')
const AVATARS = {
  Transporte:'🚗', Alimentación:'🛒', Restaurantes:'🍽️', Ropa:'👕',
  Belleza:'💅', Salud:'💊', Ocio:'🎮', Gym:'💪',
  Tecnología:'💻', Educación:'📚', Mascotas:'🐾', Otros:'📦',
  'Hogar fijo':'🏠', Ingreso:'💵', Ahorro:'💎',
}

export default function Historial() {
  const nav = useNavigate()
  const { nombres, mes } = useStore()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getHistorial(mes, 30)
      .then(d => setRegistros(d.registros||[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [mes])

  const avatarBg = r => r.quien===nombres.p1
    ? 'rgba(167,139,250,.12)' : r.quien===nombres.p2
    ? 'rgba(52,211,153,.12)'  : 'rgba(251,191,36,.12)'
  const amtColor = r => r.quien===nombres.p1 ? 'var(--p1)'
    : r.quien===nombres.p2 ? 'var(--p2)' : 'var(--sh)'

  return (
    <div className="screen active">
      <div className="screen-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>Historial — {mes}</h2>
      </div>
      {loading && <div className="loading">Cargando...</div>}
      {!loading && !registros.length && <div className="empty">Sin registros este mes</div>}
      <div className="hist-list">
        {registros.map((r,i) => (
          <div key={i} className="hist-item">
            <div className="hist-avatar" style={{background: avatarBg(r)}}>
              {AVATARS[r.categoria] || '📦'}
            </div>
            <div className="hist-info">
              <div className="hist-desc">
                {r.descripcion}
                {r.recurrente && <span className="badge-rec">recurrente</span>}
              </div>
              <div className="hist-meta">{r.categoria} · {r.metodoPago} · {r.fecha}</div>
            </div>
            <div className="hist-amt" style={{color: amtColor(r)}}>-{fmt(r.monto)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
