const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

const db = require('./src/database/models');
const mainRoutes = require('./src/routes/mainRoutes');

const app = express();

app.use(express.static (path.resolve(__dirname, 'public')))

app.set('view engine', 'ejs');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: false}))

app.use(express.json());
app.use(methodOverride('_method'));

db.sequelize
  .sync()
  .then(() => {
    console.log('Synchronized database tables');
  })
  .catch((error) => {
    console.error('Error at synchronized database tables', error);
  });

  app.use('/', mainRoutes);

app.listen(3002, () => console.log('Server running'));