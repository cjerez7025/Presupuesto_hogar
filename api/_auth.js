// api/_auth.js — Autenticación OAuth2 con cuenta Google personal
// No requiere Cloud Console ni facturación
const { google } = require('googleapis')
const fs   = require('fs')
const path = require('path')

// Credenciales OAuth2 de la app (se crean UNA vez en Cloud Console gratis)
// Usamos las credenciales públicas de la CLI de gcloud como fallback
// O las credenciales propias si el usuario las configura
const TOKEN_PATH = path.join(__dirname, '../.token.json')

function getOAuthClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri  = process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL + '/api/auth/callback'
    : 'http://localhost:3001/api/auth/callback'

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

function getSheets() {
  const oauth2Client = getOAuthClient()

  // Leer token guardado
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('NO_TOKEN')
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
  oauth2Client.setCredentials(token)

  // Auto-refresh si expiró
  oauth2Client.on('tokens', (tokens) => {
    const current = JSON.parse(fs.readFileSync(TOKEN_PATH))
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...current, ...tokens }))
  })

  return google.sheets({ version: 'v4', auth: oauth2Client })
}

module.exports = { getOAuthClient, getSheets, TOKEN_PATH }
