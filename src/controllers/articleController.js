const db = require("../database/models");

// Obtener todos los artículos
const getAllArticles = async (req, res) => {
  try {
    const articles = await db.Article.findAll({
      include: [
        {
          model: db.Category,
          as: "categories",
        },
        {
          model: db.User,
          as: "author",
        },
      ],
    });
    res.json(articles);
  } catch (error) {
    console.error("Error al obtener los artículos:", error);
    res.status(500).json({ error: "Error al obtener los artículos" });
  }
};

// Obtener un artículo por ID
const getArticleById = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const article = await db.Article.findByPk(articleId, {
      include: [
        {
          model: db.Category,
          as: "categories",
        },
        {
          model: db.User,
          as: "author",
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.json(article);
  } catch (error) {
    console.error(
      `Error al obtener el artículo con ID ${req.params.articleId}:`,
      error
    );
    res.status(500).json({ error: "Error al obtener el artículo" });
  }
};

// Crear un nuevo artículo
const createArticle = async (req, res) => {
  console.log(req.body);
  try {
    const { title, artist, content, type, author_uid, categories } = req.body;

    if (!title || !type || !author_uid) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Procesar archivos por campo
    const imageUrls = (req.files?.image || []).map((file) => file.path);
    const audioUrls = (req.files?.audio || []).map((file) => file.path);
    const videoUrls = (req.files?.video || []).map((file) => file.path);

    const newArticle = await db.Article.create({
      title,
      content,
      type,
      artist,
      author_uid,
      image: imageUrls,
      audio: audioUrls,
      video: videoUrls,
    });

    if (categories && categories.length > 0) {
      await Promise.all(
        categories.map((categoryId) =>
          db.ArticleCategory.create({
            article_id: newArticle.id,
            category_id: categoryId,
          })
        )
      );
    }

    const createdArticle = await db.Article.findByPk(newArticle.id, {
      include: [
        { model: db.Category, as: "categories" },
        { model: db.User, as: "author" },
      ],
    });

    res.status(201).json({
      message: "Artículo creado exitosamente",
      article: createdArticle,
    });
  } catch (error) {
    console.error("Error al crear el artículo:", error);
    res.status(500).json({ error: "Error al crear el artículo" });
  }
};

// Actualizar un artículo
const updateArticle = async (req, res) => {
  console.log(req.body);

  try {
    const articleId = req.params.articleId;
    const { title, artist, content, type, author_uid, categories } = req.body;

    // Orden de imágenes
    let imageOrder = [];
    if (req.body.imageOrder) {
      try {
        imageOrder = Array.isArray(req.body.imageOrder)
          ? req.body.imageOrder
          : JSON.parse(req.body.imageOrder);
      } catch (e) {
        console.error("Error al parsear el orden de imágenes:", e);
      }
    }

    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (author_uid !== undefined) updateData.author_uid = author_uid;

    // Imágenes: eliminar, reordenar y añadir nuevas
    const imagesToDelete = req.body.imagesToDelete
      ? Array.isArray(req.body.imagesToDelete)
        ? req.body.imagesToDelete
        : [req.body.imagesToDelete]
      : [];

    let existingImages = Array.isArray(article.image)
      ? article.image
      : typeof article.image === "string"
      ? JSON.parse(article.image || "[]")
      : [];

    existingImages = existingImages.filter((img) => !imagesToDelete.includes(img));

    if (imageOrder.length > 0) {
      const validOrder = imageOrder.filter((img) => existingImages.includes(img));
      const missingImages = existingImages.filter((img) => !validOrder.includes(img));
      existingImages = [...validOrder, ...missingImages];
    }

    if (req.files?.image?.length > 0) {
      const newImageUrls = req.files.image.map((file) => file.path);
      existingImages = [...existingImages, ...newImageUrls];
    }
    updateData.image = existingImages;

    // Audios: eliminar, reordenar y añadir nuevos (integrado en update)
    const audiosToDelete = req.body.audiosToDelete
      ? Array.isArray(req.body.audiosToDelete)
        ? req.body.audiosToDelete
        : [req.body.audiosToDelete]
      : [];

    let audioOrder = [];
    if (req.body.audioOrder) {
      try {
        audioOrder = Array.isArray(req.body.audioOrder)
          ? req.body.audioOrder
          : JSON.parse(req.body.audioOrder);
      } catch (e) {
        console.error("Error al parsear el orden de audios:", e);
      }
    }

    let existingAudios = Array.isArray(article.audio)
      ? article.audio
      : typeof article.audio === "string"
      ? JSON.parse(article.audio || "[]")
      : [];

    existingAudios = existingAudios.filter((url) => !audiosToDelete.includes(url));

    if (audioOrder.length > 0) {
      const validOrder = audioOrder.filter((url) => existingAudios.includes(url));
      const missing = existingAudios.filter((url) => !validOrder.includes(url));
      existingAudios = [...validOrder, ...missing];
    }

    if (req.files?.audio?.length > 0) {
      const newAudioUrls = req.files.audio.map((file) => file.path);
      existingAudios = [...existingAudios, ...newAudioUrls];
    }
    updateData.audio = existingAudios;

    // Videos: eliminar y añadir nuevos (opcionalmente reordenar si lo necesitas)
    const videosToDelete = req.body.videosToDelete
      ? Array.isArray(req.body.videosToDelete)
        ? req.body.videosToDelete
        : [req.body.videosToDelete]
      : [];

    let existingVideos = Array.isArray(article.video)
      ? article.video
      : typeof article.video === "string"
      ? JSON.parse(article.video || "[]")
      : [];

    existingVideos = existingVideos.filter((url) => !videosToDelete.includes(url));

    if (req.files?.video?.length > 0) {
      const newVideoUrls = req.files.video.map((file) => file.path);
      existingVideos = [...existingVideos, ...newVideoUrls];
    }
    updateData.video = existingVideos;

    await article.update(updateData);

    if (categories && categories.length > 0) {
      await db.ArticleCategory.destroy({ where: { article_id: articleId } });
      await Promise.all(
        categories.map((categoryId) =>
          db.ArticleCategory.create({
            article_id: articleId,
            category_id: categoryId,
          })
        )
      );
    }

    const updatedArticle = await db.Article.findByPk(articleId, {
      include: [
        { model: db.Category, as: "categories" },
        { model: db.User, as: "author" },
      ],
    });

    res.json({
      message: "Artículo actualizado exitosamente",
      article: updatedArticle,
    });
  } catch (error) {
    console.error(`Error al actualizar el artículo con ID ${req.params.articleId}:`, error);
    res.status(500).json({ error: "Error al actualizar el artículo" });
  }
}

// Eliminar un artículo
const deleteArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;

    // Verificar si el artículo existe
    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Eliminar asociaciones de categorías
    await db.ArticleCategory.destroy({
      where: { article_id: articleId },
    });

    // Eliminar el artículo
    await article.destroy();

    res.json({ message: "Artículo eliminado exitosamente" });
  } catch (error) {
    console.error(
      `Error al eliminar el artículo con ID ${req.params.articleId}:`,
      error
    );
    res.status(500).json({ error: "Error al eliminar el artículo" });
  }
};

