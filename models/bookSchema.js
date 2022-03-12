var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
  name : {
    type: String,
    required : true
  },
  description : {
    type: String,
    required : true
  } ,
  link:{
    type: String,
    required : true
  }
});

module.exports = mongoose.model('Book', bookSchema);
