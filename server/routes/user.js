const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router = require("express").Router();

//Get all user
router.get("/", middlewareController.verifyToken, userController.getAllUsers);

//Delete user
router.delete(
  "/:id",
  middlewareController.verifyTokenAndCheckAdmin,
  userController.deleteUser
);
module.exports = router;
