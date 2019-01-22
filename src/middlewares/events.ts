import { Socket } from 'socket.io'

import * as utils from '../utils'
import { io, redis } from '..'

export function onConnection (socket: Socket) {
  if (!(socket.handshake.query.pub_key && utils.validateHexKey(socket.handshake.query.pub_key))) {
    socket.emit('error', 'Authorization error')
    return socket.disconnect(true)
  }

  let pubKey = socket.handshake.query.pub_key
  socket.join(pubKey)

  redis.llen(`${pubKey}:messages`, function (err, len) {
    if (err) {
      console.error(err)
    }

    if (len && len > 0) {
      redis.lrange(`${pubKey}:messages`, 0, len - 1, function (err, messages) {
        if (err) {
          console.error(err)
        }

        if (messages) {
          socket.emit('messages', messages)
        }
      })
    }
  })

  socket.on('message', (message: rawMessage) => {
    let newMessage: IMessage = {
      ...message,
      from: socket.handshake.query.pub_key,
      ts: new Date()
    }

    redis.lpush(`${message.to}:messages`, JSON.stringify(newMessage))
    io.to(message.to).emit('message', newMessage)
  })

  console.log('New connection: ', pubKey)
}

io.on('connection', onConnection)
