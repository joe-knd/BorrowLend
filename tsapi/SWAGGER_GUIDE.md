# Swagger UI Quick Start Guide

## 🎯 What is Swagger?

Swagger UI provides an **interactive web interface** to test your API directly in the browser - no Postman or other tools needed!

## 🚀 Getting Started

### 1. Start the Application
```bash
cd tsapi
dotnet run
```

### 2. Open Swagger UI
Open your browser and navigate to:
- **HTTPS**: `https://localhost:7117/` (or your configured HTTPS port)
- **HTTP**: `http://localhost:5234/` (or your configured HTTP port)

> **Note**: The Swagger UI is served at the **root URL** (not `/swagger`).

### 3. You'll See
- Interactive API documentation
- All 19 endpoints organized by category (Users, Items, Borrowings, Ratings)
- Request/response schemas
- Try-it-out functionality

## 📝 Testing Workflow with Swagger

### Step 1: Register Users
1. Expand **Users** → **POST /api/users/register**
2. Click **"Try it out"**
3. Edit the request body:
   ```json
   {
	 "email": "alice@example.com",
	 "password": "Password123!",
	 "firstName": "Alice",
	 "lastName": "Smith"
   }
   ```
4. Click **"Execute"**
5. **Copy the user `id`** from the response (you'll need this!)
6. Repeat for a second user (Bob)

### Step 2: Create an Item with Image
1. Expand **Items** → **POST /api/items**
2. Click **"Try it out"**
3. Fill in the form fields:
   - **name**: "Lawn Mower"
   - **description**: "Electric lawn mower, great condition"
   - **ownerId**: Paste Alice's user ID
   - **image**: Click "Choose File" and select an image (JPG, PNG, GIF, or WebP, max 5MB)
4. Click **"Execute"**
5. **Copy the item `id`** from the response
6. **Note the `imageUrl`** in the response - you can open this URL directly in your browser to see the image!

> **Image URLs**: All item images are served from `/images/items/` and don't require authentication to view.

### Step 3: Browse & Search Available Items
1. Expand **Items** → **GET /api/items/available**
2. Click **"Try it out"**
3. Try different options:
   - **excludeOwnerId**: Paste Bob's user ID (hides Bob's items)
   - **searchQuery**: Type "mower" to search by name/description
   - **pageSize**: Change to "20" to see more items per page
4. Click **"Execute"**
5. You'll see Alice's lawn mower (with image URL) available to borrow
6. Notice the pagination info: `totalCount`, `pageNumber`, `totalPages`, etc.

### Step 4: Borrow the Item
1. Expand **Borrowings** → **POST /api/borrowings**
2. Click **"Try it out"**
3. In **borrowerId**, paste Bob's user ID
4. Edit the request body:
   ```json
   {
	 "itemId": 1,
	 "dueDate": "2024-12-31T00:00:00Z",
	 "notes": "Need it for the weekend"
   }
   ```
5. Click **"Execute"**
6. **Copy the borrowing `id`** from the response

### Step 5: Check Borrowing History
1. Expand **Borrowings** → **GET /api/borrowings/borrowed-by/{userId}**
2. Click **"Try it out"**
3. In **userId**, paste Bob's user ID
4. Click **"Execute"**
5. You'll see Bob's borrowed items (including the lawn mower)

### Step 6: Return the Item
1. Expand **Borrowings** → **POST /api/borrowings/{id}/return**
2. Click **"Try it out"**
3. In **id**, paste the borrowing ID
4. Optionally edit the request body:
   ```json
   {
	 "notes": "Returned in perfect condition, thanks!"
   }
   ```
5. Click **"Execute"**
6. Item status changes to "Returned"

### Step 7: Rate the Borrower
1. Expand **Ratings** → **POST /api/ratings**
2. Click **"Try it out"**
3. In **raterUserId**, paste Alice's user ID (she's rating Bob)
4. Edit the request body:
   ```json
   {
	 "ratedUserId": "<Bob's user ID>",
	 "borrowingRecordId": 1,
	 "rating": 5,
	 "comment": "Excellent borrower! Returned on time and in perfect condition."
   }
   ```
5. Click **"Execute"**

### Step 8: Check User's Rating
1. Expand **Users** → **GET /api/users/{id}**
2. Click **"Try it out"**
3. In **id**, paste Bob's user ID
4. Click **"Execute"**
5. You'll see Bob's `averageRating: 5.0` and `totalRatings: 1`

