import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user.model';

const ChatbotSession = sequelize.define('ChatbotSession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'chatbot_session',
  timestamps: false,
});

// Define associations
ChatbotSession.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(ChatbotSession, { foreignKey: 'user_id' });

export default ChatbotSession;
