const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/auth", userController.createOrUpdateUser);
router.get("/:uid", userController.getUserByUid);

module.exports = router;