type rawMessage = {
  to: string
  body: string
}

interface IMessage {
  id: string
  to: string
  from: string
  body: string
  ts: Date
}

interface IMessageJSON {
  id: string
  to: string
  from: string
  body: string
  ts: string
}

interface MessageProps {
  to: string
  from: string
  body: string
}
