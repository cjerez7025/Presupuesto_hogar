// api/_dev-server.js — servidor local para desarrollo
// Ejecutar con: node api/_dev-server.js
// NO se sube a Vercel (está en .vercelignore)
require('dotenv').config()
const http = require('http')
const url  = require('url')

const handlers = {
  '/api/config'   : require('./config'),
  '/api/gastos'   : require('./gastos'),
  '/api/ingresos' : require('./ingresos'),
  '/api/ahorro'   : require('./ahorro'),
}

const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true)
  const pathname = parsed.pathname
  const handler  = handlers[pathname]

  if (!handler) {
    res.writeHead(404); return res.end('Not found')
  }

  // Parsear body para POST
  let body = {}
  if (req.method === 'POST') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    try { body = JSON.parse(Buffer.concat(chunks).toString()) } catch {}
  }

  // Simular objeto req/res de Vercel
  req.query = parsed.query
  req.body  = body
  res.json  = (data) => {
    res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
  res.status = (code) => { res.statusCode = code; return res }

  await handler(req, res)
})

server.listen(3001, () => console.log('API local en http://localhost:3001'))