// Añadir imágenes a un artículo existente
const addImagesToArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;
``
    // Verificar si el artículo existe
    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Verificar si hay archivos para subir
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "No se han proporcionado archivos" });
    }

    // Obtener las imágenes actuales
    const currentImages = article.image || [];

    // Añadir nuevas imágenes
    const newImageUrls = req.files.map((file) => file.path);
    const updatedImages = [...currentImages, ...newImageUrls];

    // Actualizar el artículo
    await article.update({ image: updatedImages });

    res.json({
      message: "Imágenes añadidas exitosamente al artículo",
      images: updatedImages,
    });
  } catch (error) {
    console.error(
      `Error al añadir imágenes al artículo con ID ${req.params.articleId}:`,
      error
    );
    res.status(500).json({ error: "Error al añadir imágenes al artículo" });
  }
};

// Eliminar una imagen específica
const deleteImage = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const imageUrl = req.body.imageUrl;

    if (!imageUrl) {
      return res.status(400).json({ error: "URL de imagen no proporcionada" });
    }

    // Verificar si el artículo existe
    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Obtener las imágenes actuales
    const currentImages = article.image || [];

    // Filtrar la imagen a eliminar
    const updatedImages = currentImages.filter((url) => url !== imageUrl);

    // Actualizar el artículo
    await article.update({ image: updatedImages });

    res.json({
      message: "Imagen eliminada exitosamente",
      images: updatedImages,
    });
  } catch (error) {
    console.error(
      `Error al eliminar la imagen del artículo con ID ${req.params.articleId}:`,
      error
    );
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};

