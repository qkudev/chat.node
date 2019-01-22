import { model as Key, IUser } from './model'

export async function create (value: string): Promise<IUser | undefined> {
  try {
    if (await Key.findOne({ _id: value })) return undefined

    return await Key.create({ _id: value })
  } catch (e) {
    throw e
  }
}
