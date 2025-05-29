const db = require("../database/models");

const getAllMedia = async (req, res) => {
  try {
    const allMedia = await db.Media.findAll();
    res.json(allMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los medios" });
  }
};

const getMediaByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const media = await db.Media.findAll({
      where: { ProductID: productId },
    });
    res.json(media);
  } catch (error) {
    console.error(
      `Error obtaining media photos for product with ID ${req.params.mediaId}:`,
      error
    );
    res.status(500).json({ error: "Error obtaining media for product" });
  }
};

const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "No se ha proporcionado ninguna imagen" });
    }

    const { ProductID } = req.body;

    const uploadedFiles = req.files;
    const uploadedMedia = uploadedFiles.map((file) => ({
      Image: file.path,
      ProductID,
    }));

    const createdMedia = await db.Media.bulkCreate(uploadedMedia);

    res.json({ message: "Medios creados exitosamente", media: createdMedia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar los medios" });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaByProduct,
};
