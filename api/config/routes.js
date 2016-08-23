var router = require('express').Router();
var multer = require('multer');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var uuid = require('uuid');
var authController = require('../controllers/auth');
var s3 = require('../config/s3');
var jwt = require('jsonwebtoken');
var secret = require('../config/tokens').secret;

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: function(req, file, next) {
      next(null, file.mimetype);
    },
    key: function(req, file, next) {
      var ext = '.' + file.originalname.split('.').splice(-1)[0];
      var filename = uuid.v1() + ext;
      next(null, filename);
    }
  })
});

function secureRoute(req, res, next) {
  if(!req.headers.authorization) return res.status(401).json({ message: "Unauthorized" });

  var token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secret, function(err, payload) {
    if(err) return res.status(401).json({ message: "Unauthorized" });
    req.user = payload;
    next();
  });
};

router.post('/register', upload.single('avatar'), authController.register);
router.post('/login', authController.login);
router.route('/me')
  .all(secureRoute)
  .get(authController.profile)
  .put(authController.update)
  .delete(authController.delete);

module.exports = router;