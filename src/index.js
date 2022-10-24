const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello Zeams!')
})

io.on('connection', (socket) => {
  console.log('A user connected to io')

  socket.on('message', (msg) => {
    socket.broadcast.emit('message', msg)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})
// io.listen(3001)
server.listen(port, () => {
  console.log('Listen to Zeams Backend from port 3001!')
})