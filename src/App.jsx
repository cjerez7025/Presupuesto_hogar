import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home      from './screens/Home'
import Gasto     from './screens/Gasto'
import Fijo      from './screens/Fijo'
import Ingreso   from './screens/Ingreso'
import Ahorro    from './screens/Ahorro'
import Historial from './screens/Historial'
import NavBar    from './components/NavBar'
import './styles.css'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/gasto"     element={<Gasto />} />
        <Route path="/fijo"      element={<Fijo />} />
        <Route path="/ingreso"   element={<Ingreso />} />
        <Route path="/ahorro"    element={<Ahorro />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
      <NavBar />
    </div>
  )
}
