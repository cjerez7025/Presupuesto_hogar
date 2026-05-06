// ============================================================
// WebApp.gs — Expone el Google Sheet como API REST
// Pegar en Apps Script del sheet → Implementar → Web App
// ============================================================

// Configuración
var SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId()

// ── Router principal ────────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action
  var mes    = e.parameter.mes || getMesActivo_()

  try {
    if (action === 'config')      return jsonOk(getConfig_())
    if (action === 'resumen')     return jsonOk(getResumen_(mes))
    if (action === 'historial')   return jsonOk(getHistorial_(mes, e.parameter.limite || 20))
    return jsonErr('action no válida')
  } catch(err) {
    return jsonErr(err.message)
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents)
  var action = data.action

  try {
    if (action === 'gasto')   return jsonOk(guardarGasto_(data))
    if (action === 'ingreso') return jsonOk(guardarIngreso_(data))
    if (action === 'ahorro')  return jsonOk(guardarAhorro_(data))
    return jsonErr('action no válida')
  } catch(err) {
    return jsonErr(err.message)
  }
}

// ── Config ──────────────────────────────────────────────────
function getConfig_() {
  var inicio = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('INICIO')
  var p1     = inicio.getRange('C5').getValue() || 'Persona 1'
  var p2     = inicio.getRange('C6').getValue() || 'Persona 2'

  // Gastos fijos con porcentajes
  var left  = inicio.getRange('B11:D16').getValues()
  var right = inicio.getRange('F11:H16').getValues()
  var fijos = []
  left.concat(right).forEach(function(row) {
    if (row[0]) fijos.push({ nombre: row[0], pctP1: row[1] || 0.5, pctP2: row[2] || 0.5 })
  })

  return {
    p1: p1, p2: p2,
    mesActivo: getMesActivo_(),
    gastosFijos: fijos,
    metas: [
      'Fondo de emergencia hogar','Vacaciones / Viaje juntos',
      'Fondo arriendo / deuda','Inversión conjunta',
      'Meta hogar 1','Meta hogar 2','Meta hogar 3','Meta hogar 4'
    ]
  }
}

// ── Resumen KPIs ────────────────────────────────────────────
function getResumen_(mes) {
  var hoja = getHoja_(mes)
  return {
    ingresoP1:  hoja.getRange('B5').getValue(),
    gastoP1:    hoja.getRange('C5').getValue(),
    ahorroP1:   hoja.getRange('D5').getValue(),
    ingresoP2:  hoja.getRange('E5').getValue(),
    gastoP2:    hoja.getRange('F5').getValue(),
    ahorroP2:   hoja.getRange('G5').getValue(),
    gastoHogar: hoja.getRange('H5').getValue(),
    balanceP1:  hoja.getRange('B7').getValue(),
    balanceP2:  hoja.getRange('E7').getValue(),
  }
}

// ── Historial ───────────────────────────────────────────────
function getHistorial_(mes, limite) {
  var hoja  = getHoja_(mes)
  var start = 37, end = 76
  var datos = hoja.getRange(start, 2, end - start + 1, 10).getValues()
  var result = []

  for (var i = datos.length - 1; i >= 0; i--) {
    if (!datos[i][0]) continue
    result.push({
      descripcion: datos[i][0],
      fecha:       datos[i][1] ? Utilities.formatDate(new Date(datos[i][1]), Session.getScriptTimeZone(), 'dd/MM') : '',
      monto:       datos[i][2] || 0,
      categoria:   datos[i][3] || '',
      quien:       datos[i][4] || '',
      metodoPago:  datos[i][5] || '',
      compartido:  datos[i][6] === 'Sí',
      notas:       datos[i][8] || '',
      recurrente:  datos[i][9] === 'RECURRENTE',
    })
    if (result.length >= Number(limite)) break
  }
  return { registros: result }
}

// ── Guardar gasto variable ──────────────────────────────────
function guardarGasto_(d) {
  var hoja  = getHoja_(d.mes)
  var fila  = filaLibreVar_(hoja)
  if (!fila) throw new Error('No hay filas disponibles en el registro.')

  hoja.getRange(fila, 2, 1, 10).setValues([[
    d.descripcion, d.fecha, d.monto, d.categoria,
    d.quien, d.metodoPago || 'Débito',
    d.compartido ? 'Sí' : '', '',
    d.notas || '',
    d.recurrente ? 'RECURRENTE' : ''
  ]])
  return { ok: true, fila: fila }
}

// ── Guardar ingreso ─────────────────────────────────────────
function guardarIngreso_(d) {
  var hoja  = getHoja_(d.mes)
  var filas = d.quien === 'p1' ? [11,13,15] : [12,14,16]
  var fila  = null

  for (var i = 0; i < filas.length; i++) {
    var recibido = hoja.getRange(filas[i], 4).getValue()
    if (!recibido || recibido === 0) { fila = filas[i]; break }
  }
  if (!fila) throw new Error('Todas las filas de ingreso ya tienen datos.')

  hoja.getRange(fila, 3).setValue(d.esperado || 0)
  hoja.getRange(fila, 4).setValue(d.recibido)
  hoja.getRange(fila, 6).setValue(d.fecha)
  hoja.getRange(fila, 7).setValue(d.descripcion || d.tipo)
  return { ok: true, fila: fila }
}

// ── Guardar ahorro ──────────────────────────────────────────
function guardarAhorro_(d) {
  var hoja  = getHoja_(d.mes)
  var metas = [
    'Fondo de emergencia hogar','Vacaciones / Viaje juntos',
    'Fondo arriendo / deuda','Inversión conjunta',
    'Meta hogar 1','Meta hogar 2','Meta hogar 3','Meta hogar 4'
  ]
  var start = 99
  var fila  = null

  var datos = hoja.getRange(start, 2, 8, 1).getValues()
  for (var i = 0; i < datos.length; i++) {
    if (datos[i][0] === d.nombreMeta) { fila = start + i; break }
  }
  if (!fila) {
    var idx = metas.indexOf(d.nombreMeta)
    if (idx >= 0) fila = start + idx
  }
  if (!fila) throw new Error('Meta no encontrada: ' + d.nombreMeta)

  hoja.getRange(fila, 4).setValue(d.aporte)
  hoja.getRange(fila, 5).setValue(d.pctP1 || 0.5)
  if (d.metaTotal) hoja.getRange(fila, 8).setValue(d.metaTotal)
  return { ok: true, fila: fila }
}

// ── Helpers ─────────────────────────────────────────────────
function getHoja_(mes) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(mes)
  if (!hoja) throw new Error('No existe la hoja: ' + mes)
  return hoja
}

function getMesActivo_() {
  var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return meses[new Date().getMonth()]
}

function filaLibreVar_(hoja) {
  var datos = hoja.getRange(37, 2, 40, 1).getValues()
  for (var i = 0; i < datos.length; i++) {
    if (!datos[i][0]) return 37 + i
  }
  return null
}

function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON)
}
