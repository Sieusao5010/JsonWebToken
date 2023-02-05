const User = require("../models/UserModel");

const userController = {
  //Get All User
  getAllUsers: async (req, res) => {
    try {
      const user = await User.find();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //Delete User
  deleteUser: async (req, res) => {
    try {
      const checkExist = await User.findById(req.params.id);
      if (checkExist) {
        //Xóa tượng trưng
        const user = await User.findById(req.params.id);

        //Xóa thiệt
        // const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Delete SuccessFully");
      } else {
        res.status(404).json("NOT FOUND");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = userController;
