var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var s3 = require('../config/s3');

var userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: String,
  passwordHash: { type: String, required: true }
});

userSchema.pre('remove', function(next) {
  var self = this;
  s3.deleteObjects({
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: [{
        Key: self.profileImage
      }]
    }
  }, function(err) {
    next(err);
  });
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, json) {
    delete json.passwordHash;
    delete json.profileImage;
    return json;
  }
});

userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.passwordHash = bcrypt.hashSync(this._password, bcrypt.genSaltSync(8));
  });

userSchema.virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(passwordConfirmation) {
    this._passwordConfirmation = passwordConfirmation;
  });

userSchema.path('passwordHash')
  .validate(function(passwordHash) {
    if(this.isNew) {
      if(!this._password) return this.invalidate('password', 'A password is required');
      if(this._password !== this._passwordConfirmation) return this.invalidate('passwordConfirmation', 'Passwords do not match');
    }
  });

userSchema.virtual('profileImageUrl')
  .get(function() {
    return "https://s3-eu-west-1.amazonaws.com/" + process.env.AWS_BUCKET_NAME + "/" + this.profileImage
  });

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

module.exports = mongoose.model('User', userSchema);