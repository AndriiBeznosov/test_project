import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";

import { registerValidation, loginValidation } from "./validation/auth.js";
import { postCreateValidation } from "./validation/post.js";
import checkAuth from "./utils/checkAuth.js";
import { UserController, PostController } from "./controllers/index.js";
import hendleValidationErrors from "./utils/hendleValidationErrors.js";

const { URL_MONGODB, PORT } = process.env;

mongoose.set("strictQuery", false);
mongoose
  .connect(URL_MONGODB)
  .then(() => console.log("DB OK"))
  .catch((err) => console.error("DB error", err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cd) => {
    cd(null, "uploads");
  },
  filename: (_, file, cd) => {
    cd(null, file.originalname);
  },
});
const upload = multer({ storage });

// app.use(express.json());
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

//image
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});

// User
app.post(
  "/auth/register",

  registerValidation,
  hendleValidationErrors,
  UserController.register,
);
app.post(
  "/auth/login",
  loginValidation,
  hendleValidationErrors,
  UserController.login,
);
app.get("/auth/me", checkAuth, UserController.getMe);
app.get("/tegs", PostController.getLastTags);

//Post
app.get("/posts", PostController.getAll);
app.get("/posts/tegs", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  hendleValidationErrors,
  PostController.create,
);
app.delete("/posts/:id", checkAuth, PostController.remote);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  hendleValidationErrors,
  PostController.update,
);

app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log("Conect server PORT 4444");
});
