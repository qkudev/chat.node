import server from './server'

const port = parseInt(<string> process.env.PORT)

server.listen(port, () => {
  console.log(`server is listening to ${port}`)
})
