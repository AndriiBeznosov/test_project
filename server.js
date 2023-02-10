import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import mongoose from "mongoose";
import { validationResult } from "express-validator";

import { registerValidation } from "./validation/auth.js";
import UserModel from "./models/user.js";

const { URL_MONGODB, SECRET } = process.env;

mongoose.set("strictQuery", false);

mongoose
  .connect(URL_MONGODB)
  .then(() => console.log("DB OK"))
  .catch((err) => console.error("DB error", err));

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const passwordUser = req.body.password;
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(passwordUser, salt);

    const doc = new UserModel({
      email: req.body.email,
      password: hash,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET,
      {
        expiresIn: "30d",
      },
    );

    const { password, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не вдалось пройти регистрацію",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        message: "Користувач не зареєстрований",
      });
    }

    const isValidPass = await bcryptjs.compare(
      req.body.password,
      user._doc.password,
    );
    if (!isValidPass) {
      return res.status(400).json({ message: "Не вірний логін чи пароль" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET,
      {
        expiresIn: "30d",
      },
    );

    const { password, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не вдалось зайти в систему ",
    });
  }
});

app.listen(5000, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log("Conect server PORT 5000");
});
