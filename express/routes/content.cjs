const express = require('express');
const fs = require('fs');
const path = require('path');
const { connection, like_notification, unlike_notification } = require('./shared.cjs');

const router = express.Router();

router.post('/rate', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM ratings WHERE user = '${req.session.user}' AND book = ?`, [req.body.book], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      connection.query(`UPDATE ratings SET rating = ? WHERE user = '${req.session.user}' AND book = ?;`, [req.body.rating, req.body.book], (err, rows, fields) => {
        res.json('done');
      });
    } else {
      connection.query(`INSERT INTO ratings (user,book,rating) VALUES ('${req.session.user}',?,?);`, [req.body.book, req.body.rating], (err, rows, fields) => {
        res.json('done');
      });
    }
  });
});

router.post('/review', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO reviews (user,book,text,spoiler) VALUES ('${req.session.user}',?,?,?);`, [req.body.book, req.body.text, req.body.spoiler], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/add_note', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO notes (user,book,text,page) VALUES ('${req.session.user}',?,?,?);`, [req.body.book, req.body.text, req.body.page], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/comment', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO comments (post,user,text) VALUES (?,'${req.session.user}',?);`, [req.body.post, req.body.text], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/report', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT * FROM reports WHERE user_reporting = '${req.session.user}' AND ${req.body.type} = ?`, [req.body.id], (err, rows, fields) => {
    if (rows.length == 0) {
      connection.query(`INSERT INTO reports (user_reporting,date,${req.body.type}) VALUES ('${req.session.user}',NOW(),?);`, [req.body.id], (err, rows, fields) => {
        res.json('done');
      });
    } else {
      res.json('already reported');
    }
  });
});

router.post('/add_quote', (req, res) => {
  if (!req.session.user) return;
  let quote = req.body.text;
  if (quote[0] == '"' || quote[0] == "'") {
    quote = quote.substring(1);
  }
  if (quote[quote.length - 1] == '"' || quote[quote.length - 1] == "'") {
    quote = quote.substring(0, quote.length - 1);
  }
  connection.query(`INSERT INTO quotes (user,book,text) VALUES ('${req.session.user}',?,?);`, [req.body.book, quote], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_review', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE reviews SET text = ?, spoiler = ? WHERE id = ?`, [req.body.text, req.body.spoiler, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_note', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE notes SET text = ?, page = ? WHERE id = ?`, [req.body.text, req.body.page, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_comment', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE comments SET text = ? WHERE id = ?`, [req.body.text, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_quote', (req, res) => {
  if (!req.session.user) return;
  let quote = req.body.text;
  if (quote[0] == '"' || quote[0] == "'") {
    quote = quote.substring(1);
  }
  if (quote[quote.length - 1] == '"' || quote[quote.length - 1] == "'") {
    quote = quote.substring(0, quote.length - 1);
  }
  connection.query(`UPDATE quotes SET text = ? WHERE id = ?`, [quote, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_review', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM reviews WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_note', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM notes WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_comment', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM comments WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/delete_quote', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM quotes WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/new_collection', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO collections (user,name,books,description,private) VALUES ('${req.session.user}',?,?,?,?);`, [req.body.name, req.body.books, req.body.desc, req.body.private], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/review_like', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO likes (user,review) VALUES ('${req.session.user}',?);`, [req.body.review], (err, rows, fields) => {
    connection.query(`SELECT user FROM reviews WHERE reviews.id = ?`, [req.body.review], (err2, rows2, fields2) => {
      like_notification(req.session.user, 'review', rows2[0].user, req.body.review);
      res.json('done');
    });
  });
});

router.post('/review_unlike', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND review = ?`, [req.body.review], (err, rows, fields) => {
    connection.query(`SELECT user FROM reviews WHERE reviews.id = ?`, [req.body.review], (err2, rows2, fields2) => {
      unlike_notification(req.session.user, 'review', rows2[0].user, req.body.review);
      res.json('done');
    });
  });
});

router.post('/comment_like', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO likes (user,comment) VALUES ('${req.session.user}',?);`, [req.body.comment], (err, rows, fields) => {
    connection.query(`SELECT user FROM comments WHERE comments.id = ?`, [req.body.comment], (err2, rows2, fields2) => {
      like_notification(req.session.user, 'comment', rows2[0].user, req.body.comment);
      res.json('done');
    });
  });
});

router.post('/comment_unlike', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND comment = ?`, [req.body.comment], (err, rows, fields) => {
    connection.query(`SELECT user FROM comments WHERE comments.id = ?`, [req.body.comment], (err2, rows2, fields2) => {
      unlike_notification(req.session.user, 'comment', rows2[0].user, req.body.comment);
      res.json('done');
    });
  });
});

router.post('/post_like', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO likes (user,post) VALUES ('${req.session.user}',?);`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/post_unlike', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND post = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/quote_like', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO likes (user,quote) VALUES ('${req.session.user}',?);`, [req.body.quote], (err, rows, fields) => {
    connection.query(`SELECT user FROM quotes WHERE quotes.id = ?`, [req.body.quote], (err2, rows2, fields2) => {
      like_notification(req.session.user, 'quote', rows2[0].user, req.body.quote);
      res.json('done');
    });
  });
});

