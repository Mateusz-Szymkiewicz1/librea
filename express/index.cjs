const express = require('express')
const session = require('express-session')
const mysql = require('mysql')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const multer = require("multer");
var crypto = require ("crypto")
var path = require ("path")
var fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../../photos')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const upload = multer({ storage: storage, limits: {fieldSize: 50*1024*1024} });
MySQLStore = require('connect-mysql')(session)
const app = express().use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(session({
  secret: "sesja",
  saveUninitialized: false,
  resave: false,
  cookie: { 
    maxAge: 1000*60*60*48,
  },
  store: new MySQLStore({
    config: {
      user: 'root', 
      password: '',
      database: 'librea',
    },
    cleanup: true
  }) 
}))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'librea'
})

app.get('/book/:id', (req,res) => {
  connection.query(`SELECT * FROM books WHERE id = ?`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/search/:search', (req,res) => {
  connection.query(`SELECT * FROM books WHERE tytul LIKE ? OR autor LIKE ? OR tagi LIKE ? LIMIT 50`,[req.params.search], (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/search_autocomplete/:search', (req,res) => {
  connection.query(`SELECT * FROM books WHERE tytul LIKE ? OR autor LIKE ? OR tagi LIKE ? LIMIT 10`,[req.params.search], (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.post('/register', (req,res) => {
  const pass = req.body.pass;
  const pass_hashed = bcrypt.hashSync(pass)
  connection.query(`INSERT INTO users(login,haslo,email,katalogi) VALUES (?,?,?,"[]");`,[req.body.login,pass_hashed,req.body.email], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/login', (req,res) => {
  if(req.session.user){
    return res.json(req.session.user)
  }
  connection.query(`SELECT * FROM users WHERE login = ?`,[req.body.login], (err, rows, fields) => {
    if(rows && rows.length == 1){
      if(bcrypt.compareSync(req.body.pass, rows[0].haslo)){
        req.session.user = rows[0].login
        res.send({status: 200})
      }else{
        res.send({ status: 0, text: "Niepoprawne dane logowania!"})
      }
    }else{
      res.send({ status: 0, text: "Niepoprawne dane logowania!"})
    }
  })
})


app.listen(3000)