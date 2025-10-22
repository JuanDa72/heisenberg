#!/bin/bash

# Base URL of the API
BASE_URL="http://localhost:3000/products"

# Function to print test header
print_header() {
    echo "\n=== $1 ==="
    echo "----------------------------------------"
}

# Test 1: Get all products
print_header "TEST 1: Get all products"
curl -s -X GET "$BASE_URL" | jq

# Test 2: Create a new product
print_header "TEST 2: Create a new product"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Ibuprofeno 600mg",
        "type": "Antiinflamatorio",
        "use_case": "Para el alivio del dolor e inflamación",
        "warnings": "Tomar con alimentos. No exceder la dosis recomendada.",
        "contraindications": "Úlcera gástrica, insuficiencia hepática o renal grave",
        "expiration_date": "2025-12-31",
        "price": 7.50,
        "stock": 50
    }')
echo $CREATE_RESPONSE | jq

# Extract the ID of the created product
PRODUCT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')

# Test 3: Get the created product by ID
print_header "TEST 3: Get product by ID ($PRODUCT_ID)"
curl -s -X GET "$BASE_URL/$PRODUCT_ID" | jq

# Test 4: Update the created product
print_header "TEST 4: Update product ($PRODUCT_ID)"
curl -s -X PUT "$BASE_URL/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Ibuprofeno 600mg",
        "stock": 45,
        "price": 8.00
    }' | jq

# Test 5: Get all products with pagination
print_header "TEST 5: Get products with pagination (limit=2, offset=0)"
curl -s -X GET "$BASE_URL?limit=2&offset=0" | jq

# Test 6: Try to create a product with invalid data
print_header "TEST 6: Try to create product with invalid data"
curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{"name": ""}' | jq

# Test 7: Delete the created product
print_header "TEST 7: Delete product ($PRODUCT_ID)"
curl -s -X DELETE "$BASE_URL/$PRODUCT_ID" | jq

# Test 8: Verify product was deleted
print_header "TEST 8: Verify product was deleted ($PRODUCT_ID)"
curl -s -X GET "$BASE_URL/$PRODUCT_ID" | jq

echo "\n=== Tests completed ==="
