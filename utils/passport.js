var passport = require('passport');
var CookieStrategy = require('passport-cookie').Strategy;

passport.use(new CookieStrategy(
    function (token, done) {
        User.findOne({ token: token }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { 
                return done(null, false); }
            return done(null, user);
        });
    }
));