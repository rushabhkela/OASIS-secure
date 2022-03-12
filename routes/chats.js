var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Auth = require('../middlewares/auth');

router.get('/', Auth, async (req, res) => {
    console.log(req.user._id);
    const recent = await Chat.find({ $or: [{ user1: req.user._id }, { user2: req.user._id }] }).sort({ lastActivity: -1 });
    try {
        res.redirect('/chat/room/' + recent[0]._id);
    } catch (error) {
        res.redirect('/chat/room/new');
    }
});

router.get('/search/:q', Auth, async (req, res) => {
    var q = req.params.q;
    const users = await User.find({ name: RegExp(q, 'i') }, {}).select('name');
    res.status(200).json(users);
});

router.get('/joinChat/:id', Auth, async (req, res) => {
    var user1 = (req.user._id).toString();
    var user2 = (req.params.id).toString();
    if (user1 > user2) {
        var temp = user1;
        user1 = user2;
        user2 = temp;
    }

    user1 = mongoose.Types.ObjectId(user1);
    user2 = mongoose.Types.ObjectId(user2);
    var conversation = await Chat.findOne({ user1: user1, user2: user2 });
    if (!conversation) {
        var newConv = new Chat({
            user1: user1,
            user2: user2,
            lastActivity: new Date()
        });
        await newConv.save();
        conversation = newConv;
    }
    res.redirect('/chat/room/' + conversation._id);
})

router.get('/room/:id', Auth, async (req, res) => {
    if (req.params.id == "new") {
        res.render('chat', { title: 'OASIS - Chat', user: req.user });
    }
    else {
        const chatRoom = await Chat.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
        chatRoom.lastActivity = new Date();
        await chatRoom.save();
        var recentChats = await Chat.find({ $or: [{ user1: req.user._id }, { user2: req.user._id }] }).sort({ lastActivity: -1 });
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

        for (let chat of recentChats) {
            var user1 = await User.findOne({ _id: chat.user1 });
            var user2 = await User.findOne({ _id: chat.user2 });
            if ((user1._id).toString() == (req.user._id).toString()) {
                chat.username = user2.name;
            }
            else {
                chat.username = user1.name;
            }
            var dt = new Date(chat.lastActivity);
            chat.day = dt.getDate();
            chat.month = months[dt.getMonth()];
            chat.avatar = `https://ui-avatars.com/api/?name=` + chat.username;
        }

        var html = ``;
        for (let msg of chatRoom.messages) {
            var user = await User.findOne({ _id: mongoose.Types.ObjectId(msg.ofUser) });
            var dt = new Date(msg.timestamp);
            var day = dt.getDate();
            var month = months[dt.getMonth()];
            var hours = dt.getHours();
            var minute = dt.getMinutes();
            if (minute <= 9) {
                minute = "0" + minute;
            }

            if ((msg.ofUser).toString() != (req.user._id).toString()) {
                html += `<div class="d-flex justify-content-start">
                        <div class ="media-body ml-3">
                            <div class ="bg-light rounded py-2 px-3 mb-2" style="margin-left: 5px;">
                                <h6>` + user.name + `</h6>
                                <p class ="text-small mb-0 text-muted">` + msg.content + `</p>
                            </div>
                            <p class ="small text-muted" style="margin-left: 10px;">` + hours + `:` + minute + ` | ` + month + ` ` + day + `</p>
                        </div>
                    </div>`;
            }
            else {
                html += `<div class="d-flex justify-content-end">
                        <div class="media-body">
                            <div class="bg-primary rounded py-2 px-3 mb-2">
                            <h6 class="text-white">` + user.name + `</h6>
                                <p class="text-small mb-0 text-white">` + msg.content + `
                                </p>
                            </div>
                            <p class="small text-muted">` + hours + `:` + minute + ` | ` + month + ` ` + day + `</p>
                        </div>
                    </div>`;
            }
        }
        res.render('chat', { title: 'OASIS - Chat', user: req.user, chatRoom: chatRoom, recentChats: recentChats, prevChats: html });
    }
})

module.exports = router;