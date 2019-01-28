import aesjs from 'aes-js'

export class AES256 {
  readonly key: Uint8Array

  private _aesCtr: aesjs.ModeOfOperation.ModeOfOperationCTR

  static encrypt = function (hexKey: string, text: string) {
    const key = aesjs.utils.hex.toBytes(hexKey)
    const textBytes = aesjs.utils.utf8.toBytes(text)
    const aesCtr = new aesjs.ModeOfOperation.ctr(key)
    const encryptedBytes = aesCtr.encrypt(textBytes)
    return aesjs.utils.hex.fromBytes(encryptedBytes)
  }

  static decrypt = function (hexKey: string, encryptedText: string) {
    const key = aesjs.utils.hex.toBytes(hexKey)
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedText)
    const aesCtr = new aesjs.ModeOfOperation.ctr(key)
    const decryptedBytes = aesCtr.decrypt(encryptedBytes)
    return aesjs.utils.utf8.fromBytes(decryptedBytes)
  }

  constructor (hexKey: string) {
    this.key = aesjs.utils.hex.toBytes(hexKey)
    this._aesCtr = new aesjs.ModeOfOperation.ctr(this.key)
  }

  encrypt = (text: string) => {
    const textBytes = aesjs.utils.utf8.toBytes(text)
    const encryptedBytes = this._aesCtr.encrypt(textBytes)
    return aesjs.utils.hex.fromBytes(encryptedBytes)
  }

  decrypt = (encryptedText: string) => {
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedText)
    const decryptedBytes = this._aesCtr.decrypt(encryptedBytes)
    return aesjs.utils.utf8.fromBytes(decryptedBytes)
  }
}
