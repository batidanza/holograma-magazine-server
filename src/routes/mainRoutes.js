// mainRoutes.js
const express = require("express");
const router = express.Router();

const mediaRoutes = require("./mediaRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");

router.get("/", (req, res) => {
  res.send("Welcome to the root URL");
});

router.use("/products", productRoutes);
router.use("/media", mediaRoutes);
router.use("/category", categoryRoutes);
router.use("/users", userRoutes);

module.exports = router;
