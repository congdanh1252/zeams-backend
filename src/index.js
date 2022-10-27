const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server)

const { addRoom, addParticipantToRoom } = require('./controller/room.controller')

const port = process.env.PORT || 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello Zeams!')
})

io.on('connection', (socket) => {
  console.log('A user connected to io')

  socket.on('message', (msg) => {
    const msg_obj = JSON.parse(msg)
    switch (msg_obj.type) {
      case 'join':
        const callback = (docId) => {
          socket.join(msg_obj.roomId)
          addParticipantToRoom(docId, msg_obj.data.sender, (participants) => {
            socket.emit('message', JSON.stringify({
              type: msg_obj.type,
              data: {
                docRef: docId,
                participants: participants,
                receiver: msg_obj.data.sender
              }
            }))
            console.log('User joined room ' + msg_obj.roomId)
          })
        }
        if (msg_obj.create != null && msg_obj.create) {
          addRoom(msg_obj.roomId, callback)
        } else {
          callback()
        }
        break
      case 'hang-up':
        socket.leave(msg_obj.roomId)
        socket.broadcast.to(msg_obj.roomId).emit('message', msg)
        break
      default:
        socket.broadcast.to(msg_obj.roomId).emit('message', msg)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(port, () => {
  console.log('Listen to Zeams Backend from port 3001!')
})