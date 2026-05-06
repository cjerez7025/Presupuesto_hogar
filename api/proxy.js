// api/proxy.js — con logs de diagnóstico
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Solo POST' })

  const WEB_APP_URL = process.env.WEBAPP_URL
  if (!WEB_APP_URL) return res.status(500).json({ error: 'WEBAPP_URL no configurada' })

  try {
    // Log para ver qué llega
    console.log('req.body type:', typeof req.body)
    console.log('req.body:', JSON.stringify(req.body))

    // Vercel entrega el body ya parseado como objeto
    // Apps Script necesita recibirlo como string de texto plano
    let bodyString
    if (req.body && typeof req.body === 'object') {
      bodyString = JSON.stringify(req.body)
    } else if (typeof req.body === 'string') {
      bodyString = req.body
    } else {
      // Leer manualmente si todo falla
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      bodyString = Buffer.concat(chunks).toString()
    }

    console.log('bodyString enviado:', bodyString)

    const { default: fetch } = await import('node-fetch')
    const response = await fetch(WEB_APP_URL, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain;charset=utf-8' },
      body:     bodyString,
      redirect: 'follow',
    })

    const text = await response.text()
    console.log('Respuesta Apps Script:', text.substring(0, 200))

    const data = JSON.parse(text)
    return res.status(200).json(data)
  } catch(e) {
    console.error('Error proxy:', e.message)
    return res.status(500).json({ error: e.message })
  }
}