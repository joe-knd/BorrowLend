# BorrowLend API Documentation

A REST API for managing a borrowing/lending system where users can lend items to others and borrow from others.

## 🚀 Interactive Testing

**Swagger UI is available!** For the easiest testing experience:
1. Run the application: `dotnet run`
2. Navigate to `https://localhost:{port}/` in your browser
3. Use the interactive Swagger interface to test all endpoints

This documentation provides detailed request/response examples for all endpoints.

## Base URL
- Development: `https://localhost:{port}/api`
- Replace `{port}` with the actual port from your launch settings
- Swagger UI: `https://localhost:{port}/` (root URL)

---

## Authentication
Currently, the API does not enforce authentication. Identity is configured for future use.
All endpoints requiring user context accept `userId`, `ownerId`, `borrowerId`, or `raterUserId` as query parameters.

---

## Endpoints

### **Users**

#### 1. Register a New User
**POST** `/api/users/register`

Register a new user in the system.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "user-guid-here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "averageRating": 0.0,
  "totalRatings": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### 2. Get User by ID
**GET** `/api/users/{id}`

Retrieve user details by ID.

**Response:** `200 OK`
```json
{
  "id": "user-guid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "averageRating": 4.5,
  "totalRatings": 10,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### 3. Get All Users
**GET** `/api/users`

Retrieve all registered users.

**Response:** `200 OK`
```json
[
  {
	"id": "user-guid",
	"email": "user@example.com",
	"firstName": "John",
	"lastName": "Doe",
	"averageRating": 4.5,
	"totalRatings": 10,
	"createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 4. Get User by Email
**GET** `/api/users/email/{email}`

Retrieve user details by email address.

**Response:** `200 OK`
```json
{
  "id": "user-guid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "averageRating": 4.5,
  "totalRatings": 10,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### **Items**

#### 5. Create a New Item (with Optional Image)
**POST** `/api/items`

Create a new item for lending with optional image upload.

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `name` (required): Item name (max 200 characters)
- `description` (optional): Item description (max 1000 characters)
- `ownerId` (required): User ID of the item owner
- `image` (optional): Image file (JPG, JPEG, PNG, GIF, WebP, max 5MB)

**Example using cURL:**
```bash
curl -X POST "https://localhost:7117/api/items" \
  -F "name=Lawn Mower" \
  -F "description=Electric lawn mower, great condition" \
  -F "ownerId=owner-guid" \
  -F "image=@photo.jpg"
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Lawn Mower",
  "description": "Electric lawn mower, great condition",
  "ownerId": "owner-guid",
  "owner": {
	"id": "owner-guid",
	"email": "owner@example.com",
	"firstName": "John",
	"lastName": "Doe",
	"averageRating": 4.5,
	"totalRatings": 10,
	"createdAt": "2024-01-01T00:00:00Z"
  },
  "status": "Available",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastBorrowedAt": null,
  "imageUrl": "https://localhost:7117/images/items/abc123.jpg"
}
```

---

#### 6. Get Item by ID
**GET** `/api/items/{id}`

Retrieve item details by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Lawn Mower",
  "description": "Electric lawn mower, great condition",
  "ownerId": "owner-guid",
  "owner": { ... },
  "status": "Available",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastBorrowedAt": null,
  "imageUrl": "https://localhost:7117/images/items/abc123.jpg"
}
```

**Note:** Image can be accessed directly by opening `imageUrl` in browser (no authentication required).

---

#### 7. Get All Items (with Search, Filtering & Pagination)
**GET** `/api/items`

Get all items with optional search, filtering, and pagination.

**Query Parameters:**
- `searchQuery` (optional): Search in item name and description (case-insensitive)
- `status` (optional): Filter by status (`Available`, `Borrowed`, `Lost`)
- `ownerId` (optional): Filter by owner user ID
- `pageNumber` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

**Examples:**
```
GET /api/items
GET /api/items?searchQuery=mower
GET /api/items?status=Available
GET /api/items?searchQuery=camera&status=Available&pageSize=20
GET /api/items?ownerId=user-guid&pageNumber=2
```

**Response:** `200 OK`
```json
{
  "items": [
	{
	  "id": 1,
	  "name": "Lawn Mower",
	  "description": "Electric lawn mower, great condition",
	  "ownerId": "owner-guid",
	  "owner": { ... },
	  "status": "Available",
	  "createdAt": "2024-01-01T00:00:00Z",
	  "lastBorrowedAt": null,
	  "imageUrl": "https://localhost:7117/images/items/abc123.jpg"
	}
  ],
  "totalCount": 45,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

#### 8. Get Available Items (with Search & Pagination)
**GET** `/api/items/available`

Get all available items for borrowing with optional search and pagination.

**Query Parameters:**
- `excludeOwnerId` (optional): Exclude items owned by this user
- `searchQuery` (optional): Search in item name and description
- `pageNumber` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

**Examples:**
```
GET /api/items/available
GET /api/items/available?excludeOwnerId=user-guid
GET /api/items/available?searchQuery=camera&pageSize=20
```

**Response:** `200 OK` (same paginated format as above)

---

#### 9. Get Items by Owner (with Pagination)
**GET** `/api/items/owned-by/{ownerId}`

Get all items owned by a specific user with pagination.

**Query Parameters:**
- `pageNumber` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

**Response:** `200 OK` (same paginated format as above)

---

#### 10. Update an Item (with Optional Image)
**PUT** `/api/items/{id}`

Update an item including optional image replacement or removal.

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `name` (required): Item name
- `description` (optional): Item description
- `ownerId` (required): Owner user ID for authorization
- `image` (optional): New image file (replaces existing)
- `removeImage` (optional, boolean): Set to `true` to remove current image

**Example:**
```bash
curl -X PUT "https://localhost:7117/api/items/1" \
  -F "name=Updated Lawn Mower" \
  -F "description=Updated description" \
  -F "ownerId=owner-guid" \
  -F "image=@new-photo.jpg"
```

**Response:** `200 OK`

---

#### 11. Delete an Item
**DELETE** `/api/items/{id}?ownerId={userId}`

Delete an item (only by owner, cannot delete borrowed items). Automatically deletes associated image file.

**Query Parameters:**
- `ownerId` (required): Owner user ID for authorization

**Response:** `204 No Content`

---
	"ownerId": "owner-guid",
	"owner": { ... },
	"status": "Available",
	"createdAt": "2024-01-01T00:00:00Z",
	"lastBorrowedAt": null
  }
]
```

---

#### 8. Get Items by Owner
**GET** `/api/items/owned-by/{ownerId}`

Get all items owned by a specific user.

**Response:** `200 OK`
```json
[
  {
	"id": 1,
	"name": "Lawn Mower",
	"description": "Electric lawn mower, great condition",
	"ownerId": "owner-guid",
	"owner": { ... },
	"status": "Available",
	"createdAt": "2024-01-01T00:00:00Z",
	"lastBorrowedAt": null
  }
]
```

---

#### 9. Get All Items
**GET** `/api/items?status={status}`

Get all items with optional status filter.

**Query Parameters:**
- `status` (optional): Filter by status (Available, Borrowed, Lost)

**Response:** `200 OK`
```json
[
  {
	"id": 1,
	"name": "Lawn Mower",
	"status": "Available",
	...
  }
]
```

---

#### 10. Update an Item
**PUT** `/api/items/{id}?ownerId={userId}`

Update an item (only by owner).

**Query Parameters:**
- `ownerId` (required): Owner user ID for authorization

**Request Body:**
```json
{
  "name": "Updated Lawn Mower",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

#### 11. Delete an Item
**DELETE** `/api/items/{id}?ownerId={userId}`

Delete an item (only by owner, cannot delete borrowed items).

**Query Parameters:**
- `ownerId` (required): Owner user ID for authorization

**Response:** `204 No Content`

---

### **Borrowings**

#### 12. Borrow an Item
**POST** `/api/borrowings?borrowerId={userId}`

Create a borrowing record (borrow an item).

**Query Parameters:**
- `borrowerId` (required): User ID of the borrower

**Request Body:**
```json
{
  "itemId": 1,
  "dueDate": "2024-02-01T00:00:00Z",
  "notes": "Will pick it up tomorrow"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "itemId": 1,
  "item": { ... },
  "borrowerId": "borrower-guid",
  "borrower": { ... },
  "lenderId": "lender-guid",
  "lender": { ... },
  "borrowedAt": "2024-01-01T00:00:00Z",
  "dueDate": "2024-02-01T00:00:00Z",
  "returnedAt": null,
  "status": "Borrowed",
  "notes": "Will pick it up tomorrow"
}
```

---

#### 13. Return an Item
**POST** `/api/borrowings/{id}/return`

Mark an item as returned.

**Request Body (optional):**
```json
{
  "notes": "Returned in good condition"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "Returned",
  "returnedAt": "2024-01-15T00:00:00Z",
  ...
}
```

---

#### 14. Mark Item as Lost
**POST** `/api/borrowings/{id}/lost`

Mark a borrowed item as lost.

**Request Body (optional):**
```json
{
  "notes": "Item was lost during use"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "Lost",
  ...
}
```

---

#### 15. Get Borrowing Record by ID
**GET** `/api/borrowings/{id}`

Get details of a specific borrowing record.

**Response:** `200 OK`

---

#### 16. Get Items Borrowed by User
**GET** `/api/borrowings/borrowed-by/{userId}`

Get all items borrowed by a specific user.

**Response:** `200 OK`
```json
[
  {
	"id": 1,
	"itemId": 1,
	"item": { ... },
	"borrowerId": "borrower-guid",
	"borrower": { ... },
	"lenderId": "lender-guid",
	"lender": { ... },
	"borrowedAt": "2024-01-01T00:00:00Z",
	"dueDate": "2024-02-01T00:00:00Z",
	"returnedAt": null,
	"status": "Borrowed",
	"notes": "Will pick it up tomorrow"
  }
]
```

---

#### 17. Get Items Lent by User
**GET** `/api/borrowings/lent-by/{userId}`

Get all items lent by a specific user (items they own that others borrowed).

**Response:** `200 OK`
```json
[
  {
	"id": 1,
	"itemId": 1,
	"item": { ... },
	"borrowerId": "borrower-guid",
	"borrower": { ... },
	"lenderId": "lender-guid",
	"lender": { ... },
	"borrowedAt": "2024-01-01T00:00:00Z",
	"dueDate": "2024-02-01T00:00:00Z",
	"returnedAt": "2024-01-15T00:00:00Z",
	"status": "Returned",
	"notes": "Returned in good condition"
  }
]
```

---

### **Ratings**

#### 18. Create a Rating
**POST** `/api/ratings?raterUserId={userId}`

Rate another user.

**Query Parameters:**
- `raterUserId` (required): User ID of the person giving the rating

**Request Body:**
```json
{
  "ratedUserId": "rated-user-guid",
  "borrowingRecordId": 1,
  "rating": 5,
  "comment": "Great borrower, returned on time"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "ratedUserId": "rated-user-guid",
  "ratedUser": { ... },
  "raterUserId": "rater-user-guid",
  "raterUser": { ... },
  "borrowingRecordId": 1,
  "rating": 5,
  "comment": "Great borrower, returned on time",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### 19. Get Ratings for a User
**GET** `/api/ratings/user/{userId}`

Get all ratings received by a specific user.

**Response:** `200 OK`
```json
[
  {
	"id": 1,
	"ratedUserId": "rated-user-guid",
	"ratedUser": { ... },
	"raterUserId": "rater-user-guid",
	"raterUser": { ... },
	"borrowingRecordId": 1,
	"rating": 5,
	"comment": "Great borrower, returned on time",
	"createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

## Data Models

### Item Response Fields
- `id`: Item ID (integer)
- `name`: Item name
- `description`: Item description
- `ownerId`: Owner user ID
- `owner`: Owner user object
- `status`: Item status (Available, Borrowed, Lost)
- `createdAt`: Creation timestamp
- `lastBorrowedAt`: Last borrowed timestamp (nullable)
- `imageUrl`: Full absolute URL to item image (nullable, e.g., `https://localhost:7117/images/items/uuid.jpg`)

### Item Image Support
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Max file size**: 5MB
- **Storage**: Filesystem (`wwwroot/images/items/`)
- **Access**: Direct HTTP URL (no authentication required)
- **API responses**: Always include absolute `imageUrl`
- **Database**: Only stores relative path

### Pagination Response
List endpoints return paginated results:
```json
{
  "items": [...],
  "totalCount": 45,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

### Search & Filtering
- **Search**: Case-insensitive search in name and description
- **Filters**: Can be combined (status + owner + search)
- **Pagination**: Default 10 per page, max 100

### Item Statuses
- `Available`: Item is available to borrow
- `Borrowed`: Item is currently borrowed
- `Lost`: Item was lost by borrower

### Borrowing Statuses
- `Borrowed`: Item is currently borrowed
- `Returned`: Item has been returned
- `Lost`: Item was marked as lost

### Rating Range
- 1-5 (5 being the best)

---

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid input or business rule violation
- `404 Not Found`: Resource not found
- `403 Forbidden`: User not authorized to perform action

**Example Error Response:**
```json
{
  "errors": ["Error message here"]
}
```

or

```
"Error message string"
```

**Image Upload Errors:**
- Invalid file type: `400 Bad Request - "Invalid image file. Supported formats: jpg, jpeg, png, gif, webp. Max size: 5MB"`
- File too large: `400 Bad Request - "Invalid image file..."`
- Upload failed: `500 Internal Server Error - "Error uploading image: {details}"`

---

---

## Notes

1. **No Authentication Required (Yet)**: The API is configured with ASP.NET Core Identity but does not currently enforce authentication. This is intentional for testing and future implementation.

2. **User IDs**: All user-related operations require passing user IDs as query parameters. In a production system with authentication, these would be extracted from JWT tokens or session data.

3. **SQLite Database**: The database file `borrowlend.db` is created in the project directory.

4. **Password Requirements** (for user registration):
   - Minimum 6 characters
   - At least one digit
   - At least one lowercase letter
   - At least one uppercase letter
   - Non-alphanumeric characters are NOT required

---

## Quick Start Testing Workflow

1. **Register Users**
   - POST `/api/users/register` with user A
   - POST `/api/users/register` with user B

2. **Create Items (with optional images)**
   - POST `/api/items` with form-data: name, description, ownerId, optional image file
   - User A creates an item to lend with photo

3. **Browse & Search Available Items**
   - GET `/api/items/available?excludeOwnerId=userB` - User B views available items
   - GET `/api/items/available?searchQuery=camera` - Search for specific items
   - GET `/api/items?status=Available&pageSize=20` - Browse with pagination

4. **Borrow an Item**
   - POST `/api/borrowings?borrowerId=userB` - User B borrows User A's item

5. **View Borrowing History**
   - GET `/api/borrowings/borrowed-by/userB` - User B's borrowed items
   - GET `/api/borrowings/lent-by/userA` - User A's lent items

6. **Return Item**
   - POST `/api/borrowings/{id}/return` - User B returns the item

7. **Rate User**
   - POST `/api/ratings?raterUserId=userA` - User A rates User B

8. **View Ratings**
   - GET `/api/ratings/user/userB` - View User B's ratings
   - GET `/api/users/userB` - View User B's average rating

---

## Database Schema Overview

- **AspNetUsers**: Identity users with additional fields (FirstName, LastName, AverageRating, TotalRatings)
- **Items**: Items available for lending with optional ImageFileName
- **BorrowingRecords**: Track borrowing transactions
- **UserRatings**: User ratings and comments
- **AspNetRoles, AspNetUserRoles, etc.**: Standard Identity tables

---

## Future Enhancements (Not Implemented)

- JWT authentication
- Real-time notifications
- Due date reminders
- Dispute resolution
