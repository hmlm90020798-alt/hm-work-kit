const functions = require('firebase-functions')
const https = require('https')

exports.anthropicProxy = functions
  .region('europe-west1')
  .runWith({ secrets: ['ANTHROPIC_API_KEY'] })
  .https.onRequest((req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') { res.status(204).send(''); return }
    if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) { res.status(500).json({ error: 'API key não configurada' }); return }

    const body = JSON.stringify(req.body)
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const request = https.request(options, (response) => {
      let data = ''
      response.on('data', chunk => { data += chunk })
      response.on('end', () => {
        res.status(response.statusCode).set('Content-Type', 'application/json').send(data)
      })
    })
    request.on('error', (e) => { res.status(500).json({ error: e.message }) })
    request.write(body)
    request.end()
  })
