import { Document } from '@langchain/core/documents';
import ProductDTO from '../dto/product.dto';

export interface DocumentServiceInterface {
    transformProductsToDocuments(products: ProductDTO[]): Document[];
}

export class DocumentService implements DocumentServiceInterface {
    
    transformProductsToDocuments(products: ProductDTO[]): Document[] {
        return products.map(product => {
            // Create structured text content for the document
            const pageContent = this.buildProductText(product);
            
            // Create metadata for filtering/retrieval
            const metadata = {
                id: product.id,
                name: product.name,
                type: product.type,
                price: product.price,
                stock: product.stock,
            };
            
            return new Document({
                pageContent,
                metadata,
            });
        });
    }
    
    private buildProductText(product: ProductDTO): string {
        // Build a comprehensive text representation of the product
        // This will be used for semantic search
        const parts: string[] = [];
        
        parts.push(`Producto: ${product.name}`);
        parts.push(`Tipo: ${product.type}`);
        parts.push(`Uso: ${product.use_case}`);
        parts.push(`Advertencias: ${product.warnings}`);
        parts.push(`Contraindicaciones: ${product.contraindications}`);
        parts.push(`Precio: $${product.price}`);
        parts.push(`Stock disponible: ${product.stock} unidades`);
        
        return parts.join('\n');
    }
}

