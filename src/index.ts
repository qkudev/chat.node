/// <reference path="index.d.ts" />

import http from 'http'
import redisjs from 'redis'

import app from './server'
import { PORT } from './utils/constants'
import { initMongoose } from './utils/mongoose'
import socketIo from 'socket.io'
import * as e from './events'

initMongoose()

function Message (from: string, rawMessage: rawMessage): IMessage {
  return {
    id: uuid4(),
    ...rawMessage,
    from,
    ts: new Date()
  }
}

const uuid4 = require('uuid/v4')
export const redis = redisjs.createClient(6379)
export const server = new http.Server(app)
export const io = socketIo(server)

io.on('connection', e.onConnection)
//
// io.on('connection', (socket => {
//   const pubKey = socket.handshake.query.pub_key
//   console.log('custom header: ', socket.handshake.headers['x-custom-header-for-my-project'])
//   socket.join(pubKey)
//
//   redis.keys(`${pubKey}:message:*`, function (err, ids) {
//     if (err) return console.error(err)
//
//     if (ids && ids.length !== 0) {
//       redis.mget(ids, function (err, messages) {
//         if (err) return console.error(err)
//
//         if (messages) {
//           socket.emit('message_list', messages.map(message => JSON.parse(message)))
//         }
//       })
//     }
//   })
//
//   socket.on('send_message', (rawMessage: rawMessage) => {
//     const message = Message(pubKey, rawMessage)
//     console.log('custom header: ', socket.handshake.headers['x-custom-header-for-my-project'])
//
//     redis.set(`${message.to}:message:${message.id}`, JSON.toString(message))
//     io.to(message.to).send('incoming_message', message)
//   })
//
//   socket.on('message', (message: rawMessage) => {
//     console.log('custom header: ', socket.handshake.headers['x-custom-header-for-my-project'])
//     console.log('New Message: ', JSON.toString(message))
//     const id = uuid4()
//     const newMessage: IMessage = { id, ...message, from: socket.handshake.query.pub_key, ts: new Date() }
//     redis.set(`${message.to}:message:${id}`, JSON.toString(newMessage), function (err) { if (err) console.log(err) })
//
//     io.to(message.to).emit('message', newMessage)
//   })
// }))

server.listen(PORT, (err: Error) => {
  if (err) {
    console.error(err)
  }

  console.log(`Server is listening to ${PORT}`)
})
