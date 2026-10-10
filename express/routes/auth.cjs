const express = require('express');
const bcrypt = require('bcryptjs');
const { connection } = require('./shared.cjs');

const router = express.Router();

router.post('/change_login', (req, res) => {
  if (!req.session.user) return;
  connection.query(`SELECT login FROM users WHERE users.login = ?`, [req.body.new_login], (err, rows, fields) => {
    if (rows.length == 0) {
      connection.query(`UPDATE users SET login = ? WHERE login = ?;`, [req.body.new_login, req.session.user], (err2, rows2, fields2) => {
        res.json('done');
      });
    } else {
      res.json('Username is taken!');
    }
  });
});

router.post('/change_password', (req, res) => {
  if (!req.session.user) return;
  const pass = req.body.new_pass;
  const pass_hashed = bcrypt.hashSync(pass);
  connection.query(`UPDATE users SET haslo = ? WHERE login = ?;`, [pass_hashed, req.session.user], (err2, rows2, fields2) => {
    res.json('done');
  });
});

router.post('/change_visibility', (req, res) => {
  if (!req.session.user) return;
  let status = req.body.change_to == 'private' ? 1 : 0;
  connection.query(`UPDATE users SET private = ? WHERE login = ?`, [status, req.session.user], (err, rows, fields) => {
    res.json('done');
  });
});

router.post('/register', (req, res) => {
  connection.query(`SELECT * FROM banned WHERE email = ?;`, [req.body.email], (err, rows, fields) => {
    if (rows.length > 0) {
      res.send({ status: 0, text: 'Username with this e-mail is banned!' });
      return;
    }
    connection.query(`SELECT login FROM users WHERE login = ?;`, [req.body.login], (err, rows, fields) => {
      if (rows.length > 0) {
        res.send({ status: 0, text: 'Username taken!' });
        return;
      }
      connection.query(`SELECT login FROM users WHERE email = ?;`, [req.body.email], (err, rows, fields) => {
        if (rows.length > 0) {
          res.send({ status: 0, text: 'E-mail already in use!' });
          return;
        }
        const pass = req.body.pass;
        const pass_hashed = bcrypt.hashSync(pass);
        connection.query(`INSERT INTO users(login,haslo,email,prof) VALUES (?,?,?,'');`, [req.body.login, pass_hashed, req.body.email], (err, rows, fields) => {
          res.json('done');
        });
      });
    });
  });
});

router.post('/login', (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  }
  connection.query(`SELECT * FROM users WHERE login = ?`, [req.body.login], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      if (bcrypt.compareSync(req.body.pass, rows[0].haslo)) {
        req.session.user = rows[0].login;
        res.send({ status: 200 });
      } else {
        res.send({ status: 0, text: 'Wrong username/password!' });
      }
    } else {
      res.send({ status: 0, text: 'Wrong username/password!' });
    }
  });
});

router.post('/signout', (req, res) => {
  req.session.destroy();
  res.json('done');
});

router.post('/delete_account', (req, res) => {
  if (!req.session.user) return;
  connection.query(`DELETE FROM users WHERE login = ?`, [req.session.user], (err, rows, fields) => {
    req.session.destroy();
    res.json('done');
  });
});

module.exports = router;
