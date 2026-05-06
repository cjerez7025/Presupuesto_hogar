import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useStore } from '../hooks/useStore'
import { getGastosFijos, guardarGasto } from '../services/api'
import { Field, AmountInput, SplitSlider, RecurToggle, SaveButton } from '../components/Field'

const METODOS = ['Débito','Crédito','Efectivo','Transferencia']

export default function Fijo() {
  const nav = useNavigate()
  const { nombres, mes, refreshResumen } = useStore()
  const [loading, setLoading]     = useState(false)
  const [fijosList, setFijosList] = useState([])
  const [errors, setErrors]       = useState({})
  const [form, setForm] = useState({
    concepto:'', esperado:'', monto:'',
    fecha:new Date().toISOString().split('T')[0],
    metodoPago:'Débito', pctP1:50, recurrente:true,
  })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  useEffect(() => {
    getGastosFijos().then(d => setFijosList(d.items||[])).catch(()=>{})
  }, [])

  const onConcepto = e => {
    const nombre = e.target.value
    const item = fijosList.find(f => f.nombre === nombre)
    set('concepto', nombre)
    if (item) set('pctP1', Math.round(item.pctP1 * 100))
    setErrors(p => ({...p, concepto:''}))
  }

  const validate = () => {
    const e = {}
    if (!form.concepto) e.concepto = 'Selecciona un concepto'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await guardarGasto({
        mes, descripcion:form.concepto, fecha:form.fecha,
        monto:Number(form.monto), categoria:'Hogar fijo',
        quien:'Compartido', metodoPago:form.metodoPago,
        compartido:true, pctP1:form.pctP1/100, recurrente:form.recurrente,
      })
      toast.success('Gasto fijo guardado ✓')
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
        <h2>Gasto fijo hogar</h2>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="card">
          <div className="ctitle">Concepto y montos</div>
          <Field label="Gasto del hogar" required error={errors.concepto} style={{marginBottom:12}}>
            <select value={form.concepto} onChange={onConcepto}>
              <option value="">— Seleccionar —</option>
              {fijosList.map(f => (
                <option key={f.nombre} value={f.nombre}>
                  {f.nombre} ({Math.round(f.pctP1*100)}/{Math.round(f.pctP2*100)})
                </option>
              ))}
            </select>
          </Field>
          <div className="row-2" style={{marginBottom:12}}>
            <Field label="Monto esperado">
              <AmountInput value={form.esperado} onChange={e => set('esperado',e.target.value)} />
            </Field>
            <Field label="Monto real" required error={errors.monto}>
              <AmountInput value={form.monto}
                onChange={e => { set('monto',e.target.value); setErrors(p=>({...p,monto:''})) }} />
            </Field>
          </div>
          <div className="row-2">
            <Field label="Fecha de cobro">
              <input type="date" value={form.fecha} onChange={e => set('fecha',e.target.value)} />
            </Field>
            <Field label="Método de pago">
              <select value={form.metodoPago} onChange={e => set('metodoPago',e.target.value)}>
                {METODOS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="card">
          <div className="ctitle">División del costo</div>
          <SplitSlider pct={form.pctP1} onChange={v => set('pctP1',v)}
                       monto={Number(form.monto)||0} nombres={nombres} />
        </div>
        <div className="card">
          <RecurToggle value={form.recurrente} onChange={v => set('recurrente',v)}
                       label="Recurrente mensual" sub="activado por defecto" />
        </div>
        <SaveButton loading={loading} color="amber">Guardar gasto fijo</SaveButton>
      </form>
    </div>
  )
}
