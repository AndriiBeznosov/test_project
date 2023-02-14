import { body } from "express-validator";

export const postCreateValidation = [
  body("title", "Введіть заголовок тексту").isLength({ min: 3 }).isString(),
  body("text", "Введіть текст статьи").isLength({ min: 3 }).isString(),
  body("tegs", "Не вірний формат тегів (вкажіть массив)").optional().isString(),
  body("imageUrl", "Не вірне посилання на картинку").optional().isString(),
];
