import express, { NextFunction, Request, Response } from 'express'
import router from './router'
import cors from 'cors'

const app = express()

app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method}: ${req.path} ${new Date().toISOString()}`)
  return next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/api/v1', router)

export default app
