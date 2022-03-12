const jwt = require("jsonwebtoken")
const fs = require("fs")
const dotenv = require('dotenv')
dotenv.config({path : "../.env"})

const privateKey = fs.readFileSync(process.env.KEY_DIR + '/jwtRS256.key', 'utf8');
const publicKey = fs.readFileSync(process.env.KEY_DIR + '/jwtRS256.pem', 'utf8');;

const signJWT = (payload, expiresIn) => {
  return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn });
}


const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, publicKey.trim(), {algorithms: ["RS256"]});
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: true };
  }
}

module.exports = {
  signJWT: signJWT,
  verifyJWT: verifyJWT
}