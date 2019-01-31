import { Socket } from 'socket.io'

import { redis } from '..'
import { events as e, cipher, NODE_ENV, validateHexKey } from '../utils'
import { IUser, model as User } from '../services/user'
import * as s from './sockets'

export interface ISocket extends Socket {
  publicKey: string
  secret: string
  authorized: boolean
  user: IUser | undefined
}

export async function onConnection (socket: ISocket) {
  if (NODE_ENV === 'development') {
    socket.use(s.packetLogger)
  }

  const publicKey = socket.handshake.query.pub_key
  const otp = socket.handshake.query.otp
  let user

  if (!(publicKey && validateHexKey(publicKey))) {
    console.log('Auth Error. Invalid public key value')
    socket.disconnect(true)
    return
  }

  try {
    user = await User.findById(publicKey)
  } catch (e) {
    console.log('Auth Error. User exception')
  }

  if (!(user && otp === user.generateOtp())) {
    console.log('Auth Error. No user found or bad OTP value')
    console.log('OTPs | user: ', otp, '| server: ', user && user.generateOtp())
    socket.disconnect(true)
    return
  }

  socket.authorized = true
  socket.publicKey = publicKey
  socket.secret = cipher.computeSecret(publicKey, 'hex', 'hex')
  socket.user = user
  socket.join(publicKey)

  redis.set(`${publicKey}:online`, 'online')
  s.emitMessageList.bind({ socket })()

  socket.on(e.message.send, s.onMessageSend.bind({ socket }))
  socket.on(e.message.update, s.onMessageUpdate.bind({ socket }))
  socket.on(e.message.remove, s.onMessageRemove.bind({ socket }))
  socket.on(e.message.read, s.onMessageRead)
  socket.on(e.message.typing, s.onTyping.bind({ socket }))
  socket.on(e.disconnect, s.onDisconnect.bind({ socket }))
  socket.on(e.user.online, s.onUserOnline.bind({ socket }))

  socket.on('kek', (lel: any, fn: Function) => {
    fn(lel + ' ahahahahahah')
  })
}
