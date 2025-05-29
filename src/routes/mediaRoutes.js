const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mediaController = require("../controllers/mediaController");

cloudinary.config({
  cloud_name: "dpnrapsvi",
  api_key: "874593837933416",
  api_secret: "c_a2SUynA5J4O6y5yFCbL6HzADA",
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