router.post('/quote_unlike', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND quote = ?`, [req.body.quote], (err, rows, fields) => {
    connection.query(`SELECT user FROM quotes WHERE quotes.id = ?`, [req.body.quote], (err2, rows2, fields2) => {
      unlike_notification(req.session.user, 'quote', rows2[0].user, req.body.quote);
      res.json('done');
    });
  });
});

router.post('/collection_delete', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM collections WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/collection_delete_book', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE collections SET books = ? WHERE id = ?;`, [JSON.stringify(req.body.books), req.body.collection], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/collection_add_book', (req, res) => {
  if (!req.session.user) return;
  let books = [];
  connection.query(`SELECT books FROM collections WHERE id = ?`, [req.body.collection], (err, rows, fields) => {
    books = [...JSON.parse(rows[0].books)];
    books.push({ id: parseInt(req.body.book) });
    connection.query(`UPDATE collections SET books = ? WHERE id = ?;`, [JSON.stringify(books), req.body.collection], (err, rows, fields) => {
      res.json('done');
    });
  });
});

router.post('/collection_edit_info', (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE collections SET name = ?, description = ?, private = ? WHERE id = ?;`, [req.body.name, req.body.desc, req.body.private, req.body.collection], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/collection_like', (req, res) => {
  if (!req.session.user) return;
  connection.query(`INSERT INTO likes (user,collection) VALUES ('${req.session.user}',?);`, [req.body.collection], (err, rows, fields) => {
    connection.query(`SELECT user FROM collections WHERE collections.id = ?`, [req.body.collection], (err2, rows2, fields2) => {
      like_notification(req.session.user, 'collection', rows2[0].user, req.body.collection);
      res.json('done');
    });
  });
});

router.post('/collection_unlike', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM likes WHERE user = '${req.session.user}' AND collection = ?`, [req.body.collection], (err, rows, fields) => {
    connection.query(`SELECT user FROM collections WHERE collections.id = ?`, [req.body.collection], (err2, rows2, fields2) => {
      unlike_notification(req.session.user, 'collection', rows2[0].user, req.body.collection);
      res.json('done');
    });
  });
});

router.post('/delete_post', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT thumbnail,text FROM posts WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    if (rows[0]) {
      if (rows[0].thumbnail) {
        fs.unlink('../public/uploads/blog/' + rows[0].thumbnail, (err) => {
          if (err) console.log('Was unable to delete the file');
        });
      }
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(rows[0].text)) !== null) {
        const fileName = path.basename(match[1]);
        fs.unlink(`../public/uploads/blog/${fileName}`, (err) => {
          if (err) console.log(`Unable to delete image: ${fileName}`);
        });
      }
    }
  });
  connection.query(`DELETE FROM posts WHERE id = ?`, [req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/header_notifications', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection,comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC LIMIT 100;`, [req.body.user, req.body.user, req.body.user, req.body.user, req.body.user], async (err, rows, fields) => {
    const enhancedRows = await Promise.all(rows.map(async (el) => {
      if (el.type == 'warning') return;
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
    res.send(enhancedRows);
  });
});

router.post('/notifications', (req, res) => {
  if (!req.session.user) return;
  let offset = '';
  if (req.body.offset != 0) {
    offset = 'OFFSET ' + req.body.offset;
  }
  let num = 0;
  connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection, comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC;`, [req.body.user, req.body.user, req.body.user, req.body.user, req.body.user], async (err, rows, fields) => {
    num = rows.length;
    connection.query(`SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your comment') AS text, user, NULL AS quote, NULL AS review, NULL AS collection, comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND comment IS NOT NULL GROUP BY user, comment UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your review') AS text, user, NULL AS quote, review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND review IS NOT NULL GROUP BY user, review UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your quote') AS text, user, quote, NULL AS review, NULL AS collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND quote IS NOT NULL GROUP BY user, quote UNION ALL SELECT id, seen, 'like' AS type, CONCAT(COUNT(*), ' people liked your collection') AS text, user, NULL AS quote, NULL AS review, collection, NULL AS comment, GROUP_CONCAT(like_from) AS like_from, MAX(date) AS latest_time FROM notifications WHERE type = 'like' AND user = ? AND collection IS NOT NULL GROUP BY user, collection UNION ALL SELECT id, seen, type, text, user, quote, review, collection, comment, like_from, date AS latest_time FROM notifications WHERE type = 'warning' AND user = ? ORDER BY latest_time DESC LIMIT 10 ${offset};`, [req.body.user, req.body.user, req.body.user, req.body.user, req.body.user], async (err, rows, fields) => {
      const enhancedRows = await Promise.all(rows.map(async (el) => {
        if (el.type == 'warning') return;
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
      enhancedRows.unshift(num);
      res.send(enhancedRows);
    });
  });
});

module.exports = router;
