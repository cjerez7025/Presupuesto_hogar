// api/proxy.js — Vercel Serverless Function (CommonJS)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Solo POST' })

  const WEB_APP_URL = process.env.WEBAPP_URL
  if (!WEB_APP_URL) return res.status(500).json({ error: 'WEBAPP_URL no configurada' })

  try {
    const { default: fetch } = await import('node-fetch')
    const response = await fetch(WEB_APP_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify(req.body),
      redirect:'follow',
    })
    const text = await response.text()
    const data = JSON.parse(text)
    res.status(200).json(data)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}