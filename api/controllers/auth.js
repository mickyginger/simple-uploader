var jwt = require('jsonwebtoken');
var User = require('../models/user');
var secret = require('../config/tokens').secret;

function register(req, res) {
  req.body.profileImage = req.file.key;

  User.create(req.body, function(err, user) {
    if(err) return res.status(400).json(err);

    var payload = {
      _id: user._id,
      username: user.username,
      profileImageUrl: user.profileImageUrl
    };

    var token = jwt.sign(payload, secret, { expiresIn: 60*60*2 });
    res.status(200).send({ user: user, token: token });
  });
}

function login(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if(err) return res.status(500).json(err);
    if(!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: "Invalid credentials" });

    var payload = {
      _id: user._id,
      username: user.username,
      profileImageUrl: user.profileImageUrl
    };

    var token = jwt.sign(payload, secret, { expiresIn: 60*60*2 });
    res.status(200).json({ user: user, token: token });
  });
}

function profile(req, res) {
  User.findById(req.user._id, function(err, user) {
    if(err) return res.status(500).json(err);
    if(!user) return res.status(401).json({ message: "Invalid credentials" });

    res.send(200).json({ user: user });
  });
}

function update(req, res) {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true }, function(err, user) {
    if(err) return res.status(500).json(err);
    if(!user) return res.status(401).json({ message: "Invalid credentials" });

    var payload = {
      _id: user._id,
      username: user.username,
      profileImageUrl: user.profileImageUrl
    };

    var token = jwt.sign(payload, secret, { expiresIn: 60*60*2 });
    res.status(200).json({ user: user, token: token });
  });
}

function deleteUser(req, res) {
  User.findById(req.user._id, function(err, user) {
    if(err) return res.status(500).json(err);
    if(!user) return res.status(401).json({ message: "Invalid credentials" });

    user.remove(function(err) {
      if(err) return res.status(500).json(err);
      return res.status(204).end();
    });
  });
}

module.exports = {
  register: register,
  login: login,
  profile: profile,
  update: update,
  delete: deleteUser
}