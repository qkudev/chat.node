export const crypto = require('crypto')

export const HOST = process.env.HOST || 'localhost'
export const PORT = parseInt(process.env.PORT as string, 10) || 5000

export const PRIME = process.env.PRIME as string
export const GENERATOR = process.env.GENERATOR as string
export const PRIME_LENGTH = parseInt(process.env.PRIME_LENGTH as string, 10) || 2048

export const PUBLIC_KEY = process.env.PUBLIC_KEY as string
export const PRIVATE_KEY = process.env.PRIVATE_KEY as string
export const ENCODING = process.env.ENCODING as string

export const base64 = 'base64'
export const hex = 'hex'

export const cipher = crypto.createDiffieHellman(PRIME, 'hex', GENERATOR, 'hex')
cipher.setPublicKey(PUBLIC_KEY, hex)
cipher.setPrivateKey(PRIVATE_KEY, hex)

export const DAY = 60 * 60 * 24

export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)
