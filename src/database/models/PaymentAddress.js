module.exports = (sequelize, DataTypes) => {
    const PaymentAddress = sequelize.define(
      'PaymentAddress',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        address_line: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        postal_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Argentina',
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'product',  // Asegúrate de que el modelo 'Product' esté bien definido
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
      },
      {
        timestamps: false, 
        tableName: 'payment_address',
      }
    );
  
    PaymentAddress.associate = function (models) {
      PaymentAddress.belongsTo(models.Product, {
        as: 'product',
        foreignKey: 'product_id',
      });
    };
  
    return PaymentAddress;
  };
  