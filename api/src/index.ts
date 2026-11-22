import { serve } from '@hono/node-server'
import { accounts } from './accounts.ts'
import { app } from './app.ts'
import { ensureSchema } from './db/index.ts'

const port = Number(process.env.PORT ?? 3001)

ensureSchema()
  .then(() => {
    accounts()
    serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
      console.log(`API http://127.0.0.1:${port}`)
    })
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
