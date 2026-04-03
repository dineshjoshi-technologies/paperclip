require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/', (_req, res) => {
  res.json({ service: 'dj-technologies-api', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})
