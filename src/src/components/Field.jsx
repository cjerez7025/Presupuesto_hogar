import React from 'react'

export function Field({ label, required, error, children, style }) {
  return (
    <div className={`field${error?' has-err':''}`} style={style}>
      <label>{label}{required && <span className="req"> *</span>}</label>
      {children}
      {error && <span className="err-msg">{error}</span>}
    </div>
  )
}

export function AmountInput({ id, value, onChange, placeholder='0' }) {
  return (
    <div className="amt-wrap">
      <span className="amt-prefix">$</span>
      <input id={id} type="number" inputMode="numeric"
             value={value} onChange={onChange}
             placeholder={placeholder} min="0" step="100" />
    </div>
  )
}

export function QuienToggle({ value, onChange, nombres, showShared=false }) {
  const opts = [
    { key:'p1', label:nombres.p1, cls:'p1' },
    { key:'p2', label:nombres.p2, cls:'p2' },
    ...(showShared ? [{ key:'sh', label:'Compartido', cls:'sh' }] : []),
  ]
  return (
    <div className="quien-wrap">
      {opts.map(o => (
        <button key={o.key} type="button"
          className={`q-btn ${o.cls}${value===o.key?' active':''}`}
          onClick={() => onChange(o.key)}>
          <span className="dot"/>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SplitSlider({ pct, onChange, monto, nombres }) {
  const fmt = n => '$' + Math.round(n).toLocaleString('es-CL')
  return (
    <div className="split-zone">
      <div className="pct-track">
        <span className="p1c">{nombres.p1}</span>
        <input type="range" min={0} max={100} step={5}
               value={pct} onChange={e => onChange(Number(e.target.value))} />
        <span className="pct-badge p1c">{pct}%</span>
      </div>
      <div className="quick-row">
        {[50,40,60,33,75].map(v => (
          <button key={v} type="button" className="q-quick" onClick={() => onChange(v)}>
            {v}/{100-v}
          </button>
        ))}
      </div>
      <div className="split-result">
        <span className="p1c">{nombres.p1}: {fmt(monto*pct/100)}</span>
        <span className="p2c">{nombres.p2}: {fmt(monto*(100-pct)/100)}</span>
      </div>
    </div>
  )
}

export function RecurToggle({ value, onChange, label, sub }) {
  return (
    <div className="recur-row" onClick={() => onChange(!value)}>
      <div className={`sw${value?' on':''}`}/>
      <span className="recur-label">{label}</span>
      {sub && <span className="recur-sub">{sub}</span>}
    </div>
  )
}

export function SaveButton({ loading, children, color }) {
  return (
    <button type="submit" className={`btn-save${color?' '+color:''}`} disabled={loading}>
      {loading ? 'Guardando...' : children}
    </button>
  )
}
