import { io, redis } from '../index'
import { DAY } from './constants'
import { RedisClient } from 'redis'
const uuid4 = require('uuid/v4')

export enum Status { 'ERROR', 'LOADING', 'SENT', 'READ' }

export type rawMessage = {
  to: string
  from: string

  body: string
  status: typeof Status.LOADING | typeof Status.ERROR
  ei: number
}

export interface IMessage {
  id: string

  to: string
  from: string
  body: string

  status: Status
  createdAt: Date
  updatedAt: Date
  ei: number
}

export interface IMessageJSON {
  id: string | undefined
  to: string
  from: string
  body: string

  status: Status
  createdAt: Date
  updatedAt: Date
  ei: number
}

export interface MessageProps {
  id?: string

  to: string
  from: string
  body: string

  status: Status
  createdAt?: Date
  updatedAt?: Date
  ei?: number
}

export class Message {
  public static readonly io = io
  public static readonly redis: RedisClient = redis

  readonly id: string | undefined
  readonly to: string
  readonly from: string
  readonly body: string

  private _status: Status
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly ei: number

  constructor (props: MessageProps) {
    const { redis } = Message
    const now = new Date()

    this.id = props.id || uuid4()
    this.to = props.to
    this.from = props.from
    this.body = props.body

    this.createdAt = props.createdAt || now
    this.updatedAt = props.updatedAt || now
    this.ei = props.ei || 3 * DAY

    if (props.status !== Status.LOADING) {
      this._status = props.status
    } else {
      this._status = Status.SENT

      redis.hmset(this.redisKey, this.toRedis(), (err) =>
        err ? this._status = Status.ERROR : undefined)
      redis.lpush(`${this.to}:messages`, this.toRedis(), (err) =>
        err ? this._status = Status.ERROR : undefined)
      redis.lpush(`${this.from}:messages`, this.toRedis(), (err) =>
        err ? this._status = Status.ERROR : undefined)
    }
  }

  toJSON = (): IMessageJSON => ({
    id: this.id || undefined,
    to: this.to,
    from: this.from,
    body: this.body,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ei: this.ei
  })

  toRedis = (): any => ({
    id: this.id || undefined,
    to: this.to,
    from: this.from,
    body: this.body,
    status: this.status,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
    ei: this.ei
  })

  get redisKey () { return `message:${this.id}` }

  get status () { return this._status }
  set status (stat) {
    if (stat === Status.ERROR || stat === Status.LOADING || stat === Status.SENT || stat === Status.READ) {
      this._status = stat
    } else {
      throw new Error('BadMessageStatusError')
    }
  }

  public static getById = (id: string) => {
    return redis.hgetall(`message:${id}`, function (err, res) {
      if (err) {
        throw err
      }
      return res
    })
  }
}

// const msg = Message.getById()

// const message = new Message({ to: 'kek', from: 'lel', body: '123', status: Status.LOADING })
