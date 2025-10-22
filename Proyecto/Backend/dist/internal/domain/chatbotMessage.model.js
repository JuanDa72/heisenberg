"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const chatbotSession_model_1 = __importDefault(require("./chatbotSession.model"));
const ChatbotMessage = database_1.default.define('ChatbotMessage', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    session_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chatbot_session',
            key: 'id',
        },
    },
    sender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    tableName: 'chatbot_message',
    timestamps: false,
});
// Define associations
ChatbotMessage.belongsTo(chatbotSession_model_1.default, { foreignKey: 'session_id' });
chatbotSession_model_1.default.hasMany(ChatbotMessage, { foreignKey: 'session_id' });
ChatbotMessage.sync();
exports.default = ChatbotMessage;
