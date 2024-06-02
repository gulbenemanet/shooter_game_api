const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Gamer = require('../models/gamer')
const Room = require('../models/rooms')
const Game = require('../models/games')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingUser = await Gamer.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Kullanıcı adı zaten mevcut' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur ve kaydet
    const user = new Gamer({ username, password: hashedPassword, email });
    const token = await jwt.sign({
      id: user._id
    }, 'supersecret', {
        expiresIn: '24h'
    })
    await user.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' + token });
  } catch (err) {
    res.status(500).json({ message: err});
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı kontrol et
    const user = await Gamer.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

    // res.json("Başarılı");
    res.status(201).json({ message: 'Başarılı' + token});
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' } + err);
  }
}

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy participants', 'username');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}

const postRooms = async (req, res) => {
  try {
    // const { name } = req.body;

    const room = new Room({
      name,
      createdBy: req.userId
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}

const oneRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate('createdBy participants', 'username');
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const updateOneRoom = async (req, res) => {
  try {
    const { name, status } = req.body;

    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    if (room.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Yetkisiz işlem' });
    }

    room.name = name || room.name;
    room.status = status || room.status;

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    if (!room.participants.includes(req.userId)) {
      room.participants.push(req.userId);
      await room.save();
    }

    res.json({ message: 'Odaya katıldınız' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    room.participants = room.participants.filter(
      participant => participant.toString() !== req.userId
    );

    await room.save();
    res.json({ message: 'Odadan ayrıldınız' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


const getGames = async (req, res) => {
  try {
    const games = await Game.find().populate('createdBy participants', 'username');
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni oyun oluşturma
const postGame =  async (req, res) => {
  try {
    const { name, settings } = req.body;

    const game = new Game({
      name,
      createdBy: req.userId,
      settings
    });

    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Belirli bir oyunun detaylarını alma
const getOneGame =  async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId).populate('createdBy participants', 'username');
    if (!game) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Belirli bir oyunun detaylarını güncelleme
const updateOneGame = async (req, res) => {
  try {
    const { name, settings } = req.body;

    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }

    if (game.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Yetkisiz işlem' });
    }

    game.name = name || game.name;
    game.settings = settings || game.settings;

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bir oyunu başlatma
const startGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }

    if (game.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Yetkisiz işlem' });
    }

    game.status = 'ongoing';
    await game.save();

    // WebSocket ile oyunun başladığını bildirme
    io.emit('gameUpdated', { gameId: req.params.gameId, status: 'ongoing', name: game.name });

    res.json({ message: 'Oyun başlatıldı' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bir oyuna katılma
const joinGame =  async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }
    if (game.participants.length >= 3) {
      return res.status(400).json({ message: 'Oyun dolu' });
    }
    if (!game.participants.includes(req.userId)) {
      game.participants.push(req.userId);
      await game.save();
      
      // WebSocket ile katılımı bildirme
      io.to(req.params.gameId).emit('userJoined', { userId: req.userId, gameId: req.params.gameId });
    }

    res.json({ message: 'Oyuna katıldınız' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bir oyundan ayrılma
const leaveGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Oyun bulunamadı' });
    }

    game.participants = game.participants.filter(
      participant => participant.toString() !== req.userId
    );

    await game.save();

    // WebSocket ile ayrılmayı bildirme
    io.to(req.params.gameId).emit('userLeft', { userId: req.userId, gameId: req.params.gameId });

    res.json({ message: 'Oyundan ayrıldınız' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// WebSocket bağlantısı
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  socket.on('joinGame', ({ gameId }) => {
    socket.join(gameId);
    console.log(`Kullanıcı oyun ${gameId}ya katıldı`);
  });

  socket.on('leaveGame', ({ gameId }) => {
    socket.leave(gameId);
    console.log(`Kullanıcı oyun ${gameId}dan ayrıldı`);
  });

  socket.on('sendGameUpdate', ({ gameId, update }) => {
    io.to(gameId).emit('gameUpdate', update);
  });

  socket.on('disconnect', () => {
    console.log('Bir kullanıcı bağlantısını kesti');
  });
});

// Oyunun durumu değiştiğinde tüm kullanıcılara bildir
io.on('gameUpdated', (data) => {
  io.emit('gameUpdated', data);
});

module.exports = {
  // rooms,
  register,
  login,
  getRooms,
  postRooms,
  oneRoom,
  updateOneRoom,
  joinRoom,
  leaveRoom,
  getGames,
  postGame,
  updateOneGame,
  getOneGame,
  startGame,
  leaveGame,
  joinGame
}