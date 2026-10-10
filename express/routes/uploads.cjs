const express = require('express');
const fs = require('fs');
const path = require('path');
const { connection, saveBase64Images, uploads } = require('./shared.cjs');

const router = express.Router();

router.post('/deleteProf', (req, res) => {
  if (!req.session.user) return;
  fs.unlink('../public/user_uploads/profs/' + req.body.img, (err) => {
    if (err) console.log('Was unable to delete the file');
  });
  connection.query(`UPDATE users SET prof = "" WHERE login = ?;`, [req.body.login], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/setProf', uploads.profs_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  connection.query(`UPDATE users SET prof = ? WHERE login = ?`, [req.file.filename, req.body.login], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/add_book', uploads.covers_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (!req.file) {
    req.file = { filename: '' };
  }
  connection.query(`INSERT INTO new_books(tytul,autor,rok,strony,opis,tagi,okladka,user,submit_date) VALUES(?,?,?,?,?,?,?,?,NOW())`, [req.body.title, req.body.author, req.body.year, req.body.pages, req.body.desc, req.body.tags, req.file.filename, req.session.user], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/submit_blog_post', uploads.blog_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  let filename = '';
  req.body.text = saveBase64Images(req.body.text);
  if (req.file) {
    filename = req.file.filename;
  }
  connection.query(`INSERT INTO posts(title, text, thumbnail, user) VALUES (?,?,?,?);`, [req.body.title, req.body.text, filename, req.session.user], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_blog_post', uploads.blog_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(req.body.oldtext)) !== null) {
    const fileName = path.basename(match[1]);
    if (req.body.text.includes(fileName)) continue;
    fs.unlink(`../public/uploads/blog/${fileName}`, (err) => {
      if (err) console.log(`Unable to delete image: ${fileName}`);
    });
  }
  req.body.text = saveBase64Images(req.body.text);
  let filename = '';
  if (req.file) {
    filename = req.file.filename;
    if (req.body.oldimg) {
      fs.unlink('../public/uploads/blog/' + req.body.oldimg, (err) => {
        if (err) console.log('Was unable to delete the file');
      });
    }
  }
  if (!req.file && req.body.deleted == 'false') {
    filename = req.body.oldimg;
  }
  if (req.body.deleted == 'true') {
    fs.unlink('../public/uploads/blog/' + req.body.oldimg, (err) => {
      if (err) console.log('Was unable to delete the file');
    });
  }
  connection.query(`UPDATE posts SET title = ?, text = ?, thumbnail = ?, user = ? WHERE id = ?`, [req.body.title, req.body.text, filename, req.session.user, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/add_author', uploads.waiting_authors_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (!req.file) {
    req.file = { filename: '' };
  }
  connection.query(`INSERT INTO new_authors(birth,death,description,photo,user,names) VALUES(?,?,?,?,?,?)`, [req.body.birth, req.body.death, req.body.desc, req.file.filename, req.session.user, req.body.names], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_submission', uploads.covers_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (req.file || req.body.delete_cover == 'true') {
    fs.unlink('../public/user_uploads/covers/' + req.body.old_cover, (err) => {
      if (err) console.log('Was unable to delete the file');
    });
  }
  if (!req.file && req.body.delete_cover == 'false') {
    req.file = { filename: req.body.old_cover };
  }
  if (!req.file && req.body.delete_cover == 'true') {
    req.file = { filename: '' };
  }
  connection.query(`UPDATE new_books SET tytul = ?, autor = ?, rok = ?, strony = ?, opis = ?, tagi = ?, okladka = ?, user = ? WHERE id = ?`, [req.body.title, req.body.author, req.body.year, req.body.pages, req.body.desc, req.body.tags, req.file.filename, req.session.user, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_author_submission', uploads.waiting_authors_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (req.file || req.body.delete_photo == 'true') {
    fs.unlink('../public/user_uploads/authors/' + req.body.old_photo, (err) => {
      if (err) console.log('Was unable to delete the file');
    });
  }
  if (!req.file && req.body.delete_photo == 'false') {
    req.file = { filename: req.body.old_photo };
  }
  if (!req.file && req.body.delete_photo == 'true') {
    req.file = { filename: '' };
  }
  connection.query(`UPDATE new_authors SET birth = ?, death = ?, description = ?, photo = ?, user = ?, names = ? WHERE id = ?`, [req.body.birth, req.body.death, req.body.desc, req.file.filename, req.session.user, req.body.names, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_book', uploads.books_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (req.file || req.body.delete_cover == 'true') {
    fs.unlink('../public/uploads/' + req.body.old_cover, (err) => {
      if (err) console.log('Was unable to delete the file');
    });
  }
  if (!req.file && req.body.delete_cover == 'false') {
    req.file = { filename: req.body.old_cover };
  }
  if (!req.file && req.body.delete_cover == 'true') {
    req.file = { filename: '' };
  }
  connection.query(`UPDATE books SET tytul = ?, autor = ?, rok = ?, strony = ?, opis = ?, tagi = ?, okladka = ? WHERE id = ?`, [req.body.title, req.body.author, req.body.year, req.body.pages, req.body.desc, req.body.tags, req.file.filename, req.body.id], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/edit_author', uploads.authors_upload.single('img'), (req, res) => {
  if (!req.session.user) return;
  if (req.file || req.body.delete_photo == 'true') {
    fs.unlink('../public/uploads/authors/' + req.body.old_photo, (err) => {
      if (err) console.log('Was unable to delete the file');
    });
  }
  if (!req.file && req.body.delete_photo == 'false') {
    req.file = { filename: req.body.old_photo };
  }
  if (!req.file && req.body.delete_photo == 'true') {
    req.file = { filename: '' };
  }
  let names = req.body.names.split(',');
  connection.query(`UPDATE authors SET birth = ?, death = ?, description = ?, photo = ? WHERE id = ?`, [req.body.birth, req.body.death, req.body.desc, req.file.filename, req.body.id], (err, rows, fields) => {
    connection.query(`DELETE FROM authors_aliases WHERE author = ?`, [req.body.id], (err, rows, fields) => {
      names.forEach(name => {
        connection.query(`INSERT INTO authors_aliases (name,author) VALUES (?,?);`, [name, req.body.id], (err, rows, fields) => {
        });
      });
      res.json('done');
    });
  });
});

module.exports = router;
