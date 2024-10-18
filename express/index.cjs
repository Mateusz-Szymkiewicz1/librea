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
    cb(null, '../public/user_uploads')
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
  try{
    parseInt(req.query.offset)
  }catch(e){
    res.send({ status: 0, text: "No matches found..."})
  }
  connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(DISTINCT ratings.rating), 0) AS suma_ocen, COUNT(DISTINCT reviews.id) AS ilosc_recenzji FROM books LEFT JOIN ratings ON ratings.book = books.id LEFT JOIN reviews ON reviews.book = books.id  WHERE books.id = ? GROUP BY books.id;`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating, users.prof FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) LEFT JOIN users ON users.login = reviews.user WHERE reviews.book = ? GROUP BY reviews.id ORDER BY reviews.id DESC LIMIT 50 OFFSET ${req.query.offset}`,[req.params.id], (err2, rows2, fields2) => {
        rows[0].reviews = rows2
        res.send(rows)
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/collection/:id', (req,res) => {
  connection.query(`SELECT collections.*, COUNT(likes.id) AS likes FROM collections LEFT JOIN likes ON collections.id = likes.collection WHERE collections.id = ? GROUP BY collections.id`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/tags', (req,res) => {
  connection.query(`SELECT * FROM tags`,[req.params.id], (err, rows, fields) => {
      res.send(rows[0])
  })
})

app.post('/user/:login', (req,res) => {
  connection.query(`SELECT login, prof FROM users WHERE users.login = ?`,[req.params.login], (err, rows, fields) => {
    if(rows && rows.length > 0){
      connection.query(`SELECT book, rating FROM ratings WHERE ratings.user = ?`,[req.params.login], (err2, rows2, fields2) => {
        if(rows2){
          rows[0].ratings = rows2
        }
      })
      connection.query(`SELECT * FROM collections WHERE collections.user = ?`,[req.params.login], (err4, rows4, fields4) => {
        if(rows4){
          rows[0].collections = rows4
        }
      })
      connection.query(`SELECT * FROM likes,reviews,books WHERE likes.user = ? AND likes.review = reviews.id AND books.id = ?;`,[req.params.login, req.body.book], (err5, rows5, fields5) => {
        if(rows5){
          rows[0].likes = rows5
        }
      })
      connection.query(`SELECT * FROM likes WHERE likes.user = ? AND likes.collection = ?`,[req.params.login, req.body.collection], (err6, rows6, fields6) => {
        if(rows6){
          rows[0].collections_likes = rows6
        }
      })
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) WHERE reviews.user = ? GROUP BY reviews.id ORDER BY reviews.id DESC`,[req.params.login], (err3, rows3, fields3) => {
        if(rows3){
          rows[0].reviews = rows3
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

app.post('/search', (req,res) => {
  let sort = "books.id ASC"
  if(req.body.sort == "author"){
    sort = "SUBSTRING_INDEX(TRIM(books.autor), ' ', -1) ASC"
  }
  if(req.body.sort == "title"){
    sort = "books.tytul ASC"
  }
  if(req.body.sort == "rating"){
    sort = "(SUM(ratings.rating)/COUNT(ratings.id)) DESC" 
  }
  let tag_query = ""
  if(req.body.tags.length > 0){
    tag_query = "AND books.tagi LIKE"
    req.body.tags.forEach((tag, i) => {
      if(i == req.body.tags.length-1){
        tag_query = tag_query+` '%${tag}%'`
      }else{
        tag_query = tag_query+` '%${tag}%' AND books.tagi LIKE`
      }
    })
  }
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE (tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%')) ${tag_query} GROUP BY books.id ORDER BY ${sort} LIMIT 50`,[req.body.search,req.body.search,req.body.search], (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/search_autocomplete/:search', (req,res) => {
  connection.query(`SELECT * FROM books WHERE tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%') LIMIT 6`,[req.params.search,req.params.search,req.params.search], (err, rows, fields) => {
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
  connection.query(`INSERT INTO users(login,haslo,email,prof) VALUES (?,?,?,"");`,[req.body.login,pass_hashed,req.body.email], (err, rows, fields) => {
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

app.post('/edit_review', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE reviews SET text = ?, spoiler = ? WHERE id = ?`,[req.body.text,req.body.spoiler,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_review', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM reviews WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/new_collection', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO collections (user,name,books,description) VALUES ('${req.session.user}',?,?,?);`,[req.body.name,req.body.books, req.body.desc], (err, rows, fields) => {
    res.json("done")
  })
})


app.post('/review_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,review) VALUES ('${req.session.user}',?);`,[req.body.review], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/review_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND review = ?`,[req.body.review], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_delete', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM collections WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_delete_book', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE collections SET books = ? WHERE id = ?;`,[JSON.stringify(req.body.books), req.body.collection], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_edit_info', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE collections SET name = ?, description = ? WHERE id = ?;`,[req.body.name,req.body.desc,req.body.collection], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,collection) VALUES ('${req.session.user}',?);`,[req.body.collection], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND collection = ?`,[req.body.collection], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/signout', (req,res) => {
  req.session.destroy()
  res.json("done")
})

app.post("/setProf", upload.single("img"), setProf);

function setProf(req, res) {
  if(!req.session.user) return
  connection.query(`UPDATE users SET prof = ? WHERE login = ?`,[req.file.filename, req.body.login], (err, rows, fields) => {
    res.json("done")
  })
}

app.post('/deleteProf', (req,res) => {
  if(!req.session.user) return
  fs.unlink('../public/user_uploads/'+req.body.img, (err) => {
    if (err) console.log("Was unable to delete the file")
  })
  connection.query(`UPDATE users SET prof = "" WHERE login = ?;`,[req.body.login], (err, rows, fields) => {
    res.json("done")
  })
})

app.listen(3000)