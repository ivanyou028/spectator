// @ts-nocheck — Vercel serverless functions have their own runtime types
export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version')
    return res.status(204).end()
  }

  // Extract the Anthropic API path from the query parameter (set by rewrite)
  const urlObj = new URL(req.url || '/', `http://${req.headers.host}`)
  const pathParam = urlObj.searchParams.get('path') || ''
  const apiPath = pathParam ? `/${pathParam}` : '/'

  // Build clean headers — only forward what Anthropic needs (no origin/referer)
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  const apiKey = req.headers['x-api-key']
  if (typeof apiKey === 'string') headers['x-api-key'] = apiKey

  const anthropicVersion = req.headers['anthropic-version']
  if (typeof anthropicVersion === 'string') headers['anthropic-version'] = anthropicVersion

  try {
    const response = await fetch(`https://api.anthropic.com${apiPath}`, {
      method: req.method || 'POST',
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    // Set CORS headers on response
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version')

    const contentType = response.headers.get('content-type') || ''
    res.setHeader('Content-Type', contentType)
    res.status(response.status)

    if (contentType.includes('text/event-stream')) {
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      const reader = response.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(decoder.decode(value, { stream: true }))
        }
      }
      return res.end()
    } else {
      const data = await response.text()
      return res.send(data)
    }
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: 'Proxy error', message: String(error) })
  }
}
