var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Auth = require('../middlewares/auth');

router.route('/register')
  .get(async (req, res) => {
    res.render('signup', { title: "OASIS - Sign up" })
  })
  .post(async (req, res) => {
    var newUser = new User({
      name: req.body.name,
      regno: req.body.regno,
      email: req.body.email,
      contact: req.body.contact,
      password: req.body.password
    });

    await newUser.save();
    res.redirect('/users/login')
  })

router.route('/login')
  .get(async (req, res) => {
    res.render('login', { title: "OASIS - Login" })
  })
  .post(async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const user = await User.findOne({ email: email, password: password });
    if (!user) {
      res.redirect('/users/login');
    }
    else {
      user.token = uuidv4();
      await user.save();
      res.cookie("token", user.token);
      res.redirect('/');
    }
  })


router.get('/logout', async (req, res) => {
  req.logout();
  await User.findOneAndUpdate({ token: req.cookies['token'].toString() }, { token: "" })
  res.clearCookie("token");
  res.redirect('/');
});

module.exports = router;
