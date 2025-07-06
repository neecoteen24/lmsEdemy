import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'

// Initialize express
const app = express()

// Middleware to get raw body for Clerk webhook verification
app.use('/clerk', express.raw({ type: 'application/json' }))

// Regular middleware for other routes
app.use(express.json())
app.use(cors())

// Connect to database
try {
  await connectCloudinary()
  console.log('Connected to Cloudinary')
} catch (error) {
  console.error('Failed to connect to Cloudinary:', error)
  process.exit(1)
}
try {
  await connectDB()
  console.log('Connected to MongoDB')
} catch (error) {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
}

//Middlewares
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', clerkWebhooks)
app.use('/api/educator',educatorRouter)
app.use('/api/course',courseRouter)
app.use('/api/user',userRouter)
app.post('/stripe',express.raw({type: 'application/json'}), stripeWebhooks)

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