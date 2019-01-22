type rawMessage = {
  to: string
  body: string
}

interface IMessage {
  to: string
  from: string
  body: string
  ts: Date
}
