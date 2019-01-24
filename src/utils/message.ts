import { io, redis } from '../index'
import { DAY } from './constants'

const uuid4 = require('uuid/v4')

export class Message {
  private io = io

  readonly id: string
  readonly to: string
  readonly from: string

  readonly body: string
  readonly ts: Date
  readonly ei: number

  readonly redisKey: string

  constructor (props: MessageProps) {
    this.id = uuid4()
    this.ts = new Date()

    this.body = props.body
    this.from = props.from
    this.to = props.to
    this.ei = props.ei || 3 * DAY

    this.redisKey = `${this.to}:message:${this.id}`
  }

  toJSON = (): IMessageJSON => ({
    id: this.id,
    to: this.to,
    from: this.from,
    body: this.body,
    ts: this.ts.toISOString(),
    ei: this.ei
  })

  toString = (): string => JSON.stringify(this.toJSON())

}
