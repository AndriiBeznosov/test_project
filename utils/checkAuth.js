import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, ""); //replace(/Bearer\s?/, "") - видаляє слово яке вкажеш й замінює його на пусту стрічку

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      req.userId = decoded._id;
    } catch (error) {
      return res.status(403).json({
        message: "decoded problem",
      });
    }
  } else {
    return res.status(403).json({
      message: "No avtorization",
    });
  }

  next();
};
