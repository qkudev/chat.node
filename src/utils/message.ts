import { io } from '../index'
import { DAY } from './constants'

const uuid4 = require('uuid/v4')

export class Message {
  private io = io

  static fromString = function (messageString: string): IMessageJSON {
    return JSON.parse(messageString)
  }

  readonly id: string
  readonly to: string
  readonly from: string

  readonly body: string
  readonly ts: Date
  readonly ei: number
  readonly status: 'ERROR' | 'SENT' | 'READ' | 'DELIVERED'

  readonly redisKey: string

  constructor (props: MessageProps) {
    this.id = uuid4()
    this.ts = new Date()

    this.body = props.body
    this.from = props.from
    this.to = props.to
    this.ei = props.ei || 3 * DAY
    this.status = 'SENT'

    this.redisKey = `message:${this.id}`
  }

  toJSON = (): IMessageJSON => ({
    id: this.id,
    to: this.to,
    from: this.from,
    body: this.body,
    ts: this.ts.toISOString(),
    ei: this.ei,
    status: this.status
  })

  toString = (): string => JSON.stringify(this.toJSON())

}
