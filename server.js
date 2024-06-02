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

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

