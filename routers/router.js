const express = require('express');
const api = require('../controllers/apiController');
const auth = require('../middlewares/auth');
const router = express.Router();


router.get('/', (req, res) => {
    res.json('ok');
})
// router.get('/rooms', api.rooms)
router.post('/register', api.register)
router.post('/login', api.login)
router.get('/api/rooms', api.getRooms)
router.get('/api/gamers', api.getUsers)
router.post('/api/rooms/create', api.postRooms)
router.get('/api/oneRoom/:roomId', api.oneRoom)
router.put('/api/rooms/:roomId', api.updateOneRoom)
// router.post('/api/rooms/join', api.joinRoom)
router.post('/api/rooms/join', (req, res) => {
    req.io = req.app.get('io');
    api.joinRoom(req.io, req, res);
  });
router.post('/api/rooms/:roomId/leave', api.leaveRoom)
router.get('/api/games', api.getGames)
router.post('/api/games/create', api.postGame)
router.get('/api/games/:gameId', api.oneRoom)
router.put('/api/games/:gameId', api.updateOneGame)
router.post('/api/games/:gameId/start', api.startGame)
router.post('/api/rooms/:gameId/join', api.joinGame)
router.post('/api/games/:gameId/leave', api.leaveGame)

module.exports = router;