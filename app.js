var express = require('express');
var app = express();
var fs = require('fs')
var path = require('path')
var server = require('http').Server(app)
var io = require('socket.io')(server)

server.listen(process.env.PORT || 3000)

app.get('/rooms', function(req, res) {
  var roomList = Object.keys(rooms).map(function(key) {
    return rooms[key]
  })
  res.send(roomList)
})

var mediaPath = path.resolve(__dirname, 'media');

app.use('/media', express.static(mediaPath));

app.get('/files', function(req, res) {
  var files = [];
  fs.readdir(mediaPath, function(err, files) {
    res.send(files);
  });
});

var rooms = {}

io.on('connection', function(socket) {

  socket.on('create_room', function(room) {
    if (!room.key) {
      return
    }
    console.log('create room:', room)
    var roomKey = room.key
    rooms[roomKey] = room
    socket.roomKey = roomKey
    socket.join(roomKey)
  })

  socket.on('close_room', function(roomKey) {
    console.log('close room:', roomKey)
    delete rooms[roomKey]
  })

  socket.on('disconnect', function() {
    console.log('disconnect:', socket.roomKey)
    if (socket.roomKey) {
      delete rooms[socket.roomKey]
    }
  })

    
    socket.on('get_videos', function(roomKey) {
    console.log('join room:', roomKey)
    socket.join(roomKey)
  }) 


  socket.on('join_room', function(roomKey) {
    console.log('join room:', roomKey)
    socket.join(roomKey)
  })

  socket.on('comment', function(data) {
    console.log('comment:', data)
    io.to(data.roomKey).emit('comment', data)
  })

})

console.log('listening on port 3000...')