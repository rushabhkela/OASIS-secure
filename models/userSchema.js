var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name : {
    type: String,
    required : true
  },
  regno : {
    type: String,
    required : true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  contact : {
    type: Number,
    required : true
  },
  password: {
    type: String,
    required: true
  },
  token : {
    type: String,
    default : ""
  }
});

module.exports = mongoose.model('User', userSchema);
