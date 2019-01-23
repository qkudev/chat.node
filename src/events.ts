import { redis, io } from './index'
import { Socket } from 'socket.io'
import * as User from './services/user'

const uuid4 = require('uuid/v4')

class Message {
  static io = io

  readonly id: string
  readonly body: string
  readonly to: string
  readonly from: string
  readonly ts: Date

  constructor (props: MessageProps) {
    this.id = uuid4()
    this.body = props.body
    this.from = props.from
    this.to = props.to
    this.ts = new Date()
  }

  toJSON = (): IMessageJSON => ({
    id: this.id,
    to: this.to,
    from: this.from,
    body: this.body,
    ts: this.ts.toISOString()
  })

  toString = (): string => JSON.stringify(this.toJSON())
}

export function onConnection (socket: Socket) {
  const pubKey: string | undefined = socket.handshake.query.pub_key

  if (!pubKey) {
    // socket.emit('error', 'Authorization error')
    return socket.disconnect(true)
  }
  socket.join(pubKey)
  redis.keys(`${pubKey}:message:*`, function (err, ids) {
    if (err) throw err

    if (ids && ids.length !== 0) {
      redis.mget(ids, function (err, messageStrings) {
        if (err) throw err

        const messages = messageStrings.map(message => JSON.parse(message)) as IMessageJSON[]
        let messageList = {} as any
        for (let message of messages) {
          if (!messageList[message.from]) {
            messageList[message.from] = []
          }
          messageList[message.from].push(message)
        }
        socket.emit('message_list', messageList)
      })
    } else {
      socket.emit('message_list', [])
    }
  })

  socket.on('send_message', (rawMessage: rawMessage) => {
    const message = new Message({ ...rawMessage, from: pubKey })

    redis.set(`${message.to}:message:${message.id}`, message.toString())

    socket.emit('send_message', message.toJSON())
    io.to(message.to).emit('incoming_message', message.toJSON())
  })

  socket.on('typing', (to: string) => {
    io.to(to).emit('typing', pubKey)
  })

  socket.on('read', (messageId: string) => {
    redis.del(`${pubKey}:message:${messageId}`)
  })

  console.log('New connection: ', pubKey)
}
