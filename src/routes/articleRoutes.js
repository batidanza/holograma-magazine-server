const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const articleController = require("../controllers/articleController");

cloudinary.config({
  cloud_name: "dujuk4cga",
  api_key: "147193366683265",
  api_secret: "zDMUzq9ANImmuLlKNU5oFwwOFXE",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Articles",
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

router.get("/articles", articleController.getAllArticles);
router.get("/:articleId", articleController.getArticleById);

const uploadArticleMedia = upload.fields([
  { name: "image", maxCount: 20 },
  { name: "audio", maxCount: 20 },
  { name: "video", maxCount: 20 },
]);

router.post(
  "/create_article",
  uploadArticleMedia,
  articleController.createArticle
);
router.post("/:articleId", uploadArticleMedia, articleController.updateArticle);

router.delete("/:articleId", articleController.deleteArticle);
router.post(
  "/:articleId/images",
  upload.array("image"),
  articleController.addImagesToArticle
);
router.delete("/:articleId/images", articleController.deleteImage);

router.post(
  "/:articleId/audio",
  upload.array("audio"),
  articleController.uploadAudioToArticle
);
router.put(
  "/:articleId/audio",
  upload.array("audio"),
  articleController.editAudioOfArticle
);

router.post(
  "/:articleId/video",
  upload.array("video"),
  articleController.uploadVideoToArticle
);
router.put(
  "/:articleId/video",
  upload.array("video"),
  articleController.editVideoOfArticle
);

module.exports = router;
