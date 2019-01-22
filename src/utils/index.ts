import * as C from './constants'

export const constants = C

// Returns true if string is hex-string and it's length is 512, false otherwise
export function validateHexKey (key: string): boolean {
  return /[a-fA-F0-9]{512}$/.test(key)
}

export function Message (to: string, from: string, body: string) {
  return {
    to,
    from,
    body,
    ts: new Date()
  }
}