## 💡 Swagger Tips

### Copying IDs
- After each successful POST request, look for `"id"` in the response
- Click the **Copy** icon or manually select and copy the ID
- Keep a notepad handy to store IDs for testing

### Understanding the Interface
- **Green** = GET requests (read data)
- **Blue** = POST requests (create data)
- **Orange** = PUT requests (update data)
- **Red** = DELETE requests (remove data)

### Query Parameters vs Request Body
- **Query Parameters**: Small values like IDs (e.g., `?ownerId=abc123`)
- **Request Body**: Larger data structures (JSON objects)

### Response Codes
- **200 OK**: Successful GET/PUT
- **201 Created**: Successful POST (resource created)
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input
- **404 Not Found**: Resource doesn't exist
- **403 Forbidden**: Not authorized (e.g., wrong ownerId)

### Testing Errors
Try these to see error handling:
- Borrow your own item (use same ID for owner and borrower)
- Try to borrow an already borrowed item
- Try to delete an item while it's borrowed
- Try to rate yourself (same rater and rated user)

## 🔄 Alternative: Mark Item as Lost

Instead of returning an item, you can mark it as lost:

1. Borrow an item (follow Step 4)
2. Expand **Borrowings** → **POST /api/borrowings/{id}/lost**
3. Click **"Try it out"**
4. In **id**, paste the borrowing ID
5. Optionally add notes:
   ```json
   {
	 "notes": "Item was accidentally lost"
   }
   ```
6. Click **"Execute"**
7. Item status changes to "Lost"

## 📊 Viewing All Data

### All Users
**GET** `/api/users` - See all registered users with their ratings

### All Items (with Search & Filtering)
**GET** `/api/items` - See all items with pagination
**GET** `/api/items?searchQuery=camera` - Search items by name/description
**GET** `/api/items?status=Available` - Filter by status
**GET** `/api/items?status=Available&searchQuery=bike&pageSize=20` - Combine filters

### Filter Items by Status
**GET** `/api/items?status=Available` - See only available items
**GET** `/api/items?status=Borrowed` - See borrowed items
**GET** `/api/items?status=Lost` - See lost items

### User's Items (Paginated)
**GET** `/api/items/owned-by/{ownerId}` - See all items owned by a user
**GET** `/api/items/owned-by/{ownerId}?pageNumber=2&pageSize=5` - Navigate pages

### User's Borrowing Activity
**GET** `/api/borrowings/borrowed-by/{userId}` - What the user borrowed
**GET** `/api/borrowings/lent-by/{userId}` - What the user lent to others

### User's Ratings
**GET** `/api/ratings/user/{userId}` - All ratings received by a user

### Viewing Item Images
- Every item response includes an `imageUrl` field
- Copy the URL and paste it in a new browser tab
- Images are publicly accessible (no authentication needed)
- Example: `https://localhost:7117/images/items/abc123.jpg`

## 🎓 Advanced Testing Scenarios

### Multi-User Borrowing
1. Register 3+ users
2. Each user creates items
3. Users borrow from each other
4. Track the complete catalog and history

### Rating System
1. Complete a borrowing transaction
2. Have the lender rate the borrower
3. Complete another transaction
4. Rate again - watch the average update

### Due Dates
1. Create a borrowing with a due date in the past
2. Create one with a future due date
3. Compare the responses

### Lost Items
1. Create and borrow an item
2. Mark it as lost
3. Try to borrow the same item again (should fail)

## 🛠️ Troubleshooting

### Swagger UI Not Loading
- Check that the application is running (`dotnet run`)
- Verify you're using the correct port
- Try both HTTP and HTTPS URLs

### "Try it out" Button Disabled
- Make sure you clicked "Try it out" first
- The button should change to "Execute"

### Getting 400 Bad Request
- Check required fields are filled
- Verify ID format (GUIDs for users, integers for items/borrowings/ratings)
- Review the error message in the response

### Can't Find User/Item ID
- Use **GET** `/api/users` to list all users
- Use **GET** `/api/items` to list all items
- IDs are shown in the response

## 📚 Additional Resources

- **Full API Documentation**: See `API_DOCUMENTATION.md`
- **Quick Reference**: See `ENDPOINTS_QUICK_REFERENCE.md`
- **HTTP File Testing**: Use `tsapi.http` in Visual Studio
- **README**: See `README.md` for project overview

---

**Happy Testing! 🎉**

The Swagger UI makes it easy to explore and test the entire API without writing any code!
