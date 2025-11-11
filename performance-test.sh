#!/bin/bash

# Performance Testing Script for SaborConnect API

echo "🚀 SaborConnect API Performance Test"
echo "====================================="
echo ""

BASE_URL="http://localhost:4000/api"

# Test 1: Simple GET request
echo "📊 Test 1: GET /recipes (first page)"
time_start=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/recipes?page=1&limit=20")
time_end=$(date +%s%N)
status_code=$(echo "$response" | tail -1)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Status: $status_code | Time: ${time_ms}ms"
echo ""

# Test 2: GET with filters
echo "📊 Test 2: GET /recipes (with difficulty filter)"
time_start=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/recipes?page=1&limit=20&difficulty=EASY")
time_end=$(date +%s%N)
status_code=$(echo "$response" | tail -1)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Status: $status_code | Time: ${time_ms}ms"
echo ""

# Test 3: GET deep pagination
echo "📊 Test 3: GET /recipes (page 100)"
time_start=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/recipes?page=100&limit=20")
time_end=$(date +%s%N)
status_code=$(echo "$response" | tail -1)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Status: $status_code | Time: ${time_ms}ms"
echo ""

# Test 4: GET single recipe
echo "📊 Test 4: GET /recipes/:id (with relations)"
# Get first recipe ID from previous response
recipe_id=$(curl -s "$BASE_URL/recipes?page=1&limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
time_start=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/recipes/$recipe_id")
time_end=$(date +%s%N)
status_code=$(echo "$response" | tail -1)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Status: $status_code | Time: ${time_ms}ms"
echo ""

# Test 5: Search query
echo "📊 Test 5: GET /recipes (search query)"
time_start=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/recipes?search=brasileira")
time_end=$(date +%s%N)
status_code=$(echo "$response" | tail -1)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Status: $status_code | Time: ${time_ms}ms"
echo ""

# Test 6: Load test (concurrent requests)
echo "📊 Test 6: Load test (20 concurrent requests)"
time_start=$(date +%s%N)
for i in {1..20}; do
  curl -s "$BASE_URL/recipes?page=$i&limit=10" > /dev/null &
done
wait
time_end=$(date +%s%N)
time_ms=$(( (time_end - time_start) / 1000000 ))
echo "   Time for 20 concurrent requests: ${time_ms}ms"
echo "   Average: $((time_ms / 20))ms per request"
echo ""

echo "✅ Performance test completed!"
echo ""
echo "📈 Database Stats:"
echo "   - Total records: 500,183"
echo "   - Users: 50,000"
echo "   - Recipes: 30,000"
echo "   - Ingredients: 164,807"
echo "   - Likes: 99,922"
echo "   - Favorites: 56,378"
echo ""
