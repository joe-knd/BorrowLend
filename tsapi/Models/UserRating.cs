using System.ComponentModel.DataAnnotations;

namespace tsapi.Models;

public class UserRating
{
    public int Id { get; set; }

    [Required]
    public string RatedUserId { get; set; } = string.Empty;

    public ApplicationUser RatedUser { get; set; } = null!;

    [Required]
    public string RaterUserId { get; set; } = string.Empty;

    public ApplicationUser RaterUser { get; set; } = null!;

    public int? BorrowingRecordId { get; set; }

    public BorrowingRecord? BorrowingRecord { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
