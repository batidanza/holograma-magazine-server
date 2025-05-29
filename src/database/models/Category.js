module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: false,
      tableName: 'category',
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      as: 'products',
      foreignKey: 'category_id',
      onDelete: 'CASCADE',
    });

    Category.belongsToMany(models.Article, {
      through: 'ArticleCategory',
      foreignKey: 'category_id',
      as: 'articles',
    });
  };

  return Category;
};
