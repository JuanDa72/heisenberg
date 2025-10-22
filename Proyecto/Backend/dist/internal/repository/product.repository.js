"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const product_model_1 = __importDefault(require("../domain/product.model"));
const sequelize_1 = require("sequelize");
class ProductRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_model_1.default.findByPk(id);
                return product === null || product === void 0 ? void 0 : product.get({ plain: true });
            }
            catch (error) {
                console.error('Error findById:', error);
                throw error;
            }
        });
    }
    findAll(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const options = {
                    order: [['created_at', 'DESC']]
                };
                if (limit !== undefined)
                    options.limit = limit;
                if (offset !== undefined)
                    options.offset = offset;
                const products = yield product_model_1.default.findAll(options);
                return products.map(p => p.get({ plain: true }));
            }
            catch (error) {
                console.error('Error findAll:', error);
                throw error;
            }
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_model_1.default.findOne({
                    where: { name: { [sequelize_1.Op.eq]: name } }
                });
                return product === null || product === void 0 ? void 0 : product.get({ plain: true });
            }
            catch (error) {
                console.error('Error findByName:', error);
                throw error;
            }
        });
    }
    create(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_model_1.default.create(productData);
                return product.get({ plain: true });
            }
            catch (error) {
                if (error instanceof sequelize_1.UniqueConstraintError) {
                    throw new Error(`Product with name "${productData.name}" already exists in database`);
                }
                if (error instanceof sequelize_1.ValidationError) {
                    throw new Error(`Database validation error: ${error.message}`);
                }
                console.error('Error create:', error);
                throw new Error('Error creating product in database');
            }
        });
    }
    update(id, productData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_model_1.default.findByPk(id);
                if (!product) {
                    return null;
                }
                yield product.update(productData);
                return product.get({ plain: true });
            }
            catch (error) {
                if (error instanceof sequelize_1.UniqueConstraintError) {
                    throw new Error(`Another product with that name already exists`);
                }
                if (error instanceof sequelize_1.ValidationError) {
                    throw new Error(`Database validation error: ${error.message}`);
                }
                console.error('Error update:', error);
                throw new Error('Error updating product in database');
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedCount = yield product_model_1.default.destroy({
                    where: { id }
                });
                return deletedCount > 0;
            }
            catch (error) {
                console.error('Error delete:', error);
                throw new Error('Error deleting product from database');
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield product_model_1.default.count();
            }
            catch (error) {
                console.error('Error count:', error);
                throw error;
            }
        });
    }
    existsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield product_model_1.default.count({ where: { id } });
                return count > 0;
            }
            catch (error) {
                console.error('Error existsById:', error);
                throw error;
            }
        });
    }
}
exports.ProductRepository = ProductRepository;
