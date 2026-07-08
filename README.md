# BorrowLend - Peer-to-Peer Item Sharing Platform

BorrowLend is a peer-to-peer item sharing application that allows users to register their physical items, enable/disable them for borrowing, request to borrow items from other users, manage return flows, and rate borrowers.

The repository is structured into two main sub-projects:

1. **`tsapi`**: The C# .NET 10 RESTful backend Web API.
2. **`tsApp`**: The Angular 22 frontend web client application.

---

## 1. Backend API (`tsapi`)

### Tech Stack
- **Framework**: .NET 10.0 Web API
- **Database**: SQLite (via Entity Framework Core 10)
- **Object Mapping**: DTO-based mappings with manual DTO structures.
- **Documentation**: Swagger/OpenAPI interface for API testing.

### Features
- **User Authentication**: Simple Identity registration and sign-in.
- **Item Listings**: Create, Read, Update (including image uploads), and Delete (soft protected if active borrows exist) items.
- **Workflow State Engine**: Handles requests through status changes (`Requested`, `Borrowed`, `ReturnRequested`, `ReturnPending`, `Returned`, `Lost`, `Rejected`).
- **Rating Calculations**: Evaluates and updates average ratings and review counts dynamically for borrowers upon item returns or losses.

### How to Run
1. Navigate to the C# directory:
   ```bash
   cd tsapi
   ```
2. Build the project to restore dependencies:
   ```bash
   dotnet build
   ```
3. Run the application:
   ```bash
   dotnet run
   ```
   *The API will run on `https://localhost:7298` and the Swagger interactive sandbox will be served at the root (e.g. `https://localhost:7298/index.html`).*

---

## 2. Frontend client (`tsApp`)

### Tech Stack
- **Framework**: Angular 22 (using standard Angular modules structure)
- **State Management**: Reactive properties driven by **Angular Signals**.
- **Styling**: Bootstrap 5 + Vanilla CSS layout styling.

### Features
- **Branded Navbar Header**: Rebranded to `BorrowLend`.
- **Borrow Requests Center**: A dashboard showing incoming requests where owners can click to "Approve" or "Reject".
- **Toggle Availability**: Owners can toggle "Enable/Disable Borrowing" for their items in real-time, excluding disabled items from general searches.
- **Visual Star Rating Indicator**: Displays borrower and owner average scores as visually filled star icons (`★`).
- **Detailed Reviews Overlay**: Clicking on any user's stars opens a scrollable popup dialog overlay displaying all detailed reviews, scores, and comment histories given by other users.
- **Interactive Ratings Selector**: A visual star select bar inside the return/lost modal dialogs allowing owners to rate the borrower on a scale of 1 to 5 stars.
- **Zoom Lightbox Modals**: Images are resized as neat grid thumbnails to avoid scrolling. Clicking on them opens a centered modal displaying the full size image, which can be closed.

### How to Run
1. Navigate to the Angular directory:
   ```bash
   cd tsApp
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm start
   ```
   *The application will run on `http://localhost:4200/`. API requests matching `/api/*` are configured to automatically proxy to `https://localhost:7298` via `proxy.conf.json`.*
