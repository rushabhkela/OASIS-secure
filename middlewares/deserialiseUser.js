const DBmodule = require("../utils/connectDB");
const getSession = DBmodule.getSession;

const JWTmodule = require("../utils/jwtUtils");
const signJWT = JWTmodule.signJWT;
const verifyJWT = JWTmodule.verifyJWT;

function deserializeUser(req, res, next) {
  
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken && !refreshToken) {
    return next();
  }

  const { payload, expired } = verifyJWT(accessToken);
  console.log(payload);
  if (payload) {
    req.user = payload;
    return next();
  }
  const {payload : refresh} = expired && refreshToken ? verifyJWT(refreshToken) : { payload : null };
  if(!refresh) {
      return next();
  } 
  const session = getSession(refresh.sessionId);
  if(!session) {
      return next();
  }
  const newAccessToken = signJWT(session, "5m");
  res.cookie("accessToken", newAccessToken, {
      maxAge : 300000,
      httpOnly : true
  });

  req.user = verifyJWT(newAccessToken).payload;

  return next();
}

module.exports = deserializeUser;
