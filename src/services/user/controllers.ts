import { model as Key, IUser } from './model'
import { redis } from '../../index'

export async function create (value: string): Promise<IUser | undefined> {
  try {
    if (await Key.findOne({ _id: value })) return undefined

    return await Key.create({ _id: value })
  } catch (e) {
    throw e
  }
}

export function messageList (publicKey: string) {
  redis.keys(`${publicKey}:message:*`, function (err, ids) {
    if (err) throw err
    console.log('ids: ', ids)

    if (ids && ids.length !== 0) {
      redis.mget(ids, function (err, messageStrings) {
        if (err) throw err

        const messages = messageStrings.map(message => JSON.parse(message)) as IMessageJSON[]
        console.log('Messages: ', messages)
        return messages
      })
    } else {
      return []
    }
  })
}
