const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const articleController = require("../controllers/articleController");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dujuk4cga",
  api_key: "147193366683265",
  api_secret: "zDMUzq9ANImmuLlKNU5oFwwOFXE",
});

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Articles",
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

// Rutas para artículos
router.get("/articles", articleController.getAllArticles);
router.get("/:articleId", articleController.getArticleById);
router.post("/create_article", upload.array("image"), articleController.createArticle);
router.post(
  "/:articleId",
  upload.array("image"),
  articleController.updateArticle
);
router.delete("/:articleId", articleController.deleteArticle);
router.post(
  "/:articleId/images",
  upload.array("image"),
  articleController.addImagesToArticle
);
router.delete("/:articleId/images", articleController.deleteImage);

module.exports = router;
