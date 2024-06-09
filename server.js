const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;
const router = require('./routers/router');
const net = require('net');
const PORT2 = 12345;
const ADDRESS = 'localhost';
let clients = [];

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require('dotenv').config();
require('./config/database');

// HTTP server oluşturma
const server = http.createServer(app);

// Socket.IO örneğini oluşturma
const io = socketIo(server, {
  cors: {
    origin: '*', // İhtiyacınıza göre ayarlayın
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// Route'lara io'yu ekleme
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/', router);

let players = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('update', data => {
    players[socket.id] = data;
    socket.broadcast.emit('players', players);
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
        socket.broadcast.emit('players', players);
  });

  // socket.emit('news', { hello: 'world' });
  socket.on('data', (data) => {
    console.log(data);
  })

  socket.emit('players', players);
  socket.emit('gameUpdated', "xdxd");

});

// TCP sunucusu
const tcpServer = net.createServer((socket) => {
  clients.push(socket);
  console.log(`New connection: ${socket.remoteAddress}:${socket.remotePort}`);
  
  socket.isAlive = true;
  socket.on('data', (data) => {
    socket.isAlive = true; // Heartbeat mesajı alındığında bağlantının aktif olduğunu belirt
    const message = data.toString();
    console.log(`Received message: ${message}`);
    broadcast(message, socket);
  });

  const interval = setInterval(() => {
    if (!socket.isAlive) {
      console.log(`Connection lost: ${socket.remoteAddress}:${socket.remotePort}`);
      socket.destroy();
      clearInterval(interval);
      clients = clients.filter(client => client !== socket);
      broadcast(`${socket.remoteAddress}:${socket.remotePort} left the game.`, socket);
    }
    socket.isAlive = false;
    socket.write('PING');
  }, 10000); // 10 saniyede bir heartbeat kontrolü

  socket.on('end', () => {
    console.log(`Connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
    clients = clients.filter(client => client !== socket);
    // Oyuncunun ayrıldığını tüm istemcilere bildir
    broadcast(`${socket.remoteAddress}:${socket.remotePort} left the game.`, socket);
  });

  socket.on('error', (err) => {
    console.error(`Error: ${err.message}`);
  });
});

const broadcast = (message, sender) => {
  clients.forEach(client => {
    if (client !== sender) {
      client.write(message);
    }
  });
};

// TCP sunucusunu başlatma
tcpServer.listen(PORT2, ADDRESS, () => {
  console.log(`Socket listening on ${ADDRESS}:${PORT2}`);
});

// HTTP sunucusunu başlatma
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
