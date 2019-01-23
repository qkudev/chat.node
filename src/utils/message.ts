const uuidv4 = require('uuid')
import { redis } from '../index'

function saveMessage (message: IMessage) {
  redis.set(`message:${message.id}`, JSON.stringify(message))
}
