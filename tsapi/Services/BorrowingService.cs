using Microsoft.EntityFrameworkCore;
using tsapi.Data;
using tsapi.Models;

namespace tsapi.Services;

public interface IBorrowingService
{
    Task<BorrowingRecord> CreateBorrowingAsync(int itemId, string borrowerId, DateTime? dueDate, string? notes);
    Task<BorrowingRecord> ApproveBorrowingAsync(int borrowingId, string ownerId);
    Task<BorrowingRecord> RejectBorrowingAsync(int borrowingId, string ownerId);
    Task<BorrowingRecord> RequestReturnAsync(int borrowingId, string ownerId);
    Task<BorrowingRecord> InitiateReturnAsync(int borrowingId, string borrowerId, string? notes);
    Task<BorrowingRecord> ReturnItemAsync(int borrowingId, string ownerId, int? rating, string? ratingComment, string? notes);
    Task<BorrowingRecord> MarkItemAsLostAsync(int borrowingId, string ownerId, int? rating, string? ratingComment, string? notes);
    Task<List<BorrowingRecord>> GetUserBorrowedItemsAsync(string userId);
    Task<List<BorrowingRecord>> GetUserLentItemsAsync(string userId);
    Task<BorrowingRecord?> GetBorrowingByIdAsync(int id);
}

public class BorrowingService : IBorrowingService
{
    private readonly ApplicationDbContext _context;
    private readonly IRatingService _ratingService;

    public BorrowingService(ApplicationDbContext context, IRatingService ratingService)
    {
        _context = context;
        _ratingService = ratingService;
    }

    public async Task<BorrowingRecord> CreateBorrowingAsync(int itemId, string borrowerId, DateTime? dueDate, string? notes)
    {
        var item = await _context.Items
            .Include(i => i.Owner)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null)
            throw new ArgumentException("Item not found");

        if (item.Status != ItemStatus.Available)
            throw new InvalidOperationException("Item is not available for borrowing");

        if (item.IsDisabled)
            throw new InvalidOperationException("This item has been disabled for borrowing");

        if (item.OwnerId == borrowerId)
            throw new InvalidOperationException("You cannot borrow your own item");

        var borrowingRecord = new BorrowingRecord
        {
            ItemId = itemId,
            BorrowerId = borrowerId,
            LenderId = item.OwnerId,
            BorrowedAt = DateTime.UtcNow,
            DueDate = dueDate,
            Status = BorrowingStatus.Requested,
            Notes = notes
        };

        _context.BorrowingRecords.Add(borrowingRecord);
        await _context.SaveChangesAsync();

