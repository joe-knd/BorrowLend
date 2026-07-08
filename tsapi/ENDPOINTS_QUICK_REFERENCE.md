# BorrowLend API - Quick Reference

## 🚀 Swagger UI Available!
**Interactive testing at:** `https://localhost:{port}/` (root URL)

## Base URL
`http://localhost:5234/api` (adjust port as needed)

---

## 📋 All Endpoints (19 Total)

### 👤 Users (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register a new user |
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get user by ID |
| GET | `/users/email/{email}` | Get user by email |

---

### 📦 Items (7 endpoints)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/items` | Create item with optional image | multipart/form-data |
| GET | `/items/{id}` | Get item by ID | |
| GET | `/items` | Get all items (paginated) | `?searchQuery=&status=&ownerId=&pageNumber=&pageSize=` |
| GET | `/items/available` | Get available items (paginated) | `?excludeOwnerId=&searchQuery=&pageNumber=&pageSize=` |
| GET | `/items/owned-by/{ownerId}` | Get items by owner (paginated) | `?pageNumber=&pageSize=` |
| PUT | `/items/{id}` | Update item/image | multipart/form-data |
| DELETE | `/items/{id}` | Delete item & image | `?ownerId={userId}` |

**Item Features:**
- **Image uploads**: JPG, PNG, GIF, WebP (max 5MB)
- **Search**: Case-insensitive name/description search
- **Filtering**: By status, owner
- **Pagination**: Default 10/page, max 100
- **Image URLs**: Absolute URLs returned in responses (e.g., `https://localhost:7117/images/items/abc.jpg`)

---

### 🔄 Borrowings (6 endpoints)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/borrowings` | Borrow an item | `?borrowerId={userId}` |
| POST | `/borrowings/{id}/return` | Return borrowed item | |
| POST | `/borrowings/{id}/lost` | Mark item as lost | |
| GET | `/borrowings/{id}` | Get borrowing record | |
| GET | `/borrowings/borrowed-by/{userId}` | Get items user borrowed | |
| GET | `/borrowings/lent-by/{userId}` | Get items user lent | |

---

### ⭐ Ratings (2 endpoints)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/ratings` | Rate a user | `?raterUserId={userId}` |
| GET | `/ratings/user/{userId}` | Get user's ratings | |

---

## 🎯 Typical Workflow

```
1. POST /api/users/register                    → Register Alice
2. POST /api/users/register                    → Register Bob
3. POST /api/items (form-data with image)      → Alice creates "Lawn Mower" with photo
4. GET  /api/items/available?searchQuery=mower → Bob searches for mower
5. POST /api/borrowings?borrowerId=bob         → Bob borrows the mower
6. GET  /api/borrowings/borrowed-by/bob        → Bob checks his borrowed items
7. POST /api/borrowings/1/return               → Bob returns the mower
8. POST /api/ratings?raterUserId=alice         → Alice rates Bob (5 stars)
9. GET  /api/users/bob                         → Check Bob's average rating
```

---

## 📊 Status Values

### Item Status
- `Available` - Can be borrowed
- `Borrowed` - Currently borrowed
- `Lost` - Marked as lost

### Borrowing Status
- `Borrowed` - Currently out
- `Returned` - Returned to owner
- `Lost` - Marked as lost

### Rating Scale
- 1 to 5 (5 = excellent)

---

## 📝 Sample Requests

### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Create Item with Image
```bash
curl -X POST "https://localhost:7117/api/items" \
  -F "name=Lawn Mower" \
  -F "description=Electric, good condition" \
  -F "ownerId=user-guid" \
  -F "image=@photo.jpg"
```

### Search & Filter Items
```http
GET /api/items/available?searchQuery=camera&pageSize=20
GET /api/items?status=Available&ownerId=user-guid
```

### Borrow Item
```http
POST /api/borrowings?borrowerId={userId}
Content-Type: application/json

{
  "itemId": 1,
  "dueDate": "2024-12-31T00:00:00Z",
  "notes": "Need for weekend"
}
```

### Rate User
```http
POST /api/ratings?raterUserId={userId}
Content-Type: application/json

{
  "ratedUserId": "{userId}",
  "rating": 5,
  "comment": "Great borrower!"
}
```

---

## 🔗 More Information

- Complete API documentation: `API_DOCUMENTATION.md`
- Sample HTTP requests: `tsapi.http`
- Project overview: `README.md`

---

**Share this document** with UI developers or other teams to quickly integrate with the API!
