module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define(
      'Article',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true, 
        },
        type: {
          type: DataTypes.ENUM('text', 'photo', 'video', 'music'),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        timestamps: false,
        tableName: 'article',
      }
    );
  
    Article.associate = (models) => {
      Article.belongsTo(models.User, {
        foreignKey: 'author_uid',
        as: 'author',
      });
  
      Article.hasMany(models.Media, {
        foreignKey: 'article_id',
        as: 'media_files',
      });
  
      Article.belongsToMany(models.Category, {
        through: 'ArticleCategory',
        foreignKey: 'article_id',
        as: 'categories',
      });
    };
  
    return Article;
  };
  