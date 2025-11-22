import { DataTypes } from 'sequelize';
import sequelize from '../config/database';


const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hash_password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'local', // 'local' or 'google'
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_expiry_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
    tableName: 'user',
    timestamps: false,
});

//UserModel.sync();

export default UserModel;
