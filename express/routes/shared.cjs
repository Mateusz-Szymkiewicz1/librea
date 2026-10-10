const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'librea'
});

function queryAsync(connection, sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results, fields) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function like_notification(user_session, type, user, id) {
  if (user_session == user) return;
  let text = `${user_session} has liked your ${type}.`;
  connection.query(`INSERT INTO notifications (type,text,user,${type},like_from) VALUES ('like',?,?,?,?);`, [text, user, id, user_session], (err, rows, fields) => {});
}

function unlike_notification(user_session, type, user, id) {
  if (user_session == user) return;
  connection.query(`DELETE FROM notifications WHERE user = ? AND like_from = ? AND ${type} = ?`, [user, user_session, id], (err, rows, fields) => {});
}

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
    const filepath = path.join(__dirname, '../../public/uploads/blog', filename);

    fs.writeFileSync(filepath, buffer);
    newHtml = newHtml.replace(match[0], match[0].replace(match[0].match(/src="[^"]+"/)[0], `src="../../public/uploads/blog/${filename}"`));
    imgIndex++;
  }
  return newHtml;
};

const createDiskStorage = (directory) => multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directory);
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});

const profs_storage = createDiskStorage('../public/user_uploads/profs');
const covers_storage = createDiskStorage('../public/user_uploads/covers');
const books_storage = createDiskStorage('../public/uploads');
const waiting_authors_storage = createDiskStorage('../public/user_uploads/authors');
const authors_storage = createDiskStorage('../public/uploads/authors');
const blog_storage = createDiskStorage('../public/uploads/blog');

const profs_upload = multer({ storage: profs_storage, limits: { fieldSize: 50 * 1024 * 1024 } });
const covers_upload = multer({ storage: covers_storage, limits: { fieldSize: 50 * 1024 * 1024 } });
const books_upload = multer({ storage: books_storage, limits: { fieldSize: 50 * 1024 * 1024 } });
const waiting_authors_upload = multer({ storage: waiting_authors_storage, limits: { fieldSize: 50 * 1024 * 1024 } });
const authors_upload = multer({ storage: authors_storage, limits: { fieldSize: 50 * 1024 * 1024 } });
const blog_upload = multer({ storage: blog_storage, limits: { fieldSize: 50 * 1024 * 1024 } });

module.exports = {
  connection,
  queryAsync,
  like_notification,
  unlike_notification,
  saveBase64Images,
  uploads: {
    profs_upload,
    covers_upload,
    books_upload,
    waiting_authors_upload,
    authors_upload,
    blog_upload
  }
};
