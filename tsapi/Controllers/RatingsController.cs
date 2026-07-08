using Microsoft.AspNetCore.Mvc;
using tsapi.DTOs;
using tsapi.Services;

namespace tsapi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController(IRatingService ratingService) : ControllerBase
{
    /// <summary>
    /// Create a rating for a user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserRatingDto>> CreateRating([FromBody] CreateRatingDto dto, [FromQuery] string raterUserId)
    {
        try
        {
            if (string.IsNullOrEmpty(raterUserId))
                return BadRequest("RaterUserId is required");

            var rating = await ratingService.CreateRatingAsync(
                dto.RatedUserId,
                raterUserId,
                dto.Rating,
                dto.Comment,
                dto.BorrowingRecordId);

            return CreatedAtAction(nameof(GetRatingsForUser), new { userId = dto.RatedUserId }, MapToDto(rating));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Get all ratings for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<UserRatingDto>>> GetRatingsForUser(string userId)
    {
        var ratings = await ratingService.GetUserRatingsAsync(userId);
        return ratings.Select(MapToDto).ToList();
    }

    private static UserRatingDto MapToDto(Models.UserRating rating)
    {
        return new UserRatingDto
        {
            Id = rating.Id,
            RatedUserId = rating.RatedUserId,
            RatedUser = rating.RatedUser == null ? null : new UserDto
            {
                Id = rating.RatedUser.Id,
                Email = rating.RatedUser.Email,
                FirstName = rating.RatedUser.FirstName,
                LastName = rating.RatedUser.LastName,
                AverageRating = rating.RatedUser.AverageRating,
                TotalRatings = rating.RatedUser.TotalRatings,
                CreatedAt = rating.RatedUser.CreatedAt
            },
            RaterUserId = rating.RaterUserId,
            RaterUser = rating.RaterUser == null ? null : new UserDto
            {
                Id = rating.RaterUser.Id,
                Email = rating.RaterUser.Email,
                FirstName = rating.RaterUser.FirstName,
                LastName = rating.RaterUser.LastName,
                AverageRating = rating.RaterUser.AverageRating,
                TotalRatings = rating.RaterUser.TotalRatings,
                CreatedAt = rating.RaterUser.CreatedAt
            },
            BorrowingRecordId = rating.BorrowingRecordId,
            Rating = rating.Rating,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        };
    }
}
