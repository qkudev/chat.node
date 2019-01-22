import mongoose from 'mongoose'

const host = process.env.MONGO_HOST
const port = process.env.MONGO_PORT
const dbName = process.env.MONGO_DB_NAME
const user = process.env.MONGO_USERNAME || undefined
const pass = process.env.MONGO_PASSWORD || undefined

const timer = parseInt(process.env.MONGO_RECONNECT_MS || '5000', 10)
const URI = `mongodb://${host}:${port}/`
const options = { useNewUrlParser: true, dbName, user, pass }

mongoose.connection.on('connected', function () {
  console.log('Successfully connected to MongoDB')
})

mongoose.connection.on('error', function (err: Error) {
  console.error(err.name)
  console.log(`Failed to connect. Retry in ${timer}`)
  return initMongoose()
})

export const initMongoose = () => setTimeout(() => mongoose.connect(URI, options), timer)
