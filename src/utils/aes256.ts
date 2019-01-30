import { ModeOfOperation, utils } from 'aes-js'

const { hex, utf8 } = utils
const { ctr } = ModeOfOperation

export class AES256 {
  readonly key: Uint8Array

  private _aesCtr: ModeOfOperation.ModeOfOperationCTR

  static encrypt = function (hexKey: string, text: string): string {
    const key = hex.toBytes(hexKey)
    const textBytes = utf8.toBytes(text)
    const encryptedBytes = new ctr(key).decrypt(textBytes)
    return hex.fromBytes(encryptedBytes)
  }

  static decrypt = function (hexKey: string, encryptedText: string): string {
    const key = hex.toBytes(hexKey)
    const encryptedBytes = hex.toBytes(encryptedText)
    const decryptedBytes = new ctr(key).decrypt(encryptedBytes)
    return utf8.fromBytes(decryptedBytes)
  }

  constructor (hexKey: string) {
    this.key = hex.toBytes(hexKey)
    this._aesCtr = new ctr(this.key)
  }

  encrypt = (text: string) => {
    const textBytes = utf8.toBytes(text)
    const encryptedBytes = this._aesCtr.encrypt(textBytes)
    return hex.fromBytes(encryptedBytes)
  }

  decrypt = (encryptedText: string) => {
    const encryptedBytes = hex.toBytes(encryptedText)
    const decryptedBytes = this._aesCtr.decrypt(encryptedBytes)
    return utf8.fromBytes(decryptedBytes)
  }
}
