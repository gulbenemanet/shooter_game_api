const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;
const router = require('./routers/router');
const net = require('net');
const PORT2 = 12345;
const ADDRESS = '127.0.0.1';
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

// TCP sunucusu
const tcpServer = net.createServer((socket) => {
  clients.push(socket);
  console.log(`New connection: ${socket.remoteAddress}:${socket.remotePort}`);

  // Yeni oyuncunun bağlandığını tüm istemcilere bildir
  broadcast(`${socket.remoteAddress}:${socket.remotePort} joined the game.`, socket);

  socket.on('data', (data) => {
    const message = data.toString();
    console.log(`Received message: ${message}`);
    broadcast(message, socket);
  });

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
