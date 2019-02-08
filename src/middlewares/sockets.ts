import { ISocket } from '../middlewares/events'
import { io, redis } from '../index'
import { callback, cipher, events as e, validateHexKey } from '../utils'
import { Message, Status, rawMessage, IMessageJSON, IMessage } from '../utils/message'
import { Packet } from 'socket.io'
import { NextFunction } from 'express'
import { model as User } from '../services/user'
import uuid4 = require('uuid/v4')

export * from './emit'

export function onMessageSend (raw: rawMessage, cb: callback) {
  const socket = this.socket as ISocket
  const now = new Date().toISOString()
  const message = {
    ...raw,
    id: uuid4(),
    from: socket.publicKey,
    status: Status.SENT,
    createdAt: now,
    updatedAt: now
  }

  const key = `message:${message.id}`
  redis.hmset(key, message, (err: any) => {
    if (err) { return cb(err, undefined) }
  })
  redis.lpush(`${message.to}:messages`, key, (err: any) => {
    if (err) { return cb(err, undefined) }
  })
  redis.lpush(`${message.from}:messages`, key, (err: any) => {
    if (err) { return cb(err, undefined) }
  })

  io.to(message.to).emit(e.message.incoming, message)
  return cb(undefined, message)
}

export function onTyping (to: string) {
  const { publicKey } = this.socket as ISocket
  io.to(to).emit(e.message.typing, publicKey)
}

export function onDisconnect () {
  const socket = this.socket as ISocket
  redis.set(`${socket.publicKey}:online`, new Date().toISOString())
}

export function onMessageRead (messageIds: string[]) {
  const socket = this.socket as ISocket
  messageIds.map(id => {
    redis.hget(`message:${id}`, 'from', function (err, fromId) {
      if (err) { return console.log(err) }
      socket.to(fromId).emit(e.message.read, [id])
    })
    redis.hset(`message:${id}`, 'status', '3')
  })
}

export function onUserOnline (id: string) {
  const socket = this.socket as ISocket

  redis.get(`${id}:online`, function (err, time) {
    if (err) {
      console.log('Error onUserOnline, redis: ', err)
    }

    socket.emit(e.user.online, { id: id, time: time || undefined })
  })
}

export function packetLogger (packet: Packet, next: NextFunction) {
  const [event, ...args] = packet
  console.log(`event: "${event}", args: ${args}`)
  return next()
}

export function onMessageUpdate (message: IMessageJSON, cb: callback) {
  const socket = this.socket as ISocket

  if (message.from !== socket.publicKey) {
    return cb({ name: 'UNAUTHORIZED', code: 403 })
  } else {
    const updated = new Message({ ...message })
    redis.hmset(updated.redisKey, updated.toRedis(), function (err, res) {
      if (err) {
        return cb(err)
      } else {
        return cb(undefined, res)
      }
    })
  }
}

export function onMessageRemove (id: string, cb: callback) {
  const socket = this.socket as ISocket

  redis.hgetall(`message:${id}`, function (err, message) {
    if (err) {
      return cb(err)
    }
    if (message.from !== socket.publicKey) {
      return cb({ name: 'NOT_AUTHORIZED', code: 403 })
    }
    redis.hdel(`message:${id}`, function (err) {
      return err ? cb(err) : cb(undefined, id)
    })
  })
}

export async function authMiddleware (socket: ISocket, next: NextFunction) {
  const publicKey = socket.handshake.query.pub_key
  const otp = socket.handshake.query.otp

  if (!(publicKey && validateHexKey(publicKey))) {
    console.log('Auth Error. Bad public Key value')
    socket.disconnect(true)
    return next({ name: 'AuthenticationError' })
  } else {
    let user
    try {
      user = await User.findById(publicKey)
    } catch (e) {
      console.log('Auth Error. User exception')
      socket.disconnect(true)
      return next(e)
    }

    if (!user) {
      console.log('Auth Error. No user found')
      socket.disconnect(true)
      return next({ name: 'AuthenticationError' })
    }

    if (otp !== user.generateOtp()) {
      console.log('Auth Error. Bad OTP value')
      socket.disconnect(true)
      return next({ name: 'AuthenticationError' })
    }

    socket.authorized = true
    socket.publicKey = publicKey
    socket.secret = cipher.computeSecret(publicKey, 'hex', 'hex')
    socket.join(publicKey)
    socket.user = user

    return next()
  }
}
