import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore'

const fmt = n => n != null ? '$' + Math.round(n).toLocaleString('es-CL') : '$0'
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Home() {
  const { nombres, mes, resumen, loading, init, setMes } = useStore()
  const nav = useNavigate()
  useEffect(() => { init() }, [])
  const r = resumen || {}
  const balTotal = (r.balanceP1||0) + (r.balanceP2||0)

  return (
    <div className="screen active">
      <div className="home-header">
        <div className="home-greeting">Buen día 👋</div>
        <div className="home-title">Presupuesto familiar</div>
        <div className="mes-sel-wrap">
          <select className="mes-sel" value={mes} onChange={e => setMes(e.target.value)}>
            {MESES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="balance-card">
        <div className="balance-label">Balance total hogar</div>
        <div className="balance-amount">{loading ? '...' : fmt(balTotal)}</div>
        <div className="balance-persons">
          <div className="balance-person">
            <div className="balance-person-name">{nombres.p1}</div>
            <div className="balance-person-val">{fmt(r.balanceP1)}</div>
          </div>
          <div className="balance-person">
            <div className="balance-person-name">{nombres.p2}</div>
            <div className="balance-person-val">{fmt(r.balanceP2)}</div>
          </div>
        </div>
      </div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Gasto hogar</div>
          <div className="kpi-val shc">{fmt(r.gastoHogar)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Ahorro total</div>
          <div className="kpi-val svc">{fmt((r.ahorroP1||0)+(r.ahorroP2||0))}</div>
        </div>
      </div>
      <div className="sec-title">Registrar</div>
      <div className="action-grid">
        {[
          { path:'/gasto',    cls:'ac-gasto',   icon:'💸', ai:'ai-p', name:'Gasto',      sub:'registro diario'    },
          { path:'/fijo',     cls:'ac-hogar',   icon:'🏠', ai:'ai-y', name:'Gasto fijo', sub:'arriendo, servicios'},
          { path:'/ingreso',  cls:'ac-ingreso', icon:'💵', ai:'ai-g', name:'Ingreso',    sub:'sueldo, freelance'  },
          { path:'/ahorro',   cls:'ac-ahorro',  icon:'💎', ai:'ai-b', name:'Ahorro',     sub:'metas del hogar'    },
          { path:'/historial',cls:'ac-hist',    icon:'📋', ai:'ai-r', name:'Historial',  sub:'últimos registros'  },
        ].map(a => (
          <div key={a.path} className={`action-card ${a.cls}`} onClick={() => nav(a.path)}>
            <div className={`action-icon ${a.ai}`}>{a.icon}</div>
            <div className="action-name">{a.name}</div>
            <div className="action-sub">{a.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
