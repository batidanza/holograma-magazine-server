// productRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const productController = require("../controllers/productController");

cloudinary.config({
  cloud_name: "dpnrapsvi",
  api_key: "874593837933416",
  api_secret: "c_a2SUynA5J4O6y5yFCbL6HzADA",
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

router.put(
  "/update/:id",
  imageCloudinaryUpload.array("image"),
  productController.updateProduct
);

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
