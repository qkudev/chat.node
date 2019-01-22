/// <reference path="index.d.ts" />

import socketIo from 'socket.io'
import http from 'http'
import redisjs from 'redis'

import app from './server'
import { PORT } from './utils/constants'
import { initMongoose } from './utils/mongoose'

initMongoose()

export const redis = redisjs.createClient(6379)
export const server = new http.Server(app)
export const io = socketIo(server)

server.listen(PORT, (err: Error) => {
  if (err) {
    console.error(err)
  }

  console.log(`Server is listening to ${PORT}`)
})
