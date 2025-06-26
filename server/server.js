import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'

// Initialise express
const app= express()

//Connect to database
await connectDB()

//Middleware
app.use(cors())

//Routes

app.get('/', (req,res)=> res.send("API Working"))

//Port
const PORT= process.env.port || 5000

app.listen(PORT,()=> {
  console.log(`Server running on port ${PORT}`)
})