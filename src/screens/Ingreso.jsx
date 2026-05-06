import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useStore } from '../hooks/useStore'
import { guardarIngreso } from '../services/api'
import { Field, AmountInput, QuienToggle, RecurToggle, SaveButton } from '../components/Field'

const TIPOS = ['Sueldo / Salario','Freelance / Proyecto','Bono',
               'Devolución / Reembolso','Arriendo recibido','Inversión / Dividendo','Otro ingreso']

export default function Ingreso() {
  const nav = useNavigate()
  const { nombres, mes, refreshResumen } = useStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [form, setForm] = useState({
    tipo:'', descripcion:'', esperado:'', recibido:'',
    fecha:new Date().toISOString().split('T')[0],
    quien:'p1', recurrente:false,
  })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const validate = () => {
    const e = {}
    if (!form.tipo) e.tipo = 'Selecciona un tipo'
    if (!form.recibido || Number(form.recibido) <= 0) e.recibido = 'Ingresa un monto'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await guardarIngreso({ ...form, mes, esperado:Number(form.esperado)||0, recibido:Number(form.recibido) })
      toast.success('Ingreso guardado ✓')
      await refreshResumen()
      nav('/')
    } catch(err) {
      toast.error(err.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div className="screen active">
      <div className="screen-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>Registrar ingreso</h2>
      </div>
      <form onSubmit={submit} noValidate>
        <div style={{padding:'0 0 .75rem'}}>
          <QuienToggle value={form.quien} onChange={v => set('quien',v)} nombres={nombres} />
        </div>
        <div className="card">
          <div className="ctitle">Detalle</div>
          <Field label="Tipo de ingreso" required error={errors.tipo} style={{marginBottom:12}}>
            <select value={form.tipo}
                    onChange={e => { set('tipo',e.target.value); setErrors(p=>({...p,tipo:''})) }}>
              <option value="">— Seleccionar —</option>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="row-2" style={{marginBottom:12}}>
            <Field label="Monto esperado (CLP)">
              <AmountInput value={form.esperado} onChange={e => set('esperado',e.target.value)} />
            </Field>
            <Field label="Monto recibido (CLP)" required error={errors.recibido}>
              <AmountInput value={form.recibido}
                onChange={e => { set('recibido',e.target.value); setErrors(p=>({...p,recibido:''})) }} />
            </Field>
          </div>
          <div className="row-2" style={{marginBottom:12}}>
            <Field label="Fecha">
              <input type="date" value={form.fecha} onChange={e => set('fecha',e.target.value)} />
            </Field>
            <Field label="Descripción / Fuente">
              <input value={form.descripcion} placeholder="Ej: Empresa XYZ"
                     onChange={e => set('descripcion',e.target.value)} />
            </Field>
          </div>
          <RecurToggle value={form.recurrente} onChange={v => set('recurrente',v)}
                       label="Ingreso recurrente mensual" sub="ej: sueldo fijo" />
        </div>
        <SaveButton loading={loading} color="green">Guardar ingreso</SaveButton>
      </form>
    </div>
  )
}
