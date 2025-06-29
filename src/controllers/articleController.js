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

    // Validar datos requeridos
    if (!title || !type || !author_uid) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Procesar imágenes si se proporcionaron
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }

    // Crear el artículo
    const newArticle = await db.Article.create({
      title,
      content,
      type,
      artist,
      author_uid,
      image: imageUrls,
    });

    // Asociar categorías si se proporcionaron
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

    // Obtener el artículo creado con sus relaciones
    const createdArticle = await db.Article.findByPk(newArticle.id, {
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

    // Obtener el nuevo orden de imágenes si se proporciona
    let imageOrder = [];
    if (req.body.imageOrder) {
      try {
        imageOrder = JSON.parse(req.body.imageOrder);
      } catch (e) {
        console.error("Error al parsear el orden de imágenes:", e);
      }
    }

    // Verificar si el artículo existe
    const article = await db.Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    // Construir objeto de actualización
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (author_uid !== undefined) updateData.author_uid = author_uid;

    // Procesar imágenes a eliminar
    const imagesToDelete = req.body.imagesToDelete
      ? Array.isArray(req.body.imagesToDelete)
        ? req.body.imagesToDelete
        : [req.body.imagesToDelete]
      : [];

    // Obtener imágenes existentes del artículo
    let existingImages = Array.isArray(article.image)
      ? article.image
      : typeof article.image === "string"
      ? JSON.parse(article.image || "[]")
      : [];

    // Filtrar las imágenes que se van a eliminar
    existingImages = existingImages.filter(
      (img) => !imagesToDelete.includes(img)
    );

    // Si se proporcionó un nuevo orden, usarlo
    if (imageOrder.length > 0) {
      // Verificar que todas las imágenes en imageOrder existen en existingImages
      const validOrder = imageOrder.filter((img) =>
        existingImages.includes(img)
      );

      // Añadir cualquier imagen que esté en existingImages pero no en el orden
      const missingImages = existingImages.filter(
        (img) => !validOrder.includes(img)
      );

      // El nuevo orden será las imágenes ordenadas seguidas de las que faltan
      existingImages = [...validOrder, ...missingImages];
    }

    // Añadir nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      existingImages = [...existingImages, ...newImageUrls];
    }

    // Actualizar el campo de imagen con el nuevo orden
    updateData.image = existingImages;

    // Actualizar el artículo con los nuevos datos
    await article.update(updateData);

    // Actualizar categorías si se proporcionaron
    if (categories && categories.length > 0) {
      // Eliminar asociaciones existentes
      await db.ArticleCategory.destroy({
        where: { article_id: articleId },
      });

      // Crear nuevas asociaciones
      await Promise.all(
        categories.map((categoryId) =>
          db.ArticleCategory.create({
            article_id: articleId,
            category_id: categoryId,
          })
        )
      );
    }

    // Obtener el artículo actualizado con sus relaciones
    const updatedArticle = await db.Article.findByPk(articleId, {
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

    res.json({
      message: "Artículo actualizado exitosamente",
      article: updatedArticle,
    });
  } catch (error) {
    console.error(
      `Error al actualizar el artículo con ID ${req.params.articleId}:`,
      error
    );
    res.status(500).json({ error: "Error al actualizar el artículo" });
  }
};

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

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  addImagesToArticle,
  deleteImage,
};