// Subir audios a un artículo
const uploadAudioToArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;

    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han proporcionado archivos de audio" });
    }

    const currentAudios = Array.isArray(article.audio)
      ? article.audio
      : typeof article.audio === "string"
      ? JSON.parse(article.audio || "[]")
      : [];

    const newAudioUrls = req.files.map((file) => file.path);
    const updatedAudios = [...currentAudios, ...newAudioUrls];

    await article.update({ audio: updatedAudios });

    res.json({
      message: "Audios añadidos exitosamente al artículo",
      audio: updatedAudios,
    });
  } catch (error) {
    console.error(`Error al añadir audios al artículo con ID ${req.params.articleId}:`, error);
    res.status(500).json({ error: "Error al añadir audios al artículo" });
  }
};

// Editar audios de un artículo (eliminar, reordenar y añadir nuevos)
const editAudioOfArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;

    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Audios a eliminar (puede ser string o array)
    const audiosToDelete = req.body.audiosToDelete
      ? Array.isArray(req.body.audiosToDelete)
        ? req.body.audiosToDelete
        : [req.body.audiosToDelete]
      : [];

    // Orden de audios (puede venir como JSON string)
    let audioOrder = [];
    if (req.body.audioOrder) {
      try {
        audioOrder = Array.isArray(req.body.audioOrder)
          ? req.body.audioOrder
          : JSON.parse(req.body.audioOrder);
      } catch (e) {
        console.error("Error al parsear el orden de audios:", e);
      }
    }

    let existingAudios = Array.isArray(article.audio)
      ? article.audio
      : typeof article.audio === "string"
      ? JSON.parse(article.audio || "[]")
      : [];

    // Filtra los audios que se van a eliminar
    existingAudios = existingAudios.filter((url) => !audiosToDelete.includes(url));

    // Reordenar si se proporcionó un orden
    if (audioOrder.length > 0) {
      const validOrder = audioOrder.filter((url) => existingAudios.includes(url));
      const missing = existingAudios.filter((url) => !validOrder.includes(url));
      existingAudios = [...validOrder, ...missing];
    }

    // Añadir nuevos audios subidos
    if (req.files && req.files.length > 0) {
      const newAudioUrls = req.files.map((file) => file.path);
      existingAudios = [...existingAudios, ...newAudioUrls];
    }

    await article.update({ audio: existingAudios });

    res.json({
      message: "Audios del artículo actualizados exitosamente",
      audio: existingAudios,
    });
  } catch (error) {
    console.error(`Error al editar audios del artículo con ID ${req.params.articleId}:`, error);
    res.status(500).json({ error: "Error al editar audios del artículo" });
  }
};

// Subir videos a un artículo
const uploadVideoToArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;

    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han proporcionado archivos de video" });
    }

    const currentVideos = Array.isArray(article.video)
      ? article.video
      : typeof article.video === "string"
      ? JSON.parse(article.video || "[]")
      : [];

    const newVideoUrls = req.files.map((file) => file.path);
    const updatedVideos = [...currentVideos, ...newVideoUrls];

    await article.update({ video: updatedVideos });

    res.json({
      message: "Videos añadidos exitosamente al artículo",
      video: updatedVideos,
    });
  } catch (error) {
    console.error(`Error al añadir videos al artículo con ID ${req.params.articleId}:`, error);
    res.status(500).json({ error: "Error al añadir videos al artículo" });
  }
};

// Editar videos de un artículo (eliminar, reordenar y añadir nuevos)
const editVideoOfArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;

    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Videos a eliminar (puede ser string o array)
    const videosToDelete = req.body.videosToDelete
      ? Array.isArray(req.body.videosToDelete)
        ? req.body.videosToDelete
        : [req.body.videosToDelete]
      : [];

    let existingVideos = Array.isArray(article.video)
      ? article.video
      : typeof article.video === "string"
      ? JSON.parse(article.video || "[]")
      : [];

    // Filtra los videos que se van a eliminar
    existingVideos = existingVideos.filter((url) => !videosToDelete.includes(url));

    // Añadir nuevos videos subidos (no se reordena)
    if (req.files && req.files.length > 0) {
      const newVideoUrls = req.files.map((file) => file.path);
      existingVideos = [...existingVideos, ...newVideoUrls];
    }

    await article.update({ video: existingVideos });

    res.json({
      message: "Videos del artículo actualizados exitosamente",
      video: existingVideos,
    });
  } catch (error) {
    console.error(`Error al editar videos del artículo con ID ${req.params.articleId}:`, error);
    res.status(500).json({ error: "Error al editar videos del artículo" });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  addImagesToArticle,
  deleteImage,
  uploadAudioToArticle,
  editAudioOfArticle,
  uploadVideoToArticle,
  editVideoOfArticle,
};
