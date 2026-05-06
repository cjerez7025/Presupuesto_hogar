import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useStore } from '../hooks/useStore'
import { guardarGasto } from '../services/api'
import { Field, AmountInput, QuienToggle, SplitSlider, RecurToggle, SaveButton } from '../components/Field'

const CATS = ['Transporte','Alimentación','Restaurantes','Ropa','Belleza',
              'Salud','Ocio','Gym','Tecnología','Educación','Mascotas','Otros']
const METODOS = ['Débito','Crédito','Efectivo','Transferencia']

export default function Gasto() {
  const nav = useNavigate()
  const { nombres, mes, refreshResumen } = useStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [form, setForm] = useState({
    descripcion:'', fecha:new Date().toISOString().split('T')[0],
    monto:'', categoria:'Transporte', quien:'p1',
    metodoPago:'Débito', pctP1:50, notas:'', recurrente:false,
  })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const validate = () => {
    const e = {}
    if (!form.descripcion.trim()) e.descripcion = 'Campo obligatorio'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const quien = form.quien==='p1' ? nombres.p1 : form.quien==='p2' ? nombres.p2 : 'Compartido'
      await guardarGasto({ ...form, mes, quien, monto:Number(form.monto), pctP1:form.pctP1/100 })
      toast.success('Gasto guardado ✓')
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
        <h2>Registrar gasto</h2>
      </div>
      <form onSubmit={submit} noValidate>
        <div style={{padding:'0 0 .75rem'}}>
          <QuienToggle value={form.quien} onChange={v => set('quien',v)} nombres={nombres} showShared />
        </div>
        <div className="card">
          <div className="ctitle">Detalle</div>
          <Field label="Descripción" required error={errors.descripcion} style={{marginBottom:12}}>
            <input value={form.descripcion} placeholder="Ej: Almuerzo"
                   onChange={e => { set('descripcion',e.target.value); setErrors(p=>({...p,descripcion:''})) }} />
          </Field>
          <div className="row-2" style={{marginBottom:12}}>
            <Field label="Monto (CLP)" required error={errors.monto}>
              <AmountInput value={form.monto}
                onChange={e => { set('monto',e.target.value); setErrors(p=>({...p,monto:''})) }} />
            </Field>
            <Field label="Fecha">
              <input type="date" value={form.fecha} onChange={e => set('fecha',e.target.value)} />
            </Field>
          </div>
          <Field label="Método de pago">
            <div className="metodos" style={{marginTop:4}}>
              {METODOS.map(m => (
                <div key={m} className={`m-chip${form.metodoPago===m?' active':''}`}
                     onClick={() => set('metodoPago',m)}>{m}</div>
              ))}
            </div>
          </Field>
        </div>
        <div className="card">
          <div className="ctitle">Categoría</div>
          <div className="cat-grid">
            {CATS.map(c => (
              <div key={c} className={`cat-chip${form.categoria===c?' sel':''}`}
                   onClick={() => set('categoria',c)}>{c}</div>
            ))}
          </div>
        </div>
        {form.quien === 'sh' && (
          <div className="card">
            <div className="ctitle">División del gasto</div>
            <SplitSlider pct={form.pctP1} onChange={v => set('pctP1',v)}
                         monto={Number(form.monto)||0} nombres={nombres} />
          </div>
        )}
        <div className="card">
          <RecurToggle value={form.recurrente} onChange={v => set('recurrente',v)}
                       label="Gasto recurrente mensual" sub="mensual" />
        </div>
        <SaveButton loading={loading}>Guardar gasto</SaveButton>
      </form>
    </div>
  )
}
