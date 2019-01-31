import { redis } from '..'
import { ISocket } from './events'
import { events as e } from '../utils'

export async function emitMessageList () {
  const socket = this.socket as ISocket

  redis.lrange(`${socket.publicKey}: messages`, 0, -1, (err, messageIds) => {
    if (err) {
      console.log('Message List error on redis.lrange')
      socket.emit(e.message.list, [])
    } else {

      let messages: any[] = []
      if (messageIds && messageIds.length !== 0) {
        for (let messageKey of messageIds) {
          redis.hgetall(messageKey, function (err, res) {
            if (err) {
              console.log('error hgetall')
            }
            messages.push(res || undefined)
          })
        }
        socket.emit(e.message.list, messages)
      } else {
        socket.emit(e.message.list, [])
      }
    }
  })
}
