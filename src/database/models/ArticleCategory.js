module.exports = (sequelize, DataTypes) => {
    const ArticleCategory = sequelize.define(
      'ArticleCategory',
      {
        article_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        category_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
      },
      {
        timestamps: false,
        tableName: 'article_category',
      }
    );
  
    return ArticleCategory;
  };
  