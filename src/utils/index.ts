import { utils } from 'aes-js'

export const { hex, utf8 } = utils

export * from './aes256'
export * from './constants'
export { Message } from './message'

export type callback = (err: any | undefined, res?: any) => void

export const hexToBytes = hex.toBytes
export const utf8ToBytes = utf8.toBytes
export const bytesToHex = hex.fromBytes
export const bytesToUtf8 = utf8.fromBytes

// Returns true if string is hex-string and it's length is 64, false otherwise
export const validateHexKey = (key: string) => /[a-fA-F0-9]{64}$/.test(key)
