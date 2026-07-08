# BorrowLend API

A comprehensive REST API for managing a borrowing and lending system built with ASP.NET Core 10, Entity Framework Core, and SQLite.

## Features

- ✅ **User Management** - Register users with ASP.NET Core Identity
- ✅ **Item Catalog** - Users can add items they're willing to lend
- ✅ **Item Images** - Upload images for items (filesystem storage, direct HTTP access)
- ✅ **Search & Filter** - Search items by name/description, filter by status/owner
- ✅ **Pagination** - All list endpoints support pagination (default 10, max 100)
- ✅ **Borrowing System** - Complete workflow for borrowing and lending items
- ✅ **State Management** - Track item states: Available, Borrowed, Lost
- ✅ **Return Process** - Mark items as returned or lost
- ✅ **User Ratings** - Rate users based on borrowing/lending experiences
- ✅ **Due Dates** - Optional due dates for borrowed items
- ✅ **History Tracking** - Complete borrowing history for all users
- ✅ **SQLite Database** - No external database dependencies
- ✅ **Swagger UI** - Interactive API documentation and testing

## Technology Stack

- **Framework**: ASP.NET Core 10
- **ORM**: Entity Framework Core 10
- **Database**: SQLite
- **Authentication**: ASP.NET Core Identity (configured, not enforced)
- **API Documentation**: Swagger/OpenAPI (Swashbuckle)
- **Target**: .NET 10

## Getting Started

### Prerequisites

- .NET 10 SDK
- Visual Studio 2026 or VS Code

### Setup

1. **Clone and navigate to the project**
   ```bash
   cd tsapi
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Database is already created**
   The SQLite database (`borrowlend.db`) has been created with migrations already applied.

4. **Run the application**
   ```bash
   dotnet run
   ```

5. **Test the API**
   - **Swagger UI**: Navigate to `https://localhost:{port}/` (or `http://localhost:{port}/`) in your browser for interactive API testing
   - **HTTP File**: Open `tsapi.http` in Visual Studio to use the sample HTTP requests
   - **Postman/curl**: Use the endpoints documented in `API_DOCUMENTATION.md`

### Recreating the Database

If you need to recreate the database:

```bash
# Remove the existing database
rm borrowlend.db

# Apply migrations
dotnet ef database update
```

## Project Structure

```
tsapi/
├── Controllers/           # REST API controllers
│   ├── UsersController.cs
│   ├── ItemsController.cs
│   ├── BorrowingsController.cs
│   └── RatingsController.cs
├── Models/               # Domain models
│   ├── ApplicationUser.cs
│   ├── Item.cs
│   ├── BorrowingRecord.cs
│   └── UserRating.cs
├── DTOs/                 # Data Transfer Objects
│   └── Dtos.cs
├── Services/            # Business logic services
│   ├── BorrowingService.cs
│   └── RatingService.cs
├── Data/                # Database context
│   └── ApplicationDbContext.cs
├── Migrations/          # EF Core migrations
├── borrowlend.db        # SQLite database file
├── API_DOCUMENTATION.md # Complete API documentation
└── tsapi.http          # Sample HTTP requests
```

## API Endpoints

### Users (4 endpoints)
- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email

### Items (7 endpoints)
- `POST /api/items` - Create item (with optional image upload)
- `GET /api/items/{id}` - Get item by ID
- `GET /api/items` - Get all items (search, filter, pagination)
- `GET /api/items/available` - Get available items (search, pagination)
- `GET /api/items/owned-by/{ownerId}` - Get items by owner (pagination)
- `PUT /api/items/{id}` - Update item (optional image replace/remove)
- `DELETE /api/items/{id}` - Delete item (auto-deletes image)

**Item Features:**
- Image uploads (JPG, PNG, GIF, WebP, max 5MB)
- Filesystem storage (`wwwroot/images/items/`)
- Direct image URLs (no auth required, e.g., `https://localhost:7117/images/items/abc.jpg`)
- Case-insensitive search by name/description
- Filter by status (Available/Borrowed/Lost) and owner
- Pagination (default 10/page, max 100)

