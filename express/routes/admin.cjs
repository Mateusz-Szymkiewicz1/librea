const express = require('express');
const fs = require('fs');
const { connection } = require('./shared.cjs');

const router = express.Router();

router.post('/waiting_submissions', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM new_books WHERE user = ? ORDER BY submit_date DESC`, [req.session.user], (err, rows, fields) => {
    res.send(rows);
  });
});

router.post('/waiting_author_submissions', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM new_authors WHERE user = ? ORDER BY submit_date DESC`, [req.session.user], (err, rows, fields) => {
    res.send(rows);
  });
});

router.post('/delete_waiting_submission', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM new_books WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_author_submission', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM new_authors WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_book', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM books WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_author', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM authors WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_report', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM reports WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/admin_delete', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM ${req.body.type}s WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/ban_user', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM users WHERE login = ?`, [req.body.user], (err, rows, fields) => {
    connection.query(`DELETE FROM users WHERE login = ?`, [req.body.user], (err2, rows2, fields2) => {});
    connection.query(`INSERT INTO banned(email) VALUES (?);`, [rows[0].email], (err3, rows3, fields3) => {
      res.json('done');
    });
  });
});

router.post('/approve_waiting_submission', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM new_books WHERE id = ?`, [req.body.id]);
  if (req.body.cover) {
    var oldPath = '../public/user_uploads/covers/' + req.body.cover;
    var newPath = '../public/uploads/' + req.body.cover;
    fs.rename(oldPath, newPath, function (err) {
      if (err) console.log(err);
    });
  }
  connection.query(`INSERT INTO books (tytul,autor,rok,strony,opis,tagi,okladka) VALUES (?,?,?,?,?,?,?)`, [req.body.title, req.body.author, req.body.year, req.body.pages, req.body.desc, req.body.tags, req.body.cover], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/approve_waiting_author_submission', (req, res) => {
  if (!req.session.user) return;
  let names = req.body.names.split(',');
  connection.query(`DELETE FROM new_authors WHERE id = ?`, [req.body.id]);
  if (req.body.photo) {
    var oldPath = '../public/user_uploads/authors/' + req.body.photo;
    var newPath = '../public/uploads/authors/' + req.body.photo;
    fs.rename(oldPath, newPath, function (err) {
      if (err) console.log(err);
    });
  }
  connection.query(`INSERT INTO authors (birth,death,description,photo) VALUES (?,?,?,?);`, [req.body.birth, req.body.death, req.body.desc, req.body.photo], (err, rows, fields) => {
    let row_id = rows.insertId;
    names.forEach(name => {
      connection.query(`INSERT INTO authors_aliases (name,author) VALUES (?,?);`, [name, row_id], (err, rows, fields) => {
      });
    });
    res.json('done');
  });
});

router.post('/new_books', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM new_books ORDER BY submit_date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS submissions FROM new_books`, (err2, rows2, fields2) => {
      rows.unshift({ submissions: rows2[0].submissions });
      res.send(rows);
    });
  });
});

router.post('/new_authors', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM new_authors ORDER BY submit_date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS submissions FROM new_authors`, (err2, rows2, fields2) => {
      rows.unshift({ submissions: rows2[0].submissions });
      res.send(rows);
    });
  });
});

router.post('/new_reports', async (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM reports ORDER BY date ASC LIMIT 5 OFFSET ${req.body.offset}`, (err, rows, fields) => {
    connection.query(`SELECT COUNT(*) AS reports FROM reports`, async (err2, rows2, fields2) => {
      rows.unshift({ reports: rows2[0].reports });
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
    });
  });
});

router.post('/mark_as_seen', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE notifications SET seen = 1 WHERE user = ? AND ${req.body.type} = ?;`, [req.session.user, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_notification', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM notifications WHERE user = ? AND ${req.body.type} = ?;`, [req.session.user, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

module.exports = router;
