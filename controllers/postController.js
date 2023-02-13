// import { validationResult } from "express-validator";

import PostModal from "../models/post.js";

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModal.find().limit(5).exec();
    // if (!posts) {
    //   return res.status(500).json({ message: "Не вдалось отримати пости" });
    // }

    const tags = posts
      .map((obj) => obj.tegs)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (error) {
    res.status(500).json({
      message: "Не вдалось отримати статтi ",
    });
  }
};
export const getAll = async (req, res) => {
  try {
    const posts = await PostModal.find().populate("user").exec();
    if (!posts) {
      return res.status(500).json({ message: "Не вдалось отримати пости" });
    }
    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Не вдалось отримати tags ",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostModal.findByIdAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true },
    );
    if (!post) {
      return res.status(500).json({ message: "Не вдалось отримати пост" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Не вдалось отримати статтю ",
    });
  }
};

export const remote = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModal.findOneAndDelete({ _id: postId }, (err, doc) => {
      if (err) {
        return res.status(500).json({ message: "Не вдалось видалити пост" });
      }
      if (!doc) {
        return res.status(500).json({ message: "Не вдалось знайти пост" });
      }
      res.json({ message: "Видалення пройшло успішно" });
    });
  } catch (error) {
    res.status(500).json({
      message: "Не вдалось видалити статтю ",
    });
  }
};

export const create = async (req, res) => {
  const { title, text, imageUrl, tags } = req.body;

  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json(errors.array());
    // }
    const doc = new PostModal({
      title: title,
      text: text,
      imageUrl: imageUrl,
      tegs: tags,
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Не вдалось створити статтю ",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, text, imageUrl, tags } = req.body;

    PostModal.updateOne(
      {
        _id: postId,
      },
      {
        title,
        text,
        imageUrl,
        user: req.userId,
        tags,
      },
      { new: true },
    );

    const udatePost = await PostModal.findById(postId);

    res.json({
      data: {
        message: "Оновлення пройшло успішно",
        post: udatePost,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не вдалось створити статтю ",
    });
  }
};
