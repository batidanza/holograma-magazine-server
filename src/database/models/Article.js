module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define(
      'Article',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        artist: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true, 
        },
        image: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        audio: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        video: {
          type: DataTypes.ARRAY(DataTypes.STRING),
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
  
      // Se elimina la relación con Media
      
      Article.belongsToMany(models.Category, {
        through: 'ArticleCategory',
        foreignKey: 'article_id',
        as: 'categories',
      });
    };
  
    return Article;
  };
  