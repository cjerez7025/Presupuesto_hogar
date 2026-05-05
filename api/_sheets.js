const { google } = require('googleapis')

const SPREADSHEET_ID = process.env.SPREADSHEET_ID

const FILAS = {
  INC_P1:    [11, 13, 15],
  INC_P2:    [12, 14, 16],
  SH_START:  21, SH_END:  32,
  VAR_START: 37, VAR_END: 76,
  SAV_START: 99, SAV_END: 106,
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getSheets() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
  const auth  = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

function colLetra(n) {
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function rc(fila, col) { return `${colLetra(col)}${fila}` }

async function leer(hoja, desde, hasta) {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${hoja}'!${desde}:${hasta}`,
  })
  return res.data.values || []
}

async function escribir(hoja, celda, valores) {
  const sheets = getSheets()
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${hoja}'!${celda}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: valores },
  })
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

module.exports = { leer, escribir, rc, FILAS, MESES, cors }