### Borrowings (6 endpoints)
- `POST /api/borrowings` - Borrow an item
- `POST /api/borrowings/{id}/return` - Return item
- `POST /api/borrowings/{id}/lost` - Mark item as lost
- `GET /api/borrowings/{id}` - Get borrowing record
- `GET /api/borrowings/borrowed-by/{userId}` - Get user's borrowed items
- `GET /api/borrowings/lent-by/{userId}` - Get user's lent items

### Ratings (2 endpoints)
- `POST /api/ratings` - Create rating
- `GET /api/ratings/user/{userId}` - Get user ratings

**Total: 19 REST endpoints**

See `API_DOCUMENTATION.md` for complete details with request/response examples.

## 🚀 Testing with Swagger UI

The API includes **Swagger UI** for interactive testing - no additional tools needed!

### Access Swagger
1. Run the application: `dotnet run`
2. Open your browser to the root URL (e.g., `https://localhost:5234/`)
3. You'll see the **interactive Swagger documentation**

### Using Swagger UI
- **Explore endpoints**: All 19 endpoints are listed by category
- **Try it out**: Click any endpoint → "Try it out" → Fill parameters → "Execute"
- **See responses**: View request/response in real-time
- **Copy examples**: Get curl commands and request bodies

### Tips for Swagger Testing
1. **Start with User Registration**: Create a user first to get a valid `userId`
2. **Copy User IDs**: After registering, copy the returned user ID from the response
3. **Upload Images**: When creating items, use the "Choose File" button to upload item photos
4. **View Images**: Copy the `imageUrl` from responses and open in a browser tab (no auth needed)
5. **Try Search & Pagination**: Use `searchQuery`, `status` filters, and `pageSize` parameters
6. **Use Query Parameters**: Many endpoints need `userId`, `ownerId`, or `borrowerId` - paste the ID in the parameter field
7. **Test the Workflow**: Follow the sequence: Register → Create Item with Image → Search → Borrow → Return → Rate

**Swagger is configured to run in all environments** for easy testing.

## Quick Test Workflow

1. **Register two users** using the registration endpoint
2. **Create an item with image** for User A to lend (upload a photo)
3. **Search available items** as User B (try searching by keyword)
4. **Borrow the item** as User B
5. **View the item image** by opening the imageUrl in browser
6. **View borrowing history** for both users
7. **Return the item**
8. **Rate User B** as User A
9. **Check User B's rating**

Sample requests are available in `tsapi.http`.

## Database Schema

The application uses the following main tables:

- **AspNetUsers** - Users with Identity + custom fields (ratings)
- **Items** - Items available for lending (with optional ImageFileName)
- **BorrowingRecords** - Borrowing transaction history
- **UserRatings** - User ratings and reviews
- Plus standard Identity tables (Roles, Claims, etc.)

## Business Rules

1. Users cannot borrow their own items
2. Only available items can be borrowed
3. Only borrowed items can be returned or marked as lost
4. Users cannot rate themselves
5. Items cannot be deleted while borrowed
6. User ratings automatically update average when new ratings are added
7. Item images limited to 5MB (JPG, PNG, GIF, WebP)
8. Deleting an item automatically deletes its image file

## Authentication Note

The API is configured with ASP.NET Core Identity but does **not currently enforce authentication**. User IDs are passed as query parameters for testing purposes. This design allows for easy testing and future authentication implementation.

## API Documentation

- **Full API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Detailed endpoint documentation with examples
- **Quick Reference**: [ENDPOINTS_QUICK_REFERENCE.md](./ENDPOINTS_QUICK_REFERENCE.md) - Quick endpoint lookup, perfect for sharing
- **Swagger UI Guide**: [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Step-by-step interactive testing guide
- **Sample HTTP Requests**: [tsapi.http](./tsapi.http) - Visual Studio HTTP test file

## Future Enhancements

Potential features for future development:
- JWT token authentication
- Role-based authorization
- Email notifications
- Overdue item tracking
- Dispute resolution system

## License

This is a sample project for testing and learning purposes.

