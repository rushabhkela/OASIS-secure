const socketIO = require('socket.io');
const mongoose = require('mongoose');

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    
module.exports = function(server) {
    const io = socketIO(server);
    io.on('connection', (client) => {
        client.on('joinChat', async (data) => { 
            var conversation = await Chat.findOne({_id : mongoose.Types.ObjectId(data.room)});
            client.room = (conversation._id).toString();
            client.join(client.room);
            console.log("Joined Conv");
        });

        client.on('chatMessage', async (data) => {
            const conversation = await Chat.findOne({_id: mongoose.Types.ObjectId(data.chat)});
            const user = await User.findOne({_id : mongoose.Types.ObjectId(data.userid)});
            var temp = conversation.messages;
            temp.push({
                ofUser : mongoose.Types.ObjectId(data.userid),
                content : data.message,
                timestamp : new Date()
            });
            conversation.messages = temp;
            conversation.lastActivity = new Date();
            conversation.lastMessage = data.message;
            await conversation.save();

            data.username = user.name;
            data.avatar = `https://ui-avatars.com/api/?name=` + user.name;
            var dt = new Date(conversation.lastActivity);
            data.day = dt.getDate();
            data.month = months[dt.getMonth()];
            data.hours = dt.getHours();
            data.minute = dt.getMinutes();
            io.to(client.room).emit('chatMessage', data);
        });

        client.on('typing', (data) => {
            io.to(client.room).emit('typing', data);
        })

        client.on('disconnect', () => { 
            client.leave(client.room);
        });
    });
}
