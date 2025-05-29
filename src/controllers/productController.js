const db = require("../database/models");
const { Op } = require('sequelize');
const { MercadoPagoConfig, Preference } = require('mercadopago')

require("dotenv").config();

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const payment = async (req, res) => {
  try {
    const { 
      name, 
      quantity, 
      price, 
      product_id,
      payer_email,
      payer_name,
      payer_phone,
      address_line,
      city,
      state,
      postal_code
    } = req.body;

    const body = {
      items: [
        {
          title: name,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://www.youtube.com/",
        failure: "https://www.youtube.com/",
        pending: "https://www.youtube.com/",
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    const paymentInfo = await db.PaymentInfo.create({
      payer_email,
      payer_name,
      payer_phone,
      address_line,
      city,
      state,
      postal_code,
      payment_status: 'pending',
      payment_id: result.id,
      product_id
    });

    res.json({
      id: result.id,
      payment_info_id: paymentInfo.id
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      error: "error al crear payment"
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        { model: db.Category, as: "category" },
      ],
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obtaining products" });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const productDetails = await db.product.findByPk(productId, {
      include: [
        { model: db.category, as: "category" },
      ],
    });

    if (!productDetails) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(productDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error obtaining product details: ${error.message}` });
  }
};


const cloudinary = require('cloudinary').v2;

const createProduct = async (req, res) => {
  try {
    const newProduct = req.body;
    const productImages = req.files;

    const uploadedImagesUrls = [];

    for (let i = 0; i < productImages.length; i++) {
      const image = productImages[i];
      const cloudinaryResponse = await cloudinary.uploader.upload(image.path);
      const imageUrl = cloudinaryResponse.secure_url; 
      uploadedImagesUrls.push(imageUrl);
    }

    const newProductEntry = await db.Product.create({
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      care: newProduct.care,
      image: uploadedImagesUrls, 
      category_id: newProduct.category_id,
      palette: newProduct.palette,
      size: newProduct.size
    });

    res.json({ message: "Product created successfully", product: newProductEntry });
  } catch (error) {
    console.error("Error en la creación del producto:", error);
    res.status(500).json({ error: `Error publishing the product: ${error.message}` });
  }
};


const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.category_id;  
    const products = await db.product.findAll({
      where: { category_id: categoryId }, 
    });
    res.json(products);
  } catch (error) {
    console.error(`Error obtaining products for category with ID ${req.params.category_id}:`, error);  
    res.status(500).json({ error: "Error obtaining products for category" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.term;

    const products = await db.product.findAll({
      where: { name: { [Op.like]: `%${searchTerm}%` } },  
      include: [
        { model: db.category, as: "category" }, 
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Error searching products" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    const productImages = req.files;
    
    let imagesToDelete = [];
    if (updateData.imagesToDelete) {
      if (Array.isArray(updateData.imagesToDelete)) {
        imagesToDelete = updateData.imagesToDelete;
      } else if (typeof updateData.imagesToDelete === 'string') {
        imagesToDelete = [updateData.imagesToDelete];
      }
    }

    const existingProduct = await db.Product.findByPk(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let currentImages = existingProduct.image || [];
    if (imagesToDelete.length > 0) {
      currentImages = currentImages.filter(img => !imagesToDelete.includes(img));
      
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Error while deleting image from Cloudinary:", deleteError);
        }
      }
    }

    if (productImages && productImages.length > 0) {
      const uploadedImagesUrls = [];
      for (let i = 0; i < productImages.length; i++) {
        const image = productImages[i];
        const cloudinaryResponse = await cloudinary.uploader.upload(image.path);
        const imageUrl = cloudinaryResponse.secure_url;
        uploadedImagesUrls.push(imageUrl);
      }
      updateData.image = [...currentImages, ...uploadedImagesUrls];
    } else {
      updateData.image = currentImages;
    }

    await existingProduct.update({
      name: updateData.name || existingProduct.name,
      description: updateData.description || existingProduct.description,
      price: updateData.price || existingProduct.price,
      care: updateData.care || existingProduct.care,
      image: updateData.image,
      category_id: updateData.category_id || existingProduct.category_id,
      palette: updateData.palette || existingProduct.palette,
      size: updateData.size || existingProduct.size
    });

    res.json({ 
      message: "Product updated successfully", 
      product: existingProduct 
    });
  } catch (error) {
    console.error("Error at updating product:", error);
    res.status(500).json({ error: `Error at updating product: ${error.message}` });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  getProductsByCategory,
  searchProducts,
  payment,
  updateProduct
};
