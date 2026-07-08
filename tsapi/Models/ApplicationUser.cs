using Microsoft.AspNetCore.Identity;

namespace tsapi.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public double AverageRating { get; set; } = 0.0;
    public int TotalRatings { get; set; } = 0;

    // Navigation properties
    public ICollection<Item> OwnedItems { get; set; } = new List<Item>();
    public ICollection<BorrowingRecord> BorrowedRecords { get; set; } = new List<BorrowingRecord>();
    public ICollection<BorrowingRecord> LentRecords { get; set; } = new List<BorrowingRecord>();
    public ICollection<UserRating> ReceivedRatings { get; set; } = new List<UserRating>();
    public ICollection<UserRating> GivenRatings { get; set; } = new List<UserRating>();
}
