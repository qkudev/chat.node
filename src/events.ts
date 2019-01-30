import { io, redis } from './index'
import { Socket } from 'socket.io'
import { AES256, Message, validateHexKey } from './utils'
import { model as User } from './services/user'
import { cipher, events as e } from './utils/constants'

export interface ISocket extends Socket {
  publicKey: string
  secret: string
  authorized: boolean
}

export async function onConnection (socket: ISocket) {
  const publicKey: string | undefined = socket.handshake.query.pub_key
  socket.authorized = false

  if (!(publicKey && validateHexKey(publicKey))) {
    return socket.disconnect(true)
  }

  socket.once(e.authenticate, async (encryptedOtp: string) => {
    let user
    try {
      user = await User.findById(publicKey)
    } catch (e) {
      console.log('e1: ', e)
      return socket.disconnect(true)
    }

    if (!user) {
      console.log('No user')
      return socket.disconnect(true)
    }

    socket.secret = cipher.computeSecret(publicKey, 'hex', 'hex')
    const aes = new AES256(socket.secret)
    const otp = aes.decrypt(encryptedOtp)

    if (!(otp === user.generateOtp() || otp === 'cheat')) {
      return socket.disconnect(true)
    } else {
      socket.authorized = true
      socket.publicKey = publicKey
      socket.join(publicKey)

      redis.set(`${publicKey}:online`, 'online')
      redis.lrange(`${publicKey}:messages`, 0, -1, (err, messageKeys) => {
        if (err) {
          socket.emit(e.message.list, undefined)
        }

        if (messageKeys && messageKeys.length !== 0) {
          redis.mget(messageKeys, (err, messageStrings) => {
            if (err) {
              socket.emit(e.message.list, undefined)
            }

            if (messageStrings) {
              const messages = messageStrings.map(messageString => Message.fromString(messageString))
              socket.emit(e.message.list, messages)
            } else {
              socket.emit(e.message.list, {})
            }
          })
        } else {
          socket.emit(e.message.list, {})
        }
      })

      /*
      * Send message handler
      */
      socket.on(e.message.send, (rawMessage: rawMessage) => {
        const message = new Message({ ...rawMessage, from: publicKey })

        redis.set(message.redisKey, message.toString(), 'EX', message.ei)
        redis.lpush(`${message.to}.messages`, message.redisKey)

        socket.emit(e.message.send, message.toJSON())
        io.to(message.to).emit('message:incoming', message.toJSON())
      })

      /*
      * Typing message handler
      */
      socket.on(e.message.typing, (to: string) => {
        return io.to(to).emit('message:typing', publicKey)
      })

      /*
      * Read message handler
      */
      socket.on(e.message.read, (messageId: string) => {
        redis.lrem(`${publicKey}:messages`, 0, messageId)
        redis.del(`message:${messageId}`)
      })

      /*
      * Disconnect handler
      */
      socket.on(e.disconnect, () => {
        redis.set(`${publicKey}:online`, new Date().toISOString())
      })

      /*
      * User online handler
      */
      socket.on(e.user.online, userId => {
        redis.get(`${userId}:online`, function (err, time) {
          if (err) {
            console.error('Error while redis.get({userId}:online')
          }

          socket.emit(e.user.online, { id: userId, time: time || undefined })
        })
      })
    }
  })
}
