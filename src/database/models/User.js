function userData(sequelize, DataTypes) {
    const User = sequelize.define(
      "User",
      {
        uid: {
          type: DataTypes.STRING(128),
          primaryKey: true,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: "lector",
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true, 
        },
        display_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        timestamps: false, 
        tableName: "user",
      }
    );
  
    // Si hay relaciones futuras, aquí las defines
    User.associate = function (models) {
      // Por ejemplo:
      // User.hasMany(models.Post, { foreignKey: 'user_uid', as: 'posts' });
    };
  
    return User;
  }
  
  module.exports = userData;
  