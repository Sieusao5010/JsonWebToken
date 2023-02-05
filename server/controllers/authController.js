const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

let RTokenArray = [];
const authController = {
  //Register
  registerUser: async (req, res) => {
    try {
      //Mã hóa mật khẩu -- Hashed Password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //   //Create new User
      //   const newUser = await new User({
      //     username: req.body.username,
      //     email: req.body.email,
      //     password: hashed,
      //   });
      //   //Save to DB
      //   const user = newUser.save();

      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Generate Access token - tạo access token
  // generateAccessToken: (user) => {
  //   jwt.sign(
  //     {
  //       id: user.id,
  //       admin: user.admin,
  //     },
  //     process.env.JWT_ACCESS_KEY, //secret key

  //     {
  //       expiresIn: "30s", //Thời gian mà key hết hạn
  //     }
  //   );
  // },

  // //Generate Refresh token - tạo Refresh token
  // generateRefreshToken: (user) => {
  //   jwt.sign(
  //     {
  //       id: user.id,
  //       admin: user.admin,
  //     },
  //     process.env.JWT_REFRESH_KEY, //Refresh key

  //     {
  //       expiresIn: "365d", //Thời gian mà key hết hạn
  //     }
  //   );
  // },
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Login
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Wrong Username");
      }
      const validatePassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validatePassword) {
        return res.status(404).json("wrong Password");
      }
      if (user && validatePassword) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_ACCESS_KEY, //secret key

          {
            expiresIn: "30s", //Thời gian mà key hết hạn
          }
        );
        const refreshToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_REFRESH_KEY, //Refresh key

          {
            expiresIn: "365d", //Thời gian mà key hết hạn
          }
        );
        RTokenArray.push(refreshToken); //Lưu Rtoken vào mảng

        //GẮN refresh token vào cookies
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict", //đề phòng tấn công
        });
        const { password, ...others } = user._doc; //trả về thông tin user loại từ password
        res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  requestRefreshToken: async (req, res) => {
    //Lấy Rtoken từ user -- Take Refresh token from user
    const RToken = req.cookies.refreshToken;
    if (!RToken)
      return res.status(401).json({ msg: "You're not authenticated" });
    if (!RTokenArray.includes(RToken))
      return res.status(403).json({ msg: "RefreshToken is not valid" });
    jwt.verify(RToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }

      RTokenArray = RTokenArray.filter((token) => token !== RToken); //Lọc token cũ trả về array mới khi không có token cũ
      //Create new token
      const newAToken = jwt.sign(
        {
          id: user.id,
          admin: user.admin,
        },
        process.env.JWT_ACCESS_KEY, //secret key

        {
          expiresIn: "30s", //Thời gian mà key hết hạn
        }
      );
      const newRToken = jwt.sign(
        {
          id: user.id,
          admin: user.admin,
        },
        process.env.JWT_REFRESH_KEY, //Refresh key

        {
          expiresIn: "365d", //Thời gian mà key hết hạn
        }
      );
      RTokenArray.push(newRToken); //Thêm token mới vào mảng
      res.cookie("refreshToken", newRToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict", //đề phòng tấn công
      });
      res.status(200).json({ accessToken: newAToken });
    });
  },

  userLogout: async (req, res) => {
    res.clearCookie("refreshToken");
    RTokenArray = RTokenArray.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.status(200).json({ msg: "Logged out!" });
  },
};

////////////////////////////STORE TOKEN ---    3 CÁCH LƯU TRỮ TOKEN
//1/ LOCAL STRORAGE
// => DỄ BỊ TẤN CÔNG XXS (CHẠY SCRIPT ĐỂ LẤY DỮ LIỆU)

//2/ COOKIES
// => ÍT BỊ ẢNH HƯỞNG BỞI XXS, NHỮNG DỄ BỊ CSRF (CÁC WEB GIẢ MẠO ĐÁNH CẮP COOKIES)      KHẮC PHỤC BỞI SAMESITE
// AN TOÀN KHI LÀ         HTTPONLY COOKIES

//3/  REDUX STORE       ->    ACCESS TOKEN
//    HTTPONLY COOKIES  ->    REFRESH TOKEN

///// CÁCH NGĂN CHẶN =======> BFF PATTERN (BACKEND FOR FRONTED )
/////////////////////////////////////////////////////////////////////////

module.exports = authController;
