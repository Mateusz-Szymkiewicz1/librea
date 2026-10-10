const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MySQLStore = require('connect-mysql')(session);

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true,
}));

app.use(session({
  secret: 'sesja',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 48,
  },
  store: new MySQLStore({
    config: {
      user: 'root',
      password: '',
      database: 'librea',
    },
    cleanup: true
  })
}));

app.use(require('./routes/public.cjs'));
app.use(require('./routes/auth.cjs'));
app.use(require('./routes/content.cjs'));
app.use(require('./routes/admin.cjs'));
app.use(require('./routes/uploads.cjs'));

app.listen(3000);
