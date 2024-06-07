const apiController = require('./apiController');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinRoom', (data) => {
      apiController.joinRoom(io, data);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });
  });
};
