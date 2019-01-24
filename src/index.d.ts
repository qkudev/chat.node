type rawMessage = {
  to: string
  body: string
  ei?: number
}

interface IMessage {
  id: string
  to: string
  from: string
  body: string
  ts: Date
  ei: number
}

interface IMessageJSON {
  id: string
  to: string
  from: string
  body: string
  ts: string
  ei: number
}

interface MessageProps {
  to: string
  from: string
  body: string
  ei?: number
}
