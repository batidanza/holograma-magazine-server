module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      image: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      palette: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      care: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'category', 
          key: 'id',
        },
        onDelete: 'SET NULL', 
      },
    },
    {
      timestamps: false, 
      tableName: 'product',
    }
  );

  Product.associate = function (models) {
    Product.belongsTo(models.Category, {
      as: 'category',
      foreignKey: 'category_id',
    });


  };

  return Product;
};
