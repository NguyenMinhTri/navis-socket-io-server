const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
	  origin: ['*']
  }
});

const port = process.env.PORT || 3001;

const cors = require('cors')({ origin: true });
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        next();
    });
app.get('/socket-io', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
var bufferHeader = null;

io.on('connection', (socket) => {
	console.log("hello");
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
  socket.on('push-button', msg => {
    io.emit('push-button', msg);
  });
  socket.emit('welcome', socket.id);
  /* Presenter */
  socket.on('bufferHeader', function(packet){
      // Buffer header can be saved on server so it can be passed to new user
      bufferHeader = packet;
      socket.broadcast.emit('bufferHeader', packet);
    
  });

  // Broadcast the received buffer
  socket.on('stream', function(packet){
      socket.broadcast.emit('stream', packet);
      // speaker.writeFile([packet[0], ...another packet[0]...]);
  });

  // Send buffer header to new user
  socket.on('requestBufferHeader', function(){
      socket.emit('bufferHeader', bufferHeader);
  });
  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
  var room = socket.handshake['query']['r_var'];
  socket.join(room);
  socket.on('navis', function(msg){
    console.log("msg");
    io.to(room).emit('navis', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
