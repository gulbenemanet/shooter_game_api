const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const router = require('./routers/router');
require('dotenv').config()
require('./config/database')
app.use('/', router);
const net = require('net');
const PORT2 = 12345;
const ADDRESS = '127.0.0.1';
let clients = [];


const server = net.createServer((socket) => {
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

server.listen(PORT2, ADDRESS, () => {
  console.log(`Socket listening on ${ADDRESS}:${PORT2}`);
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

