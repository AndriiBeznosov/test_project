import { body } from "express-validator";

export const registerValidation = [
  body("password", "Пароль повинен бути мінимум 5 символів").isLength({
    min: 5,
  }),
  body("fullName", "Вкажіть 'і'мя' не менше 3 символів").isLength({ min: 3 }),
  body("avatarUrl", "Не вірний формат посилання до картинки")
    .optional()
    .isURL(),
];

export const loginValidation = [
  body("email", "Не вірний формат пошти").isEmail(),
  body("password", "Пароль повинен бути мінимум 5 символів").isLength({
    min: 5,
  }),
];
