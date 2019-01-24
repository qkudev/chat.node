import { redis, io } from './index'
import { Socket } from 'socket.io'
import { Message } from './utils'

export function onConnection (socket: Socket) {
  const pubKey: string | undefined = socket.handshake.query.pub_key

  if (!pubKey) {
    return socket.disconnect(true)
  }
  socket.join(pubKey)

  redis.set(`${pubKey}:online`, 'online')
  redis.keys(`${pubKey}:message:*`, function (err, ids) {
    if (err) throw err

    if (ids && ids.length !== 0) {
      redis.mget(ids, function (err, messageStrings) {
        if (err) throw err

        let messageList = {} as any
        for (let message of messageStrings.map(message => JSON.parse(message)) as IMessageJSON[]) {
          if (!messageList[message.from]) {
            messageList[message.from] = []
          }

          messageList[message.from].push(message)
        }

        return socket.emit('message_list', messageList)
      })
    } else {
      return socket.emit('message_list', {})
    }
  })

  socket.on('send_message', (rawMessage: rawMessage) => {
    const message = new Message({ ...rawMessage, from: pubKey })

    redis.set(message.redisKey, message.toString(), 'EX', message.ei)

    socket.emit('send_message', message.toJSON())
    io.to(message.to).emit('incoming_message', message.toJSON())
  })

  socket.on('typing', (to: string) => {
    return io.to(to).emit('typing', pubKey)
  })

  socket.on('read', (messageId: string) => {
    redis.del(`${pubKey}:message:${messageId}`)
  })

  socket.on('disconnect', () => {
    redis.set(`${pubKey}:online`, new Date().toISOString())
  })

  socket.on('user_online', userId => {
    redis.get(`${userId}:online`, function (err, time) {
      if (err) {
        console.error('Error while redis.get({userId}:online')
        socket.emit('user_online', { id: userId, time: undefined })
      }

      socket.emit('user_online', { id: userId, time })
    })
  })

  console.log('New connection: ', pubKey)
}
