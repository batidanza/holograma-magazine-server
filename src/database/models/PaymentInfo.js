module.exports = (sequelize, DataTypes) => {
  const PaymentInfo = sequelize.define(
    'PaymentInfo',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payer_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payer_phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      timestamps: true,
      tableName: 'payment_info',
    }
  );

  PaymentInfo.associate = function (models) {
    PaymentInfo.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'product_id',
    });
  };

  return PaymentInfo;
};