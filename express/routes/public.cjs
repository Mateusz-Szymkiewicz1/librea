const express = require('express');
const { connection, queryAsync } = require('./shared.cjs');

const router = express.Router();

router.post('/author/:id', (req, res) => {
  connection.query(`SELECT * FROM authors WHERE id = ?`, [req.params.id], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      connection.query(`SELECT * FROM authors_aliases WHERE author = ?`, [req.params.id], (err2, rows2, fields2) => {
        rows[0].names = rows2.map(a => a.name);
        connection.query(`SELECT books.*, COUNT(DISTINCT ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.autor IN (?) GROUP BY books.id WITH ROLLUP`, [rows[0].names], (err3, rows3, fields3) => {
          rows[0].books = rows3;
          res.send(rows);
        });
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/book/:id', (req, res) => {
  try {
    parseInt(req.query.offset);
  } catch (e) {
    res.send({ status: 0, text: 'No matches found...' });
  }
  connection.query(`SELECT b.*, IFNULL(r.rating_count, 0) AS ilosc_ocen, IFNULL(r.rating_sum, 0) AS suma_ocen, IFNULL(rv.review_count, 0) AS ilosc_recenzji, IFNULL(q.quote_count, 0) AS ilosc_cytatow FROM books b LEFT JOIN ( SELECT book, COUNT(*) AS rating_count, SUM(rating) AS rating_sum FROM ratings GROUP BY book ) r ON r.book = b.id LEFT JOIN ( SELECT book, COUNT(*) AS review_count FROM reviews GROUP BY book ) rv ON rv.book = b.id LEFT JOIN ( SELECT book, COUNT(*) AS quote_count FROM quotes GROUP BY book ) q ON q.book = b.id WHERE b.id = ?`, [req.params.id], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating, users.prof FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) LEFT JOIN users ON users.login = reviews.user WHERE reviews.book = ? GROUP BY reviews.id ORDER BY reviews.id DESC LIMIT 15 OFFSET ${req.query.offset}`, [req.params.id], (err2, rows2, fields2) => {
        rows[0].reviews = rows2;
        connection.query(`SELECT quotes.*, COUNT(likes.id) AS likes FROM quotes LEFT JOIN likes ON quotes.id = likes.quote WHERE quotes.book = ? GROUP BY quotes.id ORDER BY likes DESC LIMIT 5 OFFSET ${req.query.quote_offset}`, [req.params.id], (err3, rows3, fields3) => {
          rows[0].quotes = rows3;
          connection.query(`SELECT a.*, COALESCE(CONCAT('[', GROUP_CONCAT(DISTINCT b.id), ']'), '[]') AS books FROM authors a JOIN authors_aliases aa_search ON a.id = aa_search.author LEFT JOIN authors_aliases aa_books ON a.id = aa_books.author LEFT JOIN books b ON b.autor = aa_books.name AND b.id != ? WHERE aa_search.name = ? GROUP BY a.id;`, [req.params.id, rows[0].autor], async (err4, rows4, fields4) => {
            if (err4) {
              console.error('Failed to load related author books:', err4);
              return res.status(500).send({ status: 0, text: 'Unable to load book details.' });
            }
            if (!rows4 || rows4.length === 0) {
              rows[0].author = [];
              return res.send(rows);
            }
            rows4[0].books = JSON.parse(rows4[0].books);
            for (const bookId of rows4[0].books.sort((a, b) => b.ilosc_ocen - a.ilosc_ocen).slice(0, 5)) {
              const rows5 = await queryAsync(
                connection,
                `SELECT books.id, books.tytul, books.autor, books.okladka, COUNT(ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen
                FROM books
                LEFT JOIN ratings ON ratings.book = books.id
                WHERE books.id = ?
                GROUP BY books.id`,
                [bookId, req.params.id]
              );
              rows4[0].books[rows4[0].books.indexOf(bookId)] = rows5[0];
            }
            rows[0].author = rows4;
            res.send(rows);
          });
        });
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/popular_books', (req, res) => {
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id HAVING ilosc_ocen > 0 ORDER BY ilosc_ocen DESC LIMIT 10`, (err, rows, fields) => {
    if (rows && rows.length > 0) {
      res.send(rows);
    }
  });
});

router.get('/new_books', (req, res) => {
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, IFNULL(SUM(ratings.rating), 0) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id GROUP BY books.id ORDER BY books.id DESC LIMIT 10`, (err, rows, fields) => {
    if (rows && rows.length > 0) {
      res.send(rows);
    }
  });
});

router.get('/collection/:id', (req, res) => {
  connection.query(`SELECT collections.*, COUNT(likes.id) AS likes FROM collections LEFT JOIN likes ON collections.id = likes.collection WHERE collections.id = ? GROUP BY collections.id`, [req.params.id], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      res.send(rows);
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.post('/post/:id', (req, res) => {
  try {
    parseInt(req.query.offset);
  } catch (e) {
    res.send({ status: 0, text: 'No matches found...' });
  }
  connection.query(`SELECT posts.*, (SELECT COUNT(*) FROM likes WHERE likes.post = posts.id) AS likes, (SELECT COUNT(*) FROM comments WHERE comments.post = posts.id) AS numOfComments FROM posts WHERE posts.id = ?`, [req.params.id], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      connection.query(`SELECT comments.*, COUNT(likes.id) AS likes FROM comments LEFT JOIN likes ON likes.comment = comments.id WHERE comments.post = ? GROUP BY comments.id ORDER BY comments.date DESC LIMIT 2 OFFSET ${req.query.offset}`, [req.params.id], (err, commentRows) => {
        rows[0].comments = commentRows;
        res.send(rows);
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/recent_posts', (req, res) => {
  connection.query(`SELECT posts.* FROM posts ORDER BY date DESC LIMIT 10`, [req.params.id], (err, rows, fields) => {
    if (rows) {
      res.send(rows);
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/tags', (req, res) => {
  connection.query(`SELECT * FROM tags`, [req.params.id], (err, rows, fields) => {
    res.send(rows[0]);
  });
});

router.post('/user/:login', (req, res) => {
  let query = '';
  if (req.session.user != req.params.login) {
    query = 'AND collections.private = 0';
  }
  connection.query(`SELECT login, prof, admin, private FROM users WHERE users.login = ?`, [req.params.login], (err, rows, fields) => {
    if (rows && rows.length > 0) {
      connection.query(`SELECT book, rating FROM ratings WHERE ratings.user = ?`, [req.params.login], (err2, rows2, fields2) => {
        if (rows2) {
          rows[0].ratings = rows2;
        }
      });
      connection.query(`SELECT * FROM collections WHERE collections.user = ? ${query}`, [req.params.login], (err4, rows4, fields4) => {
        if (rows4) {
          rows[0].collections = rows4;
        }
      });
      connection.query(`SELECT likes.* FROM likes LEFT JOIN reviews ON likes.review = reviews.id LEFT JOIN quotes ON likes.quote = quotes.id WHERE likes.user = ? AND ( ? IS NULL OR ((likes.review IS NOT NULL AND reviews.book = ?) OR (likes.quote IS NOT NULL AND quotes.book = ?)));`, [req.params.login, req.body.book, req.body.book, req.body.book], (err5, rows5, fields5) => {
        if (rows5) {
          rows[0].likes = rows5;
        }
      });
      connection.query(`SELECT * FROM likes WHERE likes.user = ? AND likes.collection = ?`, [req.params.login, req.body.collection], (err6, rows6, fields6) => {
        if (rows6) {
          rows[0].collections_likes = rows6;
        }
      });
      connection.query(`SELECT quotes.*, COUNT(likes.id) AS likes FROM quotes LEFT JOIN likes ON quotes.id = likes.quote WHERE quotes.user = ? AND quotes.book = ? GROUP BY quotes.id ORDER BY quotes.id DESC`, [req.params.login, req.body.book], (err7, rows7, fields7) => {
        if (rows7) {
          rows[0].quotes = rows7;
        }
      });
      connection.query(`SELECT comments.*, COUNT(likes.id) AS likes FROM comments LEFT JOIN likes ON comments.id = likes.comment WHERE comments.user = ? AND comments.post = ? GROUP BY comments.id ORDER BY comments.id DESC`, [req.params.login, req.body.post], (err8, rows8, fields8) => {
        if (rows8) {
          rows[0].comments = rows8;
        }
      });
      connection.query(`SELECT * FROM notes WHERE user = ? AND book = ?`, [req.params.login, req.body.book], (err9, rows9, fields9) => {
        if (rows9) {
          rows[0].notes = rows9;
        }
      });
      connection.query(`SELECT reviews.*, COUNT(likes.id) AS likes, ratings.rating FROM reviews LEFT JOIN likes ON reviews.id = likes.review LEFT JOIN ratings ON (ratings.book = reviews.book AND ratings.user = reviews.user) WHERE reviews.user = ? GROUP BY reviews.id ORDER BY reviews.id DESC`, [req.params.login], (err3, rows3, fields3) => {
        if (rows3) {
          rows[0].reviews = rows3;
          res.send(rows);
        } else {
          res.send(rows);
        }
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.post('/search', (req, res) => {
  let sort = `books.id ${req.body.direction}`;
  if (req.body.sort == 'author') {
    sort = `SUBSTRING_INDEX(TRIM(books.autor), ' ', -1) ${req.body.direction}`;
  }
  if (req.body.sort == 'title') {
    sort = `books.tytul ${req.body.direction}`;
  }
  if (req.body.sort == 'rating') {
    sort = `(SUM(ratings.rating)/COUNT(ratings.id)) ${req.body.direction}`;
  }
  if (req.body.sort == 'popularity') {
    sort = `(COUNT(ratings.id)) ${req.body.direction}`;
  }
  let tag_query = '';
  if (req.body.tags.length > 0) {
    tag_query = 'AND books.tagi LIKE';
    req.body.tags.forEach((tag, i) => {
      if (i == req.body.tags.length - 1) {
        tag_query = tag_query + ` '%${tag}%'`;
      } else {
        tag_query = tag_query + ` '%${tag}%' AND books.tagi LIKE`;
      }
    });
  }
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE (tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%')) ${tag_query} GROUP BY books.id ORDER BY ${sort} LIMIT 15 OFFSET ${req.body.offset}`,[req.body.search, req.body.search, req.body.search], (err, rows, fields) => {
    if (rows && rows.length > 0) {
      connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE (tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%')) ${tag_query} GROUP BY books.id`, [req.body.search, req.body.search, req.body.search], (err2, rows2, fields2) => {
        rows.unshift({ resultsCount: rows2.length });
        res.send(rows);
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.post('/tag/:tag', (req, res) => {
  let sort = `books.id ${req.body.direction}`;
  if (req.body.sort == 'author') {
    sort = `SUBSTRING_INDEX(TRIM(books.autor), ' ', -1) ${req.body.direction}`;
  }
  if (req.body.sort == 'title') {
    sort = `books.tytul ${req.body.direction}`;
  }
  if (req.body.sort == 'rating') {
    sort = `(SUM(ratings.rating)/COUNT(ratings.id)) ${req.body.direction}`;
  }
  if (req.body.sort == 'popularity') {
    sort = `(COUNT(ratings.id)) ${req.body.direction}`;
  }
  connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.tagi LIKE '%${req.body.tag}%' GROUP BY books.id ORDER BY ${sort} LIMIT 15 OFFSET ${req.body.offset}`, [], (err, rows, fields) => {
    if (rows && rows.length > 0) {
      connection.query(`SELECT books.*, COUNT(ratings.id) AS ilosc_ocen, SUM(ratings.rating) AS suma_ocen FROM books LEFT JOIN ratings ON ratings.book = books.id WHERE books.tagi LIKE '%${req.body.tag}%' GROUP BY books.id`, [], (err2, rows2, fields2) => {
        rows.unshift({ resultsCount: rows2.length });
        res.send(rows);
      });
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/search_autocomplete/:search', (req, res) => {
  connection.query(`SELECT * FROM books WHERE tytul LIKE CONCAT('%', ? ,'%') OR autor LIKE CONCAT('%', ? ,'%') LIMIT 6`, [req.params.search, req.params.search, req.params.search], (err, rows, fields) => {
    if (rows && rows.length > 0) {
      res.send(rows);
    } else {
      res.send({ status: 0, text: 'No matches found...' });
    }
  });
});

router.get('/random_book', (req, res) => {
  connection.query(`SELECT * FROM books AS t1 JOIN (SELECT id FROM books ORDER BY RAND() LIMIT 1) as t2 ON t1.id=t2.id`, (err, rows, fields) => {
    res.send(rows);
  });
});

router.post('/posts', (req, res) => {
  connection.query(`SELECT posts.*, COUNT(likes.id) AS likes FROM posts LEFT JOIN likes ON likes.post = posts.id GROUP BY posts.id ORDER BY posts.date ${req.body.sort == 'newest' ? 'DESC' : 'ASC'} LIMIT 5 OFFSET ${req.body.offset};`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS posts FROM posts`, (err2, rows2, fields2) => {
      rows.unshift({ posts: rows2[0].posts });
      res.send(rows);
    });
  });
});

router.post('/posts_search', (req, res) => {
  connection.query(`SELECT posts.*, COUNT(likes.id) AS likes FROM posts LEFT JOIN likes ON likes.post = posts.id WHERE (posts.title LIKE CONCAT('%', ? ,'%') OR posts.text LIKE CONCAT('%', ? ,'%')) GROUP BY posts.id ORDER BY posts.date ${req.body.sort == 'newest' ? 'DESC' : 'ASC'}`,[req.body.search, req.body.search], (err, rows, fields) => {
    res.send(rows);
  });
});

module.exports = router;
