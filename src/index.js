const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server, {maxHttpBufferSize: 1e7}) // 10 MB

const {
  addRoom,
  addParticipantToRoom,
  removeParticipantFromRoom
} = require('./controller/room.controller')
const { storeAsset } = require('./controller/assets.controller')

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
          callback(msg_obj.roomRef)
        }
        break
      case 'chat':
        if (msg_obj.contentType == 'text') {
          io.to(msg_obj.roomId).emit('message', msg)
        } else {
          storeAsset(msg_obj.content, (url) => {
            io.to(msg_obj.roomId).emit('message', JSON.stringify({
              type: 'chat',
              content: url,
              sender: msg_obj.sender,
              roomId: msg_obj.roomId,
              fileName: msg_obj.fileName,
              createdAt: msg_obj.createdAt,
              contentType: msg_obj.contentType,
            }))
          })
        }
        break
      case 'hang-up':
        socket.leave(msg_obj.roomId)
        removeParticipantFromRoom(msg_obj.roomRef, msg_obj.sender, () => {
          socket.broadcast.to(msg_obj.roomId).emit('message', msg)
        })
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