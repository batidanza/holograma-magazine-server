// productRoutes.js
const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.get("/category", categoryController.getCategory);

router.get("/category/:categoryId", categoryController.getCategoryById);

module.exports = router;
