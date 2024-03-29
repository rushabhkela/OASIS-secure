var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');

var dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const requireUser = require("../middlewares/requireUser");

const DBmodule = require("../utils/connectDB");
const createSession = DBmodule.createSession;
const invalidateSession = DBmodule.invalidateSession;

const JWTmodule = require("../utils/jwtUtils");
const signJWT = JWTmodule.signJWT;


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.TWILIO_SENDGRID_API_KEY)

router.route('/register')
  .get(async (req, res) => {
    res.render('signup', { title: 'OASIS - Sign up', user: req.user  });
  })
  .post(async (req, res) => {
    var newUser = new User({
      email: sanitize(req.body.email),
      regno: sanitize(req.body.regno),
      name: sanitize(req.body.name),
      contact: sanitize(req.body.contact),
    });

    await newUser.save();
    newUser.setPassword(req.body.password);
    newUser.save(function (err) {
      if (err) {
        res.render('register', { errorMessages: err, user: req.user  });
      } else {
        res.redirect('/users/login');
      }
    })
  });


router.route('/login')
  .get(async (req, res) => {
    res.render('login', { title: "OASIS - Login", user: req.user  })
  })
  .post(async (req, res) => {
    const { otp, password, email } = req.body;
    var user = await User.findOne({
      email: sanitize(`${email}`),
      password: sanitize(`${password}`)
    });

    if (!user) {
      res.redirect('/users/login');
    }
    else if (otp != user.otp) {
      res.redirect('/users/logout');
    }
    else {
      const session = createSession(user);
      const accessToken = signJWT({
        email: user.email,
        sessionId: session.sessionId,
        _id: user._id,
        regno: user.regno,
        name: user.name,
        contact: user.contact,
      }, "5m");
      const refreshToken = signJWT({ sessionId: session.sessionId }, '2d');
      res.cookie('accessToken', accessToken, {
        maxAge: 600000,
        httpOnly: true
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 172800000,
        httpOnly: true
      });

      res.redirect('/');
    }
  })


router.get('/getotp/:email', async (req, res) => {
  const randNum = Math.floor((Math.random() * 100000) + 10000);
  const msg = {
    to: req.params.email,
    from: 'help.vitdost@gmail.com',
    subject: 'OTP - Please do not share with anyone',
    html: `<h1>Hello, User!</h1>
  <h4>Your OTP for logging into OASIS is : </h4>
  <h2>` + randNum + `</h2>
  <h4>Thank You</h4>
  <h4>OASIS Team</h4>
  `
  }
  sgMail
    .send(msg)
    .then(async () => {
      console.log('Email sent');
      await User.findOneAndUpdate({ email: req.params.email }, { otp: randNum });
      res.status(200).json({ "message": "OTP sent" });
    })
    .catch((error) => {
      console.log(error);
    })
});


router.get('/logout', requireUser, async (req, res) => {
  res.cookie('accessToken', "", {
    maxAge: 0,
    httpOnly: true
  });

  res.cookie("refreshToken", "", {
    maxAge: 0,
    httpOnly: true,
  });

  const session = invalidateSession(req.user.sessionId);
  res.redirect('/');
});

module.exports = router;
