import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path:'/',          icon:'⌂', label:'Inicio'   },
  { path:'/gasto',     icon:'↑', label:'Gasto'    },
  { path:'/ingreso',   icon:'↓', label:'Ingreso'  },
  { path:'/ahorro',    icon:'◎', label:'Ahorro'   },
  { path:'/historial', icon:'≡', label:'Historial'},
]

export default function NavBar() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  return (
    <nav className="navbar">
      {TABS.map(t => (
        <button key={t.path}
          className={`nav-btn${pathname===t.path?' active':''}`}
          onClick={() => nav(t.path)}>
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
          <div className="nav-dot"></div>
        </button>
      ))}
    </nav>
  )
}
