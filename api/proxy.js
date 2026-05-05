// api/proxy.js — Vercel Serverless Function
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Solo POST' })

  const WEB_APP_URL = process.env.WEBAPP_URL
  if (!WEB_APP_URL) return res.status(500).json({ error: 'WEBAPP_URL no configurada' })

  try {
    // Leer body — Vercel puede entregarlo como objeto o como string
    let body = req.body
    if (typeof body === 'object') {
      body = JSON.stringify(body)
    } else if (!body) {
      // Leer manualmente si no viene parseado
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      body = Buffer.concat(chunks).toString()
    }

    const { default: fetch } = await import('node-fetch')
    const response = await fetch(WEB_APP_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    body,
      redirect:'follow',
    })

    const text = await response.text()
    const data = JSON.parse(text)
    res.status(200).json(data)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}