import { DataTypes } from 'sequelize';
import sequalize from '../config/database';
import User from './user.model';

const ChatbotSession = sequalize.define('ChatbotSession', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
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
ChatbotSession.belongsTo(User, { foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
 });

User.hasMany(ChatbotSession, { foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
 });

//ChatbotSession.sync();
 
export default ChatbotSession;
