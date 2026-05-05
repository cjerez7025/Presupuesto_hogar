import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useStore } from '../hooks/useStore'
import { getMetasAhorro, guardarAhorro } from '../services/api'
import { Field, AmountInput, SplitSlider, RecurToggle, SaveButton } from '../components/Field'

export default function Ahorro() {
  const nav = useNavigate()
  const { nombres, mes, refreshResumen } = useStore()
  const [loading, setLoading] = useState(false)
  const [metas, setMetas]     = useState([])
  const [errors, setErrors]   = useState({})
  const [form, setForm] = useState({
    nombreMeta:'', categoria:'Ahorro', aporte:'',
    metaTotal:'', pctP1:50, recurrente:true,
  })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  useEffect(() => {
    getMetasAhorro().then(d => setMetas(d.metas||[])).catch(()=>{})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.nombreMeta) e.nombreMeta = 'Selecciona una meta'
    if (!form.aporte || Number(form.aporte) <= 0) e.aporte = 'Ingresa un monto'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await guardarAhorro({ ...form, mes, aporte:Number(form.aporte), metaTotal:Number(form.metaTotal)||0, pctP1:form.pctP1/100 })
      toast.success('Aporte guardado ✓')
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
        <h2>Aporte a meta</h2>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="card">
          <div className="ctitle">Meta del hogar</div>
          <div className="row-2" style={{marginBottom:12}}>
            <Field label="Meta" required error={errors.nombreMeta}>
              <select value={form.nombreMeta}
                      onChange={e => { set('nombreMeta',e.target.value); setErrors(p=>({...p,nombreMeta:''})) }}>
                <option value="">— Seleccionar —</option>
                {metas.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => set('categoria',e.target.value)}>
                {['Ahorro','Inversión','Fondo emergencia','Viaje / Vacaciones'].map(c =>
                  <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="row-2">
            <Field label="Aporte del mes" required error={errors.aporte}>
              <AmountInput value={form.aporte}
                onChange={e => { set('aporte',e.target.value); setErrors(p=>({...p,aporte:''})) }} />
            </Field>
            <Field label="Meta total (CLP)">
              <AmountInput value={form.metaTotal} onChange={e => set('metaTotal',e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="card">
          <div className="ctitle">División del aporte</div>
          <SplitSlider pct={form.pctP1} onChange={v => set('pctP1',v)}
                       monto={Number(form.aporte)||0} nombres={nombres} />
        </div>

        <div className="card">
          <RecurToggle value={form.recurrente} onChange={v => set('recurrente',v)}
                       label="Aporte recurrente mensual" sub="activado por defecto" />
        </div>

        <SaveButton loading={loading} color="blue">Guardar aporte</SaveButton>
      </form>
    </div>
  )
}
