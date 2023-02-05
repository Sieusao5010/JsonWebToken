const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
// configure body-parser
app.use(express.urlencoded({ extended: true }));

//Use file .env
dotenv.config();

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_URL, () => {
  console.log("CONNECTED TO MONGODB");
});

// app.get("/", (req, res) => {
//   res.send(`<h1>Hello jwt</h1>`);
// });

//ROUTES
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

//AUTHENTICATION -- so sánh password của user với thông tin trên database

//AUTHORIZATION -- PHÂN QUYỀN
