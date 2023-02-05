const jwt = require("jsonwebtoken");

const middlewareController = {
  //verify
  verifyToken: (req, res, next) => {
    const token = req.headers.token; //token = Bearer ACCESSTOKEN
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          res.status(403).json("Token not valid");
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You're not authenticated");
    }
  },

  verifyTokenAndCheckAdmin: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.admin) {
        // Nếu id chính mình mới được delete bản thân hoặc là admin mới được delete
        next();
      } else {
        res.status(403).json("You're not allowed to action");
      }
    });
  },
};

module.exports = middlewareController;
