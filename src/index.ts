/// <reference path="index.d.ts" />
import http from 'http'
import redisjs from 'redis'

import app from './server'
import { PORT, REDIS_HOST, REDIS_PORT, events } from './utils'
import { initMongoose } from './utils/mongoose'
import socketIo from 'socket.io'
import * as e from './middlewares/events'

initMongoose()

export const redis = redisjs.createClient(REDIS_PORT, REDIS_HOST)
export const server = new http.Server(app)
export const io = socketIo(server)

io.on(events.connection, e.onConnection)

server.listen(PORT, (err: Error) => {
  if (err) console.error(err)

  console.log(`Server is listening to ${PORT}`)
})
