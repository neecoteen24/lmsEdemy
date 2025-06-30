import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

// Initialize express
const app = express()

// Middleware to get raw body for Clerk webhook verification
app.use('/clerk', express.raw({ type: 'application/json' }))

// Regular middleware for other routes
app.use(express.json())
app.use(cors())

// Connect to database
try {
  await connectDB()
  console.log('Connected to MongoDB')
} catch (error) {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
}

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', clerkWebhooks)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// Port
const PORT = process.env.PORT || 5000  // Note: Changed port to PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})