        // Reload with all navigations so the response is complete
        return await GetBorrowingByIdAsync(borrowingRecord.Id) ?? borrowingRecord;
    }

    public async Task<BorrowingRecord> ApproveBorrowingAsync(int borrowingId, string ownerId)
    {
        var borrowing = await _context.BorrowingRecords
            .Include(br => br.Item)
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.Item.OwnerId != ownerId)
            throw new InvalidOperationException("Only the owner can approve this request");

        if (borrowing.Status != BorrowingStatus.Requested)
            throw new InvalidOperationException("This borrowing record is not in Requested status");

        if (borrowing.Item.Status != ItemStatus.Available)
            throw new InvalidOperationException("Item is no longer available");

        borrowing.Status = BorrowingStatus.Borrowed;
        borrowing.BorrowedAt = DateTime.UtcNow;
        borrowing.Item.Status = ItemStatus.Borrowed;
        borrowing.Item.LastBorrowedAt = DateTime.UtcNow;

        // Reject all other active borrow requests for this item
        var otherRequests = await _context.BorrowingRecords
            .Where(br => br.ItemId == borrowing.ItemId && br.Id != borrowing.Id && br.Status == BorrowingStatus.Requested)
            .ToListAsync();

        foreach (var req in otherRequests)
        {
            req.Status = BorrowingStatus.Rejected;
        }

        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<BorrowingRecord> RejectBorrowingAsync(int borrowingId, string ownerId)
    {
        var borrowing = await _context.BorrowingRecords
            .Include(br => br.Item)
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.Item.OwnerId != ownerId)
            throw new InvalidOperationException("Only the owner can reject this request");

        if (borrowing.Status != BorrowingStatus.Requested)
            throw new InvalidOperationException("This borrowing record is not in Requested status");

        borrowing.Status = BorrowingStatus.Rejected;
        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<BorrowingRecord> RequestReturnAsync(int borrowingId, string ownerId)
    {
        var borrowing = await _context.BorrowingRecords
            .Include(br => br.Item)
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.Item.OwnerId != ownerId)
            throw new InvalidOperationException("Only the owner can request the return of this item");

        if (borrowing.Status != BorrowingStatus.Borrowed)
            throw new InvalidOperationException("Item is not currently borrowed");

        borrowing.Status = BorrowingStatus.ReturnRequested;
        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<BorrowingRecord> InitiateReturnAsync(int borrowingId, string borrowerId, string? notes)
    {
        var borrowing = await _context.BorrowingRecords
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.BorrowerId != borrowerId)
            throw new InvalidOperationException("Only the borrower can initiate the return of this item");

        if (borrowing.Status != BorrowingStatus.Borrowed && borrowing.Status != BorrowingStatus.ReturnRequested)
            throw new InvalidOperationException("Item is not in a borrow state that can be returned");

        borrowing.Status = BorrowingStatus.ReturnPending;
        borrowing.ReturnedAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(notes))
            borrowing.Notes = notes;

        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<BorrowingRecord> ReturnItemAsync(int borrowingId, string ownerId, int? rating, string? ratingComment, string? notes)
    {
        var borrowing = await _context.BorrowingRecords
            .Include(br => br.Item)
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.Item.OwnerId != ownerId)
            throw new InvalidOperationException("Only the owner can confirm this return");

        if (borrowing.Status != BorrowingStatus.Borrowed && 
            borrowing.Status != BorrowingStatus.ReturnRequested && 
            borrowing.Status != BorrowingStatus.ReturnPending)
        {
            throw new InvalidOperationException("Item is not currently in a borrowed status");
        }

        borrowing.Status = BorrowingStatus.Returned;
        borrowing.ReturnedAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(notes))
            borrowing.Notes = notes;

        borrowing.Item.Status = ItemStatus.Available;

        if (rating.HasValue)
        {
            await _ratingService.CreateRatingAsync(borrowing.BorrowerId, ownerId, rating.Value, ratingComment, borrowingId);
        }

        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<BorrowingRecord> MarkItemAsLostAsync(int borrowingId, string ownerId, int? rating, string? ratingComment, string? notes)
    {
        var borrowing = await _context.BorrowingRecords
            .Include(br => br.Item)
            .FirstOrDefaultAsync(br => br.Id == borrowingId);

        if (borrowing == null)
            throw new ArgumentException("Borrowing record not found");

        if (borrowing.Item.OwnerId != ownerId)
            throw new InvalidOperationException("Only the owner can mark this item as lost");

        if (borrowing.Status != BorrowingStatus.Borrowed && 
            borrowing.Status != BorrowingStatus.ReturnRequested && 
            borrowing.Status != BorrowingStatus.ReturnPending)
        {
            throw new InvalidOperationException("Item is not currently in a borrowed status");
        }

        borrowing.Status = BorrowingStatus.Lost;
        if (!string.IsNullOrEmpty(notes))
            borrowing.Notes = notes;

        borrowing.Item.Status = ItemStatus.Lost;

        if (rating.HasValue)
        {
            await _ratingService.CreateRatingAsync(borrowing.BorrowerId, ownerId, rating.Value, ratingComment, borrowingId);
        }

        await _context.SaveChangesAsync();
        return await GetBorrowingByIdAsync(borrowingId) ?? borrowing;
    }

    public async Task<List<BorrowingRecord>> GetUserBorrowedItemsAsync(string userId)
    {
        return await _context.BorrowingRecords
            .Include(br => br.Item).ThenInclude(i => i.Owner)
            .Include(br => br.Borrower)
            .Include(br => br.Lender)
            .Where(br => br.BorrowerId == userId)
            .OrderByDescending(br => br.BorrowedAt)
            .ToListAsync();
    }

    public async Task<List<BorrowingRecord>> GetUserLentItemsAsync(string userId)
    {
        return await _context.BorrowingRecords
            .Include(br => br.Item).ThenInclude(i => i.Owner)
            .Include(br => br.Borrower)
            .Include(br => br.Lender)
            .Where(br => br.LenderId == userId)
            .OrderByDescending(br => br.BorrowedAt)
            .ToListAsync();
    }

    public async Task<BorrowingRecord?> GetBorrowingByIdAsync(int id)
    {
        return await _context.BorrowingRecords
            .Include(br => br.Item).ThenInclude(i => i.Owner)
            .Include(br => br.Borrower)
            .Include(br => br.Lender)
            .FirstOrDefaultAsync(br => br.Id == id);
    }
}
