using System.ComponentModel.DataAnnotations;

namespace tsapi.Models;

public class BorrowingRecord
{
    public int Id { get; set; }

    [Required]
    public int ItemId { get; set; }

    public Item Item { get; set; } = null!;

    [Required]
    public string BorrowerId { get; set; } = string.Empty;

    public ApplicationUser Borrower { get; set; } = null!;

    [Required]
    public string LenderId { get; set; } = string.Empty;

    public ApplicationUser Lender { get; set; } = null!;

    public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public BorrowingStatus Status { get; set; } = BorrowingStatus.Borrowed;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public enum BorrowingStatus
{
    Borrowed = 0,
    Returned = 1,
    Lost = 2,
    Requested = 3,
    ReturnRequested = 4,
    ReturnPending = 5,
    Rejected = 6
}
