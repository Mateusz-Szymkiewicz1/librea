const express = require('express')
const session = require('express-session')
const mysql = require('mysql')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const multer = require("multer");
var crypto = require ("crypto")
var path = require ("path")
var fs = require('fs');
const profs_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/user_uploads/profs')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const covers_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/user_uploads/covers')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const books_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const waiting_authors_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/user_uploads/authors')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const authors_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads/authors')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const blog_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads/blog')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
const profs_upload = multer({ storage: profs_storage, limits: {fieldSize: 50*1024*1024} });
const covers_upload = multer({ storage: covers_storage, limits: {fieldSize: 50*1024*1024} });
const books_upload = multer({ storage: books_storage, limits: {fieldSize: 50*1024*1024} });
const waiting_authors_upload = multer({ storage: waiting_authors_storage, limits: {fieldSize: 50*1024*1024} });
const authors_upload = multer({ storage: authors_storage, limits: {fieldSize: 50*1024*1024} });
const blog_upload = multer({ storage: blog_storage, limits: {fieldSize: 50*1024*1024} });
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

app.post('/author/:id', (req,res) => {
  connection.query(`SELECT * FROM authors WHERE id = ?`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
    connection.query(`SELECT * FROM authors_aliases WHERE author = ?`,[req.params.id], (err2, rows2, fields2) => {
      rows[0].names = rows2.map(a => a.name);
      connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.autor IN (?) GROUP BY books.id WITH ROLLUP`,[rows[0].names], (err3, rows3, fields3) => {
        rows[0].books = rows3
        res.send(rows)
      })
    })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/book/:id', (req,res) => {
  try{
    parseInt(req.query.offset)
  }catch(e){
    res.send({ status: 0, text: "No matches found..."})
  }
  connection.query(`SELECT b.*, IFNULL(r.rating_count, 0) AS ilosc_ocen, IFNULL(r.rating_sum, 0) AS suma_ocen, IFNULL(rv.review_count, 0) AS ilosc_recenzji, IFNULL(q.quote_count, 0) AS ilosc_cytatow FROM books b LEFT JOIN ( SELECT book, COUNT(*) AS rating_count, SUM(rating) AS rating_sum FROM ratings GROUP BY book ) r ON r.book = b.id LEFT JOIN ( SELECT book, COUNT(*) AS review_count FROM reviews GROUP BY book ) rv ON rv.book = b.id LEFT JOIN ( SELECT book, COUNT(*) AS quote_count FROM quotes GROUP BY book ) q ON q.book = b.id WHERE b.id = ?`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating, users.prof FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) LEFT JOIN users ON users.login = reviews.user WHERE reviews.book = ? GROUP BY reviews.id ORDER BY reviews.id DESC LIMIT 15 OFFSET ${req.query.offset}`,[req.params.id], (err2, rows2, fields2) => {
        rows[0].reviews = rows2
        connection.query(`SELECT quotes.*, COUNT(likes.id) AS likes FROM quotes LEFT JOIN likes ON quotes.id = likes.quote WHERE quotes.book = ? GROUP BY quotes.id ORDER BY likes DESC LIMIT 5 OFFSET ${req.query.quote_offset}`,[req.params.id], (err3, rows3, fields3) => {
          rows[0].quotes = rows3
          connection.query(`SELECT * FROM authors_aliases WHERE name = ?`,[rows[0].autor], (err4, rows4, fields4) => {
            rows[0].author = rows4
            res.send(rows)
          })
        })
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/popular_books', (req,res) => {
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id HAVING ilosc_ocen > 0 ORDER BY ilosc_ocen DESC LIMIT 10`, (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
    }
  })
})

app.get('/new_books', (req,res) => {
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id ORDER BY books.id DESC LIMIT 10`, (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
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

app.post('/post/:id', (req,res) => {
  try{
    parseInt(req.query.offset)
  }catch(e){
    res.send({ status: 0, text: "No matches found..."})
  }
  connection.query(`SELECT posts.*, (SELECT COUNT(*) FROM likes WHERE likes.post = posts.id) AS likes, (SELECT COUNT(*) FROM comments WHERE comments.post = posts.id) AS numOfComments FROM posts WHERE posts.id = ?`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`SELECT comments.*, COUNT(likes.id) AS likes FROM comments LEFT JOIN likes ON likes.comment = comments.id WHERE comments.post = ? GROUP BY comments.id ORDER BY comments.date DESC LIMIT 2 OFFSET ${req.query.offset}`, [req.params.id], (err, commentRows) => {
        rows[0].comments = commentRows;
        res.send(rows)
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/recent_posts', (req,res) => {
  connection.query(`SELECT posts.* FROM posts ORDER BY date DESC LIMIT 10`,[req.params.id], (err, rows, fields) => {
    if(rows){
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
  let query = ""
  if(req.session.user != req.params.login){
    query = "AND collections.private = 0"
  }
  connection.query(`SELECT login, prof, admin, private FROM users WHERE users.login = ?`,[req.params.login], (err, rows, fields) => {
    if(rows && rows.length > 0){
      connection.query(`SELECT book, rating FROM ratings WHERE ratings.user = ?`,[req.params.login], (err2, rows2, fields2) => {
        if(rows2){
          rows[0].ratings = rows2
        }
      })
      connection.query(`SELECT * FROM collections WHERE collections.user = ? ${query}`,[req.params.login], (err4, rows4, fields4) => {
        if(rows4){
          rows[0].collections = rows4
        }
      })
      connection.query(`SELECT likes.* FROM likes LEFT JOIN reviews ON likes.review = reviews.id LEFT JOIN quotes ON likes.quote = quotes.id WHERE likes.user = ? AND ( ? IS NULL OR ((likes.review IS NOT NULL AND reviews.book = ?)OR (likes.quote IS NOT NULL AND quotes.book = ?)));`,[req.params.login, req.body.book,req.body.book,req.body.book], (err5, rows5, fields5) => {
        if(rows5){
          rows[0].likes = rows5
        }
      })
      connection.query(`SELECT * FROM likes WHERE likes.user = ? AND likes.collection = ?`,[req.params.login, req.body.collection], (err6, rows6, fields6) => {
        if(rows6){
          rows[0].collections_likes = rows6
        }
      })
      connection.query(`SELECT quotes.*, COUNT(likes.id) AS likes FROM quotes LEFT JOIN likes ON quotes.id = likes.quote WHERE quotes.user = ? AND quotes.book = ? GROUP BY quotes.id ORDER BY quotes.id DESC`,[req.params.login,req.body.book], (err7, rows7, fields7) => {
        if(rows7){
          rows[0].quotes = rows7
        }
      })
      connection.query(`SELECT comments.*, COUNT(likes.id) AS likes FROM comments LEFT JOIN likes ON comments.id = likes.comment WHERE comments.user = ? AND comments.post = ? GROUP BY comments.id ORDER BY comments.id DESC`,[req.params.login,req.body.post], (err8, rows8, fields8) => {
        if(rows8){
          rows[0].comments = rows8
        }
      })
      connection.query(`SELECT * FROM notes WHERE user = ? AND book = ?`,[req.params.login,req.body.book], (err9, rows9, fields9) => {
        if(rows9){
          rows[0].notes = rows9
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

app.post('/change_login', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT login FROM users WHERE users.login = ?`,[req.body.new_login], (err, rows, fields) => {
    if(rows.length == 0){
      connection.query(`UPDATE users SET login = ? WHERE login = ?;`,[req.body.new_login,req.session.user], (err2, rows2, fields2) => {
        res.json("done")
      })
    }else{
      res.json("Username is taken!")
    }
  })
})

app.post('/change_password', (req,res) => {
  if(!req.session.user) return
  const pass = req.body.new_pass;
  const pass_hashed = bcrypt.hashSync(pass)
  connection.query(`UPDATE users SET haslo = ? WHERE login = ?;`,[pass_hashed,req.session.user], (err2, rows2, fields2) => {
    res.json("done")
  })
})

app.post('/search', (req,res) => {
  let sort = `books.id ${req.body.direction}`
  if(req.body.sort == "author"){
    sort = `SUBSTRING_INDEX(TRIM(books.autor), ' ', -1) ${req.body.direction}`
  }
  if(req.body.sort == "title"){
    sort = `books.tytul ${req.body.direction}`
  }
  if(req.body.sort == "rating"){
    sort = `(SUM(ratings.rating)/COUNT(ratings.id)) ${req.body.direction}` 
  }
  if(req.body.sort == "popularity"){
    sort = `(COUNT(ratings.id)) ${req.body.direction}` 
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
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE (tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%')) ${tag_query} GROUP BY books.id ORDER BY ${sort} LIMIT 15 OFFSET ${req.body.offset}`,[req.body.search,req.body.search,req.body.search], (err, rows, fields) => {
    if(rows && rows.length > 0){
      connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE (tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%')) ${tag_query} GROUP BY books.id`,[req.body.search,req.body.search,req.body.search], (err2, rows2, fields2) => {
        rows.unshift({ resultsCount: rows2.length })
        res.send(rows)
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.post('/tag/:tag', (req,res) => {
  let sort = `books.id ${req.body.direction}`
  if(req.body.sort == "author"){
    sort = `SUBSTRING_INDEX(TRIM(books.autor), ' ', -1) ${req.body.direction}`
  }
  if(req.body.sort == "title"){
    sort = `books.tytul ${req.body.direction}`
  }
  if(req.body.sort == "rating"){
    sort = `(SUM(ratings.rating)/COUNT(ratings.id)) ${req.body.direction}` 
  }
  if(req.body.sort == "popularity"){
    sort = `(COUNT(ratings.id)) ${req.body.direction}` 
  }
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.tagi LIKE '%${req.body.tag}%' GROUP BY books.id ORDER BY ${sort} LIMIT 15 OFFSET ${req.body.offset}`,[], (err, rows, fields) => {
    if(rows && rows.length > 0){
      connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.tagi LIKE '%${req.body.tag}%' GROUP BY books.id`,[], (err2, rows2, fields2) => {
        rows.unshift({ resultsCount: rows2.length })
        res.send(rows)
      })
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
  connection.query(`SELECT * FROM banned WHERE email = ?;`,[req.body.email], (err, rows, fields) => {
    if(rows.length > 0){
      res.send({ status: 0, text: "Username with this e-mail is banned!"})
      return;
    }
  connection.query(`SELECT login FROM users WHERE login = ?;`,[req.body.login], (err, rows, fields) => {
    if(rows.length > 0){
      res.send({ status: 0, text: "Username taken!"})
      return;
    }
    connection.query(`SELECT login FROM users WHERE email = ?;`,[req.body.email], (err, rows, fields) => {
      if(rows.length > 0){
        res.send({ status: 0, text: "E-mail already in use!"})
        return;
      }
      const pass = req.body.pass;
      const pass_hashed = bcrypt.hashSync(pass)
      connection.query(`INSERT INTO users(login,haslo,email,prof) VALUES (?,?,?,"");`,[req.body.login,pass_hashed,req.body.email], (err, rows, fields) => {
        res.json("done")
      })
    })
  })
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
        res.send({ status: 0, text: "Wrong username/password!"})
      }
    }else{
      res.send({ status: 0, text: "Wrong username/password!"})
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

app.post('/add_note', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO notes (user,book,text,page) VALUES ('${req.session.user}',?,?,?);`,[req.body.book,req.body.text, req.body.page], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/comment', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO comments (post,user,text) VALUES (?,'${req.session.user}',?);`,[req.body.post,req.body.text], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/report', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM reports WHERE user_reporting = '${req.session.user}' AND ${req.body.type} = ?`,[req.body.id], (err, rows, fields) => {
    if(rows.length == 0){
      connection.query(`INSERT INTO reports (user_reporting,date,${req.body.type}) VALUES ('${req.session.user}',NOW(),?);`,[req.body.id], (err, rows, fields) => {
        res.json("done")
      })
    }else{
      res.json("already reported")
    }
  })
})

app.post('/add_quote', (req,res) => {
  if(!req.session.user) return
  let quote = req.body.text
  if(quote[0] == '"' || quote[0] == "'"){
    quote = quote.substring(1)
  }
  if(quote[quote.length-1] == '"' || quote[quote.length-1] == "'"){
    quote = quote.substring(0, quote.length-1)
  }
  connection.query(`INSERT INTO quotes (user,book,text) VALUES ('${req.session.user}',?,?);`,[req.body.book,quote], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/edit_review', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE reviews SET text = ?, spoiler = ? WHERE id = ?`,[req.body.text,req.body.spoiler,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/edit_note', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE notes SET text = ?, page = ? WHERE id = ?`,[req.body.text,req.body.page,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/edit_comment', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE comments SET text = ? WHERE id = ?`,[req.body.text,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/change_visibility', (req,res) => {
  if(!req.session.user) return
  let status = req.body.change_to == "private" ? 1 : 0
  connection.query(`UPDATE users SET private = ? WHERE login = ?`,[status,req.session.user], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/edit_quote', (req,res) => {
  if(!req.session.user) return
  let quote = req.body.text
  if(quote[0] == '"' || quote[0] == "'"){
    quote = quote.substring(1)
  }
  if(quote[quote.length-1] == '"' || quote[quote.length-1] == "'"){
    quote = quote.substring(0, quote.length-1)
  }
  connection.query(`UPDATE quotes SET text = ? WHERE id = ?`,[quote,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_review', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM reviews WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_note', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM notes WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_comment', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM comments WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.get('/random_book', (req,res) => {
  connection.query(`SELECT * FROM books AS t1 JOIN (SELECT id FROM books ORDER BY RAND() LIMIT 1) as t2 ON t1.id=t2.id`, (err, rows, fields) => {
    res.send(rows)
  })
})

app.post('/delete_post', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT thumbnail,text FROM posts WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    if(rows[0]){
      if(rows[0].thumbnail){
        fs.unlink('../public/uploads/blog/'+rows[0].thumbnail, (err) => {
          if (err) console.log("Was unable to delete the file")
        })
      }
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(rows[0].text)) !== null) {
        const fileName = path.basename(match[1]); // extract just the file name
        fs.unlink(`../public/uploads/blog/${fileName}`, (err) => {
          if (err) console.log(`Unable to delete image: ${fileName}`);
        });
      }
    }
  })
  connection.query(`DELETE FROM posts WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_account', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM users WHERE login = ?`,[req.session.user], (err, rows, fields) => {
    req.session.destroy()
    res.json("done")
  })
})

app.post('/delete_quote', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM quotes WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/new_collection', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO collections (user,name,books,description,private) VALUES ('${req.session.user}',?,?,?,?);`,[req.body.name,req.body.books, req.body.desc,req.body.private], (err, rows, fields) => {
    res.json("done")
  })
})

function like_notification(user_session,type,user,id){
  if(user_session == user) return
  let text = `${user_session} has liked your ${type}.`
  connection.query(`INSERT INTO notifications (type,text,user,${type},like_from) VALUES ('like',?,?,?,?);`,[text,user,id,user_session], (err, rows, fields) => {})
}

function unlike_notification(user_session,type,user,id){
  if(user_session == user) return
  connection.query(`DELETE FROM notifications WHERE user = ? AND like_from = ? AND ${type} = ?`,[user,user_session,id], (err, rows, fields) => {})
}

app.post('/review_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,review) VALUES ('${req.session.user}',?);`,[req.body.review], (err, rows, fields) => {
    connection.query(`SELECT user FROM reviews WHERE reviews.id = ?`,[req.body.review], (err2, rows2, fields2) => {
      like_notification(req.session.user,"review",rows2[0].user,req.body.review)
      res.json("done")
    })
  })
})

app.post('/review_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND review = ?`,[req.body.review], (err, rows, fields) => {
    connection.query(`SELECT user FROM reviews WHERE reviews.id = ?`,[req.body.review], (err2, rows2, fields2) => {
      unlike_notification(req.session.user,"review",rows2[0].user,req.body.review)
      res.json("done")
    })
  })
})

app.post('/comment_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,comment) VALUES ('${req.session.user}',?);`,[req.body.comment], (err, rows, fields) => {
    connection.query(`SELECT user FROM comments WHERE comments.id = ?`,[req.body.comment], (err2, rows2, fields2) => {
      like_notification(req.session.user,"comment",rows2[0].user,req.body.comment)
      res.json("done")
    })
  })
})

app.post('/comment_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND comment = ?`,[req.body.comment], (err, rows, fields) => {
    connection.query(`SELECT user FROM comments WHERE comments.id = ?`,[req.body.comment], (err2, rows2, fields2) => {
      unlike_notification(req.session.user,"comment",rows2[0].user,req.body.comment)
      res.json("done")
    })
  })
})

app.post('/post_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,post) VALUES ('${req.session.user}',?);`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/post_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND post = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/quote_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,quote) VALUES ('${req.session.user}',?);`,[req.body.quote], (err, rows, fields) => {
    connection.query(`SELECT user FROM quotes WHERE quotes.id = ?`,[req.body.quote], (err2, rows2, fields2) => {
      like_notification(req.session.user,"quote",rows2[0].user,req.body.quote)
      res.json("done")
    })
  })
})

app.post('/quote_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND quote = ?`,[req.body.quote], (err, rows, fields) => {
    connection.query(`SELECT user FROM quotes WHERE quotes.id = ?`,[req.body.quote], (err2, rows2, fields2) => {
      unlike_notification(req.session.user,"quote",rows2[0].user,req.body.quote)
      res.json("done")
    })
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

app.post('/collection_add_book', (req,res) => {
  if(!req.session.user) return
  let books = []
  connection.query(`SELECT books FROM collections WHERE id = ?`,[req.body.collection], (err, rows, fields) => {
    books = [...JSON.parse(rows[0].books)]
    books.push({id: parseInt(req.body.book)})
    connection.query(`UPDATE collections SET books = ? WHERE id = ?;`,[JSON.stringify(books), req.body.collection], (err, rows, fields) => {
      res.json("done")
    })
  })
})

app.post('/collection_edit_info', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE collections SET name = ?, description = ?, private = ? WHERE id = ?;`,[req.body.name,req.body.desc,req.body.private,req.body.collection], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/collection_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,collection) VALUES ('${req.session.user}',?);`,[req.body.collection], (err, rows, fields) => {
    connection.query(`SELECT user FROM collections WHERE collections.id = ?`,[req.body.collection], (err2, rows2, fields2) => {
      like_notification(req.session.user,"collection",rows2[0].user,req.body.collection)
      res.json("done")
    })
  })
})

app.post('/collection_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND collection = ?`,[req.body.collection], (err, rows, fields) => {
    connection.query(`SELECT user FROM collections WHERE collections.id = ?`,[req.body.collection], (err2, rows2, fields2) => {
      unlike_notification(req.session.user,"collection",rows2[0].user,req.body.collection)
      res.json("done")
    })
  })
})

app.post('/delete_submission', (req,res) => {
  if(!req.session.user) return
  if(req.body.img){
    fs.unlink('../public/user_uploads/covers/'+req.body.img, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  connection.query(`DELETE FROM new_books WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_author_submission', (req,res) => {
  if(!req.session.user) return
  if(req.body.img){
    fs.unlink('../public/user_uploads/authors/'+req.body.img, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  connection.query(`DELETE FROM new_authors WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/signout', (req,res) => {
  req.session.destroy()
  res.json("done")
})

app.post("/setProf", profs_upload.single("img"), setProf);

function setProf(req, res) {
  if(!req.session.user) return
  connection.query(`UPDATE users SET prof = ? WHERE login = ?`,[req.file.filename, req.body.login], (err, rows, fields) => {
    res.json("done")
  })
}

app.post("/add_book", covers_upload.single("img"), add_book);

function add_book(req, res){
  if(!req.session.user) return
  if(!req.file){
    req.file = {filename: ""}
  }
  connection.query(`INSERT INTO new_books(tytul,autor,rok,strony,opis,tagi,okladka,user,submit_date) VALUES(?,?,?,?,?,?,?,?,NOW())`,[req.body.title,req.body.author,req.body.year,req.body.pages,req.body.desc,req.body.tags,req.file.filename,req.session.user], (err, rows, fields) => {
    res.json("done")
  })
};

const saveBase64Images = (html) => {
  const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
  let match;
  let imgIndex = 0;
  let newHtml = html;

  while ((match = imgRegex.exec(html)) !== null) {
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `postimg_${Date.now()}_${imgIndex}.${ext}`;
    const filepath = path.join(__dirname, '../public/uploads/blog', filename);

    fs.writeFileSync(filepath, buffer);

    // Replace base64 src with file path
    newHtml = newHtml.replace(match[0], match[0].replace(match[0].match(/src="[^"]+"/)[0], `src="../../public/uploads/blog/${filename}"`));
    imgIndex++;
  }
  return newHtml;
};

app.post("/submit_blog_post", blog_upload.single("img"), submit_blog_post);

function submit_blog_post(req, res) {
  if(!req.session.user) return
  let filename = ""
  req.body.text = saveBase64Images(req.body.text);
  if(req.file){
    filename = req.file.filename
  }
  connection.query(`INSERT INTO posts(title, text, thumbnail, user) VALUES (?,?,?,?);`,[req.body.title,req.body.text,filename,req.session.user], (err, rows, fields) => {
    res.json("done")
  })
}

app.post("/edit_blog_post", blog_upload.single("img"), edit_blog_post);

function edit_blog_post(req, res) {
  if(!req.session.user) return
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(req.body.oldtext)) !== null) {
        const fileName = path.basename(match[1]); // extract just the file name
        if(req.body.text.includes(fileName)) continue; // if the image is still in the text, skip deletion
        fs.unlink(`../public/uploads/blog/${fileName}`, (err) => {
          if (err) console.log(`Unable to delete image: ${fileName}`);
        });
  }
  req.body.text = saveBase64Images(req.body.text);
  let filename = ""
  if(req.file){
    filename = req.file.filename
    if(req.body.oldimg){
      fs.unlink('../public/uploads/blog/'+req.body.oldimg, (err) => {
        if (err) console.log("Was unable to delete the file")
      })
    }
  }
  if(!req.file && req.body.deleted == "false"){
    filename = req.body.oldimg
  }
  if(req.body.deleted == "true"){
    fs.unlink('../public/uploads/blog/'+req.body.oldimg, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  connection.query(`UPDATE posts SET title = ?, text = ?, thumbnail = ?, user = ? WHERE id = ?`,[req.body.title,req.body.text,filename,req.session.user,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
}

app.post("/add_author", waiting_authors_upload.single("img"), add_author);

function add_author(req, res){
  if(!req.session.user) return
  if(!req.file){
    req.file = {filename: ""}
  }
  connection.query(`INSERT INTO new_authors(birth,death,description,photo,user,names) VALUES(?,?,?,?,?,?)`,[req.body.birth,req.body.death,req.body.desc,req.file.filename,req.session.user,req.body.names], (err, rows, fields) => {
    res.json("done")
  })
};

app.post("/edit_submission", covers_upload.single("img"), edit_submission);

function edit_submission(req, res){
  if(!req.session.user) return
  if(req.file || req.body.delete_cover == "true"){
    fs.unlink('../public/user_uploads/covers/'+req.body.old_cover, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  if(!req.file && req.body.delete_cover == "false"){
    req.file = {filename: req.body.old_cover}
  }
  if(!req.file && req.body.delete_cover == "true"){
    req.file = {filename: ""}
  }
  connection.query(`UPDATE new_books SET tytul = ?, autor = ?, rok = ?, strony = ?, opis = ?, tagi = ?, okladka = ?, user = ? WHERE id = ?`,[req.body.title,req.body.author,req.body.year,req.body.pages,req.body.desc,req.body.tags,req.file.filename,req.session.user,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
};

app.post("/edit_author_submission", waiting_authors_upload.single("img"), edit_author_submission);

function edit_author_submission(req, res){
  if(!req.session.user) return
  if(req.file || req.body.delete_photo == "true"){
    fs.unlink('../public/user_uploads/authors/'+req.body.old_photo, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  if(!req.file && req.body.delete_photo == "false"){
    req.file = {filename: req.body.old_photo}
  }
  if(!req.file && req.body.delete_photo == "true"){
    req.file = {filename: ""}
  }
  connection.query(`UPDATE new_authors SET birth = ?, death = ?, description = ?, photo = ?, user = ?, names = ? WHERE id = ?`,[req.body.birth,req.body.death,req.body.desc,req.file.filename,req.session.user,req.body.names,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
};


app.post("/edit_book", books_upload.single("img"), edit_book);

function edit_book(req, res){
  if(!req.session.user) return
  if(req.file || req.body.delete_cover == "true"){
    fs.unlink('../public/uploads/'+req.body.old_cover, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  if(!req.file && req.body.delete_cover == "false"){
    req.file = {filename: req.body.old_cover}
  }
  if(!req.file && req.body.delete_cover == "true"){
    req.file = {filename: ""}
  }
  connection.query(`UPDATE books SET tytul = ?, autor = ?, rok = ?, strony = ?, opis = ?, tagi = ?, okladka = ? WHERE id = ?`,[req.body.title,req.body.author,req.body.year,req.body.pages,req.body.desc,req.body.tags,req.file.filename,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
};

app.post("/edit_author", authors_upload.single("img"), edit_author);

function edit_author(req, res){
  if(!req.session.user) return
  if(req.file || req.body.delete_photo == "true"){
    fs.unlink('../public/uploads/authors/'+req.body.old_photo, (err) => {
      if (err) console.log("Was unable to delete the file")
    })
  }
  if(!req.file && req.body.delete_photo == "false"){
    req.file = {filename: req.body.old_photo}
  }
  if(!req.file && req.body.delete_photo == "true"){
    req.file = {filename: ""}
  }
  let names = req.body.names.split(',')
  connection.query(`UPDATE authors SET birth = ?, death = ?, description = ?, photo = ? WHERE id = ?`,[req.body.birth,req.body.death,req.body.desc,req.file.filename,req.body.id], (err, rows, fields) => {
    connection.query(`DELETE FROM authors_aliases WHERE author = ?`,[req.body.id], (err, rows, fields) => {
      names.forEach(name => {
        connection.query(`INSERT INTO authors_aliases (name,author) VALUES (?,?);`,[name,req.body.id], (err, rows, fields) => {
        })
      })
      res.json("done")
    })
  })
};

app.post('/header_notifications', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection,comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC LIMIT 100;`,[req.body.user,req.body.user,req.body.user,req.body.user,req.body.user], async (err, rows, fields) => {
    const enhancedRows = await Promise.all(rows.map(async (el) => {
        if(el.type == "warning") return
        const getQueryResult = (query) => {
          return new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            });
          });
        };
        if (el.quote) {
          el.quote = await getQueryResult(`SELECT * FROM quotes WHERE quotes.id = ${el.quote}`);
          el.quote.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.quote.book}`);
        }
        if (el.review) {
          el.review = await getQueryResult(`SELECT * FROM reviews WHERE reviews.id = ${el.review}`);
          el.review.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.review.book}`);
        }
        if (el.comment) {
          el.comment = await getQueryResult(`SELECT * FROM comments WHERE comments.id = ${el.comment}`);
          el.comment.post = await getQueryResult(`SELECT * FROM posts WHERE posts.id = ${el.comment.post}`);
        }
        if (el.collection) {
          el.collection = await getQueryResult(`SELECT * FROM collections WHERE collections.id = ${el.collection}`);
        }
        return el;
    }));
    res.send(enhancedRows)
  })
})

app.post('/notifications', (req,res) => {
  if(!req.session.user) return
  let offset = ""
  if(req.body.offset != 0){
    offset = "OFFSET "+req.body.offset
  }
  let num = 0;
  connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection, comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC;`,[req.body.user,req.body.user,req.body.user,req.body.user,req.body.user], async (err, rows, fields) => {
    num = rows.length
      connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection, comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC LIMIT 10 ${offset};`,[req.body.user,req.body.user,req.body.user,req.body.user,req.body.user], async (err, rows, fields) => {
    const enhancedRows = await Promise.all(rows.map(async (el) => {
        if(el.type == "warning") return
        const getQueryResult = (query) => {
          return new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            });
          });
        };
        if (el.quote) {
          el.quote = await getQueryResult(`SELECT * FROM quotes WHERE quotes.id = ${el.quote}`);
          el.quote.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.quote.book}`);
        }
        if (el.review) {
          el.review = await getQueryResult(`SELECT * FROM reviews WHERE reviews.id = ${el.review}`);
          el.review.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.review.book}`);
        }
        if (el.comment) {
          el.comment = await getQueryResult(`SELECT * FROM comments WHERE comments.id = ${el.comment}`);
          el.comment.post = await getQueryResult(`SELECT * FROM posts WHERE posts.id = ${el.comment.post}`);
        }
        if (el.collection) {
          el.collection = await getQueryResult(`SELECT * FROM collections WHERE collections.id = ${el.collection}`);
        }
        return el;
    }));
    enhancedRows.unshift(num)
    res.send(enhancedRows)
  })
    })
})

app.post('/waiting_submissions', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_books WHERE user = ? ORDER BY submit_date DESC`,[req.session.user], (err, rows, fields) => {
    res.send(rows)
  })
})

app.post('/waiting_author_submissions', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_authors WHERE user = ? ORDER BY submit_date DESC`,[req.session.user], (err, rows, fields) => {
    res.send(rows)
  })
})

app.post('/delete_waiting_submission', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM new_books WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_author_submission', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM new_authors WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_book', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM books WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_author', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM authors WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_report', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM reports WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/admin_delete', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM ${req.body.type}s WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/ban_user', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM users WHERE login = ?`,[req.body.user], (err, rows, fields) => {
    connection.query(`DELETE FROM users WHERE login = ?`,[req.body.user], (err2, rows2, fields2) => {})
    connection.query(`INSERT INTO banned(email) VALUES (?);`,[rows[0].email], (err3, rows3, fields3) => {
        res.json("done")
    })
  })
})

app.post('/approve_waiting_submission', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM new_books WHERE id = ?`,[req.body.id])
  if(req.body.cover){
    var oldPath = '../public/user_uploads/covers/'+req.body.cover
    var newPath = '../public/uploads/'+req.body.cover
    fs.rename(oldPath, newPath, function (err) {
      if (err) console.log(err)
    })
  }
  connection.query(`INSERT INTO books (tytul,autor,rok,strony,opis,tagi,okladka) VALUES (?,?,?,?,?,?,?)`,[req.body.title,req.body.author,req.body.year,req.body.pages,req.body.desc,req.body.tags,req.body.cover], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/approve_waiting_author_submission', (req,res) => {
  if(!req.session.user) return
  let names = req.body.names.split(',')
  connection.query(`DELETE FROM new_authors WHERE id = ?`,[req.body.id])
  if(req.body.photo){
    var oldPath = '../public/user_uploads/authors/'+req.body.photo
    var newPath = '../public/uploads/authors/'+req.body.photo
    fs.rename(oldPath, newPath, function (err) {
      if (err) console.log(err)
    })
  }
  connection.query(`INSERT INTO authors (birth,death,description,photo) VALUES (?,?,?,?);`,[req.body.birth,req.body.death,req.body.desc,req.body.photo], (err, rows, fields) => {
    let row_id = rows.insertId
    names.forEach(name => {
      connection.query(`INSERT INTO authors_aliases (name,author) VALUES (?,?);`,[name,row_id], (err, rows, fields) => {
      })
    })
    res.json("done")
  })
})

app.post('/new_books', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_books ORDER BY submit_date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS submissions FROM new_books`, (err2, rows2, fields2) => {
      rows.unshift({submissions: rows2[0].submissions})
      res.send(rows)
    })
  })
})

app.post('/posts', (req,res) => {
  connection.query(`SELECT posts.*, COUNT(likes.id) AS likes FROM posts LEFT JOIN likes ON likes.post = posts.id GROUP BY posts.id ORDER BY posts.date DESC LIMIT 5 OFFSET ${req.body.offset};`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS posts FROM posts`, (err2, rows2, fields2) => {
      rows.unshift({posts: rows2[0].posts})
      res.send(rows)
    })
  })
})

app.post('/posts_search', (req,res) => {
  connection.query(`SELECT posts.*, COUNT(likes.id) AS likes FROM posts LEFT JOIN likes ON likes.post = posts.id WHERE (posts.title LIKE CONCAT('%', ? ,'%') OR posts.text LIKE CONCAT('%', ? ,'%')) GROUP BY posts.id ORDER BY posts.date`,[req.body.search,req.body.search], (err, rows, fields) => {
    res.send(rows)
  })
})

app.post('/new_authors', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_authors ORDER BY submit_date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS submissions FROM new_authors`, (err2, rows2, fields2) => {
      rows.unshift({submissions: rows2[0].submissions})
      res.send(rows)
    })
  })
})


app.post('/new_reports', async(req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM reports ORDER BY date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS reports FROM reports`, async (err2, rows2, fields2) => {
      rows.unshift({reports: rows2[0].reports})
      const enhancedRows = await Promise.all(rows.map(async (el) => {
        if (el.reports) return el;
        const getQueryResult = (query) => {
          return new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            });
          });
        };
        if (el.comment) {
          el.comment = await getQueryResult(`SELECT * FROM comments WHERE comments.id = ${el.comment}`);
          el.comment.post = await getQueryResult(`SELECT * FROM posts WHERE posts.id = ${el.comment.post}`);
        }
        if (el.quote) {
          el.quote = await getQueryResult(`SELECT * FROM quotes WHERE quotes.id = ${el.quote}`);
          el.quote.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.quote.book}`);
        }
        if (el.review) {
          el.review = await getQueryResult(`SELECT * FROM reviews WHERE reviews.id = ${el.review}`);
          el.review.book = await getQueryResult(`SELECT * FROM books WHERE books.id = ${el.review.book}`);
        }
        return el;
    }));
    res.send(enhancedRows);
    })
  })
})

app.post('/deleteProf', (req,res) => {
  if(!req.session.user) return
  fs.unlink('../public/user_uploads/profs/'+req.body.img, (err) => {
    if (err) console.log("Was unable to delete the file")
  })
  connection.query(`UPDATE users SET prof = "" WHERE login = ?;`,[req.body.login], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/mark_as_seen', (req,res) => {
  if(!req.session.user) return
  connection.query(`UPDATE notifications SET seen = 1 WHERE user = ? AND ${req.body.type} = ?;`,[req.session.user,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_notification', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM notifications WHERE user = ? AND ${req.body.type} = ?;`,[req.session.user,req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.listen(3000)