"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Product = database_1.default.define('Product', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    use_case: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    warnings: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    contraindications: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    expiration_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    tableName: 'product',
    timestamps: false,
});
Product.sync();
exports.default = Product;
