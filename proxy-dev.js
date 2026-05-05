// proxy-dev.js — servidor proxy local (evita CORS con Apps Script)
// Ejecutar con: node proxy-dev.js
require('dotenv').config({ path: '.env.local' })
const http = require('http')

const WEB_APP_URL = process.env.WEBAPP_URL
if (!WEB_APP_URL) {
  console.error('❌ Falta WEBAPP_URL en .env.local')
  process.exit(1)
}

console.log('🔗 Proxy apuntando a:', WEB_APP_URL)

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end() }
  if (req.method !== 'POST')   { res.writeHead(405); return res.end('Solo POST') }

  // Leer body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks).toString()

  try {
    // Node no tiene restricciones CORS — puede seguir los redirects de Apps Script
    const { default: fetch } = await import('node-fetch')
    const response = await fetch(WEB_APP_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    body,
      redirect:'follow',
    })
    const text = await response.text()
    console.log('✅ Respuesta Apps Script:', text.substring(0, 80))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(text)
  } catch(e) {
    console.error('❌ Error:', e.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message }))
  }
}).listen(3001, () => {
  console.log('🚀 Proxy corriendo en http://localhost:3001')
})