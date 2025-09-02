export const runtime = "nodejs";
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"

const handler = toNextJsHandler(auth)

// Add CORS headers to all responses (echo request origin if present)
const addCorsHeaders = (response: Response, request?: Request) => {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export const GET = async (request: Request) => {
  const response = await handler.GET(request)
  return addCorsHeaders(response, request)
}

export const POST = async (request: Request) => {
  const url = new URL(request.url)
  const path = url.pathname

  // Intercept email/password sign-in and block if email not verified
  const isEmailSignIn = /\/api\/auth\/(email\/sign-in|sign-in\/email|email\/login|login\/email)$/i.test(path) || /\/api\/auth\/email\/(sign-in|login)/i.test(path)
  if (isEmailSignIn) {
    try {
      const bodyText = await request.text()
      const body = bodyText ? JSON.parse(bodyText) : {}
      const emailRaw: string | undefined = body?.email || body?.identifier
      const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : undefined

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } })
        if (user && !user.emailVerified) {
          const res = new Response(JSON.stringify({ error: { message: 'Please verify your email before signing in.' } }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          })
          return addCorsHeaders(res, request)
        }
      }

      // Recreate the request since body was consumed
      const forwardReq = new Request(request.url, { method: request.method, headers: request.headers, body: bodyText })
      const response = await handler.POST(forwardReq)
      return addCorsHeaders(response, request)
    } catch (err) {
      const res = new Response(JSON.stringify({ error: { message: 'Invalid sign-in request' } }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
      return addCorsHeaders(res, request)
    }
  }

  const response = await handler.POST(request)
  return addCorsHeaders(response, request)
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
