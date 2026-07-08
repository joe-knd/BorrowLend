using System.ComponentModel.DataAnnotations;

namespace tsapi.Models;

public class Item
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public string OwnerId { get; set; } = string.Empty;

    public ApplicationUser Owner { get; set; } = null!;

    public ItemStatus Status { get; set; } = ItemStatus.Available;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastBorrowedAt { get; set; }

    [MaxLength(500)]
    public string? ImageFileName { get; set; }

    public bool IsDisabled { get; set; } = false;

    // Navigation properties
    public ICollection<BorrowingRecord> BorrowingHistory { get; set; } = new List<BorrowingRecord>();
}

public enum ItemStatus
{
    Available,
    Borrowed,
    Lost
}
