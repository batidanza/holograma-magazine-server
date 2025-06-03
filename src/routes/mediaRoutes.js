const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mediaController = require("../controllers/mediaController");

cloudinary.config({
  cloud_name: "dujuk4cga",
  api_key: "147193366683265",
  api_secret: "zDMUzq9ANImmuLlKNU5oFwwOFXE",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Media",
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

router.get("/media", mediaController.getAllMedia);

router.post("/upload", upload.array("Image"), mediaController.uploadMedia);

router.get("/byProduct/:productId", mediaController.getMediaByProduct);

module.exports = router;
