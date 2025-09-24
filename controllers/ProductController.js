const ProductAttribute = require('../models/ProductAttribute');
const ProductValue = require('../models/ProductValue');
const Product = require("../models/Product"); // import directly

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll(); // ✅ now this works
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optionally, fetch attributes and values for this product
    const productValues = await ProductValue.findAll({
      where: { product_id: productId },
      include: [{ model: ProductAttribute, attributes: ['name', 'data_type'] }]
    });

    const productWithDetails = {
      ...product.toJSON(),
      attributes: productValues.map(pv => ({
        attribute_name: pv.ProductAttribute ? pv.ProductAttribute.name : 'Unknown',
        attribute_type: pv.ProductAttribute ? pv.ProductAttribute.data_type : 'Unknown',
        value: pv.value,
      }))
    };

    res.status(200).json(productWithDetails);
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: `Error fetching product with ID ${req.params.id}`, error: error.message });
  }
};

// Add more controller methods here (e.g., createProduct, updateProduct, deleteProduct)

module.exports = {
  getProducts,
  getProductById,
};