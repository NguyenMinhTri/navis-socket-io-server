const app = require('express')();
const http = require('http').Server(app);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const io = require('socket.io')(http, {
  cors: {
	  origin: ['*']
  }
});
const { io : ioClient } = require("socket.io-client");
const port = process.env.PORT || 3001;

const cors = require('cors')({ origin: true });
app.use(cors);

app.get('/socket-io', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/api/testnoti2', (req, res) => {
  console.log('api/testnoti');
  io.sockets.emit(req.query.device, "hello world");
  res.status(200).send("ok");
});

app.post('/api/notification',jsonParser, (req, res) => {
  console.log('api/noti');
  console.log(req.body)
  let deviceId = req.body.status;
  let title = req.body.title;
  let content = req.body.body;
  io.sockets.emit(deviceId, JSON.stringify({
    deviceId:deviceId,
    title:title,
    content:content
  }));
  res.status(200).send("ok");
});

var bufferHeader = null;
io.on('connection', (socket) => {
	console.log("hello", socket.id);
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
