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

# Test 9: Get or create a user first
print_header "TEST 9: Get existing users or create one"
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/users")
echo $USERS_RESPONSE | jq

# Try to get first user ID, if no users exist, create one
USER_ID=$(echo $USERS_RESPONSE | jq -r '.data[0].id // empty')

if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ]; then
    print_header "TEST 9a: Creating a test user"
    USER_RESPONSE=$(curl -s -X POST "http://localhost:3000/users" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "test_user",
            "email": "test@heisenberg.com",
            "password": "Test123!@#",
            "role": "user"
        }')
    echo $USER_RESPONSE | jq
    USER_ID=$(echo $USER_RESPONSE | jq -r '.data.id')
fi

print_header "TEST 9b: Create a chatbot session for user $USER_ID"
SESSION_RESPONSE=$(curl -s -X POST "http://localhost:3000/chatbot-sessions" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": $USER_ID
    }")
echo $SESSION_RESPONSE | jq

# Extract the session ID
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.id // empty')

# Test 10: Send first message to chatbot (should use products context)
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 10: Send first message to chatbot - asking about pain relief"
    CHAT_RESPONSE1=$(curl -s -X POST "http://localhost:3000/chatbot-sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d '{
            "message": "Tengo dolor de cabeza, ¿qué me recomiendas?"
        }')
    echo $CHAT_RESPONSE1 | jq
else
    print_header "TEST 10: SKIPPED - No valid session ID"
    echo "{\"status\": \"skipped\", \"message\": \"No valid session ID from previous test\"}"
fi

# Test 11: Send second message (should maintain context)
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 11: Send second message - asking about specific product (context should be maintained)"
    CHAT_RESPONSE2=$(curl -s -X POST "http://localhost:3000/chatbot-sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d '{
            "message": "¿Cuál es el precio de ese producto?"
        }')
    echo $CHAT_RESPONSE2 | jq
else
    print_header "TEST 11: SKIPPED - No valid session ID"
    echo "{\"status\": \"skipped\", \"message\": \"No valid session ID from previous test\"}"
fi

# Test 12: Get all messages from session (verify context is saved)
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 12: Get all messages from session (verify context is saved)"
    curl -s -X GET "http://localhost:3000/chatbot-messages/session/$SESSION_ID" | jq
else
    print_header "TEST 12: SKIPPED - No valid session ID"
    echo "{\"status\": \"skipped\", \"message\": \"No valid session ID from previous test\"}"
fi

# Test 13: Send message asking about a specific product by name
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 13: Send message asking about specific product by name"
    CHAT_RESPONSE3=$(curl -s -X POST "http://localhost:3000/chatbot-sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d '{
            "message": "¿Qué me puedes decir sobre el Paracetamol?"
        }')
    echo $CHAT_RESPONSE3 | jq
else
    print_header "TEST 13: SKIPPED - No valid session ID"
    echo "{\"status\": \"skipped\", \"message\": \"No valid session ID from previous test\"}"
fi

# Test 14: Verify messages contain product recommendations
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 14: Verify all messages in session (should show product recommendations)"
    curl -s -X GET "http://localhost:3000/chatbot-messages/session/$SESSION_ID" | jq
else
    print_header "TEST 14: SKIPPED - No valid session ID"
    echo "{\"status\": \"skipped\", \"message\": \"No valid session ID from previous test\"}"
fi

echo "\n=== Tests completed ==="
