import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function otpApiDevPlugin(): Plugin {
  return {
    name: 'otp-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || ''
        const urlPath = rawUrl.split('?')[0]

        if (urlPath !== '/api/send-otp' && urlPath !== '/api/reset-password') {
          return next()
        }

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.end()
          return
        }

        let bodyStr = ''
        req.on('data', (chunk) => {
          bodyStr += chunk
        })

        req.on('end', async () => {
          try {
            let parsedBody = {}
            if (bodyStr) {
              try {
                parsedBody = JSON.parse(bodyStr)
              } catch {}
            }

            const mockReq = {
              method: req.method,
              headers: req.headers,
              body: parsedBody,
              query: rawUrl.includes('?') ? Object.fromEntries(new URLSearchParams(rawUrl.split('?')[1])) : {},
            }

            const mockRes = {
              statusCode: 200,
              status(code: number) {
                this.statusCode = code
                res.statusCode = code
                return this
              },
              setHeader(name: string, value: string) {
                res.setHeader(name, value)
                return this
              },
              json(data: any) {
                res.statusCode = this.statusCode || 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              },
              end(data?: any) {
                res.end(data)
                return this
              },
            }

            if (urlPath === '/api/send-otp') {
              // @ts-ignore
              const mod: any = await import('./api/send-otp.js')
              const handler = mod.default || mod
              await handler(mockReq, mockRes)
            } else if (urlPath === '/api/reset-password') {
              // @ts-ignore
              const mod: any = await import('./api/reset-password.js')
              const handler = mod.default || mod
              await handler(mockReq, mockRes)
            }
          } catch (err: any) {
            console.error('Local API dev server error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), otpApiDevPlugin()],
  server: {
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp', '**/*.ico', '**/node_modules/**'],
    },
  },
})
