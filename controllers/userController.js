import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
// import { validationResult } from "express-validator";
import UserModel from "../models/user.js";

const { SECRET } = process.env;

export const register = async (req, res) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json(errors.array());
    // }
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
    if (error.message.includes("E11000 duplicate key error")) {
      return res.status(409).json({
        message: "Користувач з такою адресою вже існує",
      });
    }
    res.status(500).json({
      message: "Не вдалось пройти регистрацію",
    });
  }
};

export const login = async (req, res) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json(errors.array());
    // }

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
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User is not logged in",
      });
    }
    const { password, ...userData } = user._doc;
    const token = req.headers.authorization;
    res.json({ ...userData, token });
  } catch (error) {
    res.status(500).json({
      message: "No access to the database",
    });
  }
};
