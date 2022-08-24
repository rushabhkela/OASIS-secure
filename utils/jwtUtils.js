const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require('path');
const dotenv = require('dotenv')
dotenv.config({path : "../.env"})

const privateKey = process.env.PVT_KEY;
const publicKey = process.env.PUB_KEY;

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