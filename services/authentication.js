require("dotenv").config(); 

const JWT = require("jsonwebtoken");
const secret = process.env.SECRET;

function createTokenforUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    return JWT.sign(payload, secret);
}

function validateToken(token) {
    return JWT.verify(token, secret);
}

module.exports = {
    createTokenforUser,
    validateToken
};
