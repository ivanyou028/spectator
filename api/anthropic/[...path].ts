// @ts-nocheck — Edge runtime provides Web API globals (Request, Response, Headers, fetch)
export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const apiPath = url.pathname.replace(/^\/api\/anthropic/, '')

  const headers = new Headers()
  // Forward only the headers Anthropic needs
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) headers.set('x-api-key', apiKey)

  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  const anthropicVersion = request.headers.get('anthropic-version')
  if (anthropicVersion) headers.set('anthropic-version', anthropicVersion)

  const response = await fetch(`https://api.anthropic.com${apiPath}`, {
    method: request.method,
    headers,
    body: request.method !== 'GET' ? request.body : undefined,
  })

  // Return the response with CORS headers
  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('Access-Control-Allow-Origin', '*')
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders })
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}
