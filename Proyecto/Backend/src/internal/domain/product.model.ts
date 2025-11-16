import { DataTypes } from 'sequelize';
import sequalize from '../config/database';

const Product = sequalize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  use_case: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  warnings: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contraindications: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expiration_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'product',
  timestamps: false,
});

//Product.sync();

export default Product;
