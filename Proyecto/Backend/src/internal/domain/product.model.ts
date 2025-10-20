import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

export default Product;
