using Microsoft.EntityFrameworkCore;
using tsapi.Data;
using tsapi.Models;

namespace tsapi.Services;

public interface IRatingService
{
    Task<UserRating> CreateRatingAsync(string ratedUserId, string raterUserId, int rating, string? comment, int? borrowingRecordId);
    Task<List<UserRating>> GetUserRatingsAsync(string userId);
    Task UpdateUserAverageRatingAsync(string userId);
}

public class RatingService : IRatingService
{
    private readonly ApplicationDbContext _context;

    public RatingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserRating> CreateRatingAsync(string ratedUserId, string raterUserId, int rating, string? comment, int? borrowingRecordId)
    {
        if (ratedUserId == raterUserId)
            throw new InvalidOperationException("You cannot rate yourself");

        var ratedUser = await _context.Users.FindAsync(ratedUserId);
        if (ratedUser == null)
            throw new ArgumentException("Rated user not found");

        var raterUser = await _context.Users.FindAsync(raterUserId);
        if (raterUser == null)
            throw new ArgumentException("Rater user not found");

        var userRating = new UserRating
        {
            RatedUserId = ratedUserId,
            RaterUserId = raterUserId,
            Rating = rating,
            Comment = comment,
            BorrowingRecordId = borrowingRecordId,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserRatings.Add(userRating);
        await _context.SaveChangesAsync();

        await UpdateUserAverageRatingAsync(ratedUserId);

        // Reload with navigations so the response is complete
        return await _context.UserRatings
            .Include(ur => ur.RatedUser)
            .Include(ur => ur.RaterUser)
            .FirstAsync(ur => ur.Id == userRating.Id);
    }

    public async Task<List<UserRating>> GetUserRatingsAsync(string userId)
    {
        return await _context.UserRatings
            .Include(ur => ur.RatedUser)
            .Include(ur => ur.RaterUser)
            .Where(ur => ur.RatedUserId == userId)
            .OrderByDescending(ur => ur.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateUserAverageRatingAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return;

        var ratings = await _context.UserRatings
            .Where(ur => ur.RatedUserId == userId)
            .ToListAsync();

        if (ratings.Any())
        {
            user.AverageRating = ratings.Average(r => r.Rating);
            user.TotalRatings = ratings.Count;
        }
        else
        {
            user.AverageRating = 0.0;
            user.TotalRatings = 0;
        }

        await _context.SaveChangesAsync();
    }
}
