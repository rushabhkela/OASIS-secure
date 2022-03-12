var passport = require('passport');

const Auth = passport.authenticate("cookie", {
  failureRedirect: '/users/login',
  session: false
});

module.exports = Auth;