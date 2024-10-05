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
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen, COUNT(reviews.id) AS ilosc_recenzji FROM books LEFT JOIN ratings ON ratings.book = books.id LEFT JOIN reviews ON reviews.book = books.id WHERE books.id = ?`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`SELECT * FROM reviews WHERE book = ? ORDER BY id DESC LIMIT 50`,[req.params.id], (err2, rows2, fields2) => {
        rows[0].reviews = rows2
        res.send(rows)
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.post('/review_rating', (req,res) => {
  connection.query(`SELECT rating FROM ratings WHERE user = ? AND book = ?`,[req.body.user, req.body.book], (err, rows, fields) => {
    if(rows && rows.length == 1){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.post('/user/:login', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT login, katalogi FROM users WHERE users.login = ?`,[req.params.login], (err, rows, fields) => {
    if(rows){
      connection.query(`SELECT book, rating FROM ratings WHERE ratings.user = ?`,[req.params.login], (err2, rows2, fields2) => {
        if(rows2){
          rows[0].ratings = rows2
          res.send(rows)
        }else{
          res.send(rows)
        }
      })
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

app.post('/rate', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM ratings WHERE user = '${req.session.user}' AND book = ?`,[req.body.book], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`UPDATE ratings SET rating = ? WHERE user = '${req.session.user}' AND book = ?;`,[req.body.rating,req.body.book], (err, rows, fields) => {
        res.json("done")
      })
    }else{
      connection.query(`INSERT INTO ratings (user,book,rating) VALUES ('${req.session.user}',?,?);`,[req.body.book,req.body.rating], (err, rows, fields) => {
        res.json("done")
      })
    }
  })
})

app.post('/review', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO reviews (user,book,text,spoiler) VALUES ('${req.session.user}',?,?,?);`,[req.body.book,req.body.text, req.body.spoiler], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/signout', (req,res) => {
  req.session.destroy()
  res.json("done")
})

app.listen(3000)