// productRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const productController = require("../controllers/productController");

cloudinary.config({
  cloud_name: "dujuk4cga",
  api_key: "147193366683265",
  api_secret: "zDMUzq9ANImmuLlKNU5oFwwOFXE",
});

const imageCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Products",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif", "JPG"],
  },
});

const imageCloudinaryUpload = multer({ storage: imageCloudinaryStorage });

router.get("/products", productController.getProducts);

router.get("/product_detail/:id", productController.getProductById);

router.get("/search", productController.searchProducts);

router.post("/payment", productController.payment);

router.get("/byCategory/:category_id", productController.getProductsByCategory);

router.post(
  "/create_product",
  imageCloudinaryUpload.array("image"),
  productController.createProduct
);

router.post(
  "/update/:id",
  imageCloudinaryUpload.array("image"),
  productController.updateProduct
);

module.exports = router;
