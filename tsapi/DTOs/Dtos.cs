using System.ComponentModel.DataAnnotations;

namespace tsapi.DTOs;

// User DTOs
public class RegisterUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Item DTOs
public class CreateItemDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }
}

public class CreateItemWithImageDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public string OwnerId { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}

public class UpdateItemWithImageDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public string OwnerId { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }

    public bool RemoveImage { get; set; }
}

public class ItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public UserDto? Owner { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastBorrowedAt { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsDisabled { get; set; }
}

// Borrowing DTOs
public class CreateBorrowingDto
{
    [Required]
    public int ItemId { get; set; }

    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
}

public class BorrowingRecordDto
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public ItemDto? Item { get; set; }
    public string BorrowerId { get; set; } = string.Empty;
    public UserDto? Borrower { get; set; }
    public string LenderId { get; set; } = string.Empty;
    public UserDto? Lender { get; set; }
    public DateTime BorrowedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class ReturnItemDto
{
    public string? Notes { get; set; }
    public int? Rating { get; set; }
    public string? Comment { get; set; }
}

public class MarkItemLostDto
{
    public string? Notes { get; set; }
    public int? Rating { get; set; }
    public string? Comment { get; set; }
}

// Rating DTOs
public class CreateRatingDto
{
    [Required]
    public string RatedUserId { get; set; } = string.Empty;

    public int? BorrowingRecordId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }
}

public class UserRatingDto
{
    public int Id { get; set; }
    public string RatedUserId { get; set; } = string.Empty;
    public UserDto? RatedUser { get; set; }
    public string RaterUserId { get; set; } = string.Empty;
    public UserDto? RaterUser { get; set; }
    public int? BorrowingRecordId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Search and Filter DTOs
public class ItemSearchParams
{
    public string? SearchQuery { get; set; }
    public string? Status { get; set; }
    public string? OwnerId { get; set; }
    public bool? ExcludeOwnerId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class LoginUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

