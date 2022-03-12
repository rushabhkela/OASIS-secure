var mongoose = require('mongoose');

var docSchema = new mongoose.Schema({
  name : {
    type: String,
    required : true
  },
  location : {
      type: String,
      required : true
  },
  ofUser : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },
  uploadedAt : {
    type : Date,
    required : true
  },
  description : {
    type : String,
    required : true
  }
});

module.exports = mongoose.model('Docs', docSchema);
