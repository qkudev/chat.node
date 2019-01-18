import express from 'express'

import router from './router'

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.use('/api/v1', router)

export default server
