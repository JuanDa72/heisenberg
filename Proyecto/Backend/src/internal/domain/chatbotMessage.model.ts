import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import ChatbotSession from './chatbotSession.model';

const ChatbotMessage = sequelize.define('ChatbotMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chatbot_session',
      key: 'id',
    },
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'chatbot_message',
  timestamps: false,
});

// Define associations
ChatbotMessage.belongsTo(ChatbotSession, { foreignKey: 'session_id' });
ChatbotSession.hasMany(ChatbotMessage, { foreignKey: 'session_id' });

export default ChatbotMessage;
