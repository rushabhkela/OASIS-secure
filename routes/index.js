var express = require('express');
var router = express.Router();
const requireUser = require("../middlewares/requireUser");

router.get('/', async (req, res) => {
  res.render('index', { title: 'OASIS - Home'});
});

router.get('/error', async (req, res) => {
  res.render('error', { title: "OASIS"});
})

router.get('/secret', requireUser, async (req, res) => {
  res.render('indexs', { title: 'OASIS - Home'});
});


module.exports = router;
