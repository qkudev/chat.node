import { io, redis } from './index'
import { Socket } from 'socket.io'
import { Message, validateHexKey, AES256 } from './utils'
import { model as User } from './services/user'
import { authenticator } from 'otplib'
import crypto from 'crypto'
import { cipher } from './utils/constants'

export async function onConnection (socket: Socket) {
  const pubKey: string | undefined = socket.handshake.query.pub_key

  if (!(pubKey && validateHexKey(pubKey))) {
    return socket.disconnect(true)
  }

  socket.once('authenticate', async (encryptedSecret: string) => {
    let user

    try {
      user = await User.findById(pubKey)
    } catch (e) {
      console.error(e)
      return socket.disconnect(true)
    }

    if (!user) {
      return socket.disconnect(true)
    }
    const secretHex = cipher.computeSecret(pubKey, 'hex', 'hex')
    const decrypted = AES256.decrypt(secretHex, encryptedSecret)
    if (decrypted !== user.otp) {
      return socket.disconnect(true)
    } else {
      socket.join(pubKey)

      redis.set(`${pubKey}:online`, 'online')
      redis.lrange(`${pubKey}:messages`, 0, -1, (err, messageKeys) => {
        if (err) {
          console.error('Error while retrieving message key list')
          socket.emit('message:list', undefined)
        }

        if (messageKeys) {
          redis.mget(messageKeys, (err, messageStrings) => {
            if (err) {
              console.error('Error while retrieving message key list')
              socket.emit('message:list', undefined)
            }

            const messages = messageStrings.map(messageString => Message.fromString(messageString))
            socket.emit('message:list', messages)
          })
        } else {
          socket.emit('message:list', {})
        }
      })

      socket.on('message:send', (rawMessage: rawMessage) => {
        const message = new Message({ ...rawMessage, from: pubKey })

        redis.set(message.redisKey, message.toString(), 'EX', message.ei)
        redis.lpush(`${message.to}.messages`, message.redisKey)

        socket.emit('message:send', message.toJSON())
        io.to(message.to).emit('message:incoming', message.toJSON())
      })

      socket.on('message:typing', (to: string) => {
        return io.to(to).emit('message:typing', pubKey)
      })

      socket.on('message:read', (messageId: string) => {
        redis.lrem(`${pubKey}:messages`, 0, messageId)
        redis.del(`message:${messageId}`)
      })

      socket.on('disconnect', () => {
        redis.set(`${pubKey}:online`, new Date().toISOString())
      })

      socket.on('user:online', userId => {
        redis.get(`${userId}:online`, function (err, time) {
          if (err) {
            console.error('Error while redis.get({userId}:online')
          }

          socket.emit('user:online', { id: userId, time: time || undefined })
        })
      })

      console.log('New connection: ', pubKey)
    }
  })
}
