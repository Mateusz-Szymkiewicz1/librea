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
const profs_upload = multer({ storage: profs_storage, limits: {fieldSize: 50*1024*1024} });
const covers_upload = multer({ storage: covers_storage, limits: {fieldSize: 50*1024*1024} });
const books_upload = multer({ storage: books_storage, limits: {fieldSize: 50*1024*1024} });
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
  connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(DISTINCT ratings.rating), 0) AS suma_ocen, COUNT(DISTINCT reviews.id) AS ilosc_recenzji, COUNT(DISTINCT quotes.id) AS ilosc_cytatow FROM books LEFT JOIN ratings ON ratings.book = books.id LEFT JOIN reviews ON reviews.book = books.id LEFT JOIN quotes ON quotes.book = books.id WHERE books.id = ? GROUP BY books.id;`,[req.params.id], (err, rows, fields) => {
    if(rows && rows.length == 1){
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating, users.prof FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) LEFT JOIN users ON users.login = reviews.user WHERE reviews.book = ? GROUP BY reviews.id ORDER BY reviews.id DESC LIMIT 15 OFFSET ${req.query.offset}`,[req.params.id], (err2, rows2, fields2) => {
        rows[0].reviews = rows2
        connection.query(`SELECT quotes.*, COUNT(likes.id) AS likes FROM quotes LEFT JOIN likes ON quotes.id = likes.quote WHERE quotes.book = ? GROUP BY quotes.id ORDER BY likes DESC LIMIT 5 OFFSET ${req.query.quote_offset}`,[req.params.id], (err3, rows3, fields3) => {
          rows[0].quotes = rows3
          res.send(rows)
        })
      })
    }else{
      res.send({ status: 0, text: "No matches found..."})
    }
  })
})

app.get('/popular_books', (req,res) => {
  connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(DISTINCT ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id HAVING COUNT(ratings.id) > 0 ORDER BY COUNT(ratings.id) DESC LIMIT 10`, (err, rows, fields) => {
    if(rows && rows.length > 0){
      res.send(rows)
    }
  })
})

app.get('/new_books', (req,res) => {
  connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(DISTINCT ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id ORDER BY books.id DESC LIMIT 10`, (err, rows, fields) => {
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

app.get('/tags', (req,res) => {
  connection.query(`SELECT * FROM tags`,[req.params.id], (err, rows, fields) => {
      res.send(rows[0])
  })
})

app.post('/user/:login', (req,res) => {
  connection.query(`SELECT login, prof, admin FROM users WHERE users.login = ?`,[req.params.login], (err, rows, fields) => {
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

app.post('/delete_quote', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM quotes WHERE id = ?`,[req.body.id], (err, rows, fields) => {
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

app.post('/quote_like', (req,res) => {
  if(!req.session.user) return
  connection.query(`INSERT INTO likes (user,quote) VALUES ('${req.session.user}',?);`,[req.body.quote], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/quote_unlike', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND quote = ?`,[req.body.quote], (err, rows, fields) => {
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

app.post('/waiting_submissions', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_books WHERE user = ? ORDER BY submit_date DESC`,[req.session.user], (err, rows, fields) => {
    res.send(rows)
  })
})

app.post('/delete_waiting_submission', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM new_books WHERE id = ?`,[req.body.id], (err, rows, fields) => {
    res.json("done")
  })
})

app.post('/delete_book', (req,res) => {
  if(!req.session.user) return
  connection.query(`DELETE FROM books WHERE id = ?`,[req.body.id], (err, rows, fields) => {
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

app.post('/new_books', (req,res) => {
  if(!req.session.user) return
  connection.query(`SELECT * FROM new_books ORDER BY submit_date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS submissions FROM new_books`, (err2, rows2, fields2) => {
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

app.listen(3000)