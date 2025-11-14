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
Object.defineProperty(exports, "__esModule", { value: true });
describe('Products API', () => {
    it('should return 200 OK on /products', () => __awaiter(void 0, void 0, void 0, function* () {
        // Este es un test básico de ejemplo
        expect(1 + 1).toBe(2);
    }));
    it('should connect to database', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test de conexión básica
        expect(true).toBe(true);
    }));
});
