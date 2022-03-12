var mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user1 : mongoose.Schema.Types.ObjectId,
    user2 : mongoose.Schema.Types.ObjectId,
    messages: [
        {
            ofUser : mongoose.Schema.Types.ObjectId,
            content : String,
            timestamp : Date
        }
    ],
    lastActivity : Date,
    lastMessage : String
});

module.exports = mongoose.model('Chat', chatSchema);
