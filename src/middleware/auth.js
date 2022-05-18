const jwt = require('jsonwebtoken');

const middleware = async function (req, res, next) {
  try {

    //Authentiscation
    const token = req.headers["x-api-token"];
    if (!token) {
      return res.status(401).send({ status: false, message: 'token must be present' });
    }

  //Authorization
    var decodedToken = jwt.verify(token, 'my-secret');

    if(!decodedToken){
      return res.status(401).send({status: false, message: 'Token is Invalid' })
    }
    req.userId = decodedToken.userId;
    next();
  } 
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

module.exports.middleware = middleware