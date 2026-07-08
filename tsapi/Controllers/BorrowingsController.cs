using Microsoft.AspNetCore.Mvc;
using tsapi.DTOs;
using tsapi.Services;

namespace tsapi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowingsController(IBorrowingService borrowingService, IImageService imageService, IHttpContextAccessor httpContextAccessor) : ControllerBase
{
    /// <summary>
    /// Borrow an item
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BorrowingRecordDto>> BorrowItem([FromBody] CreateBorrowingDto dto, [FromQuery] string borrowerId)
    {
        try
        {
            if (string.IsNullOrEmpty(borrowerId))
                return BadRequest("BorrowerId is required");

            var borrowing = await borrowingService.CreateBorrowingAsync(
                dto.ItemId,
                borrowerId,
                dto.DueDate,
                dto.Notes);

            return CreatedAtAction(nameof(GetById), new { id = borrowing.Id }, await MapToDtoAsync(borrowing));
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
    /// Approve a borrow request
    /// </summary>
    [HttpPost("{id}/approve")]
    public async Task<ActionResult<BorrowingRecordDto>> ApproveBorrowing(int id, [FromQuery] string ownerId)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("OwnerId is required");

            var borrowing = await borrowingService.ApproveBorrowingAsync(id, ownerId);
            return await MapToDtoAsync(borrowing);
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
    /// Reject a borrow request
    /// </summary>
    [HttpPost("{id}/reject")]
    public async Task<ActionResult<BorrowingRecordDto>> RejectBorrowing(int id, [FromQuery] string ownerId)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("OwnerId is required");

            var borrowing = await borrowingService.RejectBorrowingAsync(id, ownerId);
            return await MapToDtoAsync(borrowing);
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
    /// Request that a lent item be returned
    /// </summary>
    [HttpPost("{id}/request-return")]
    public async Task<ActionResult<BorrowingRecordDto>> RequestReturn(int id, [FromQuery] string ownerId)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("OwnerId is required");

            var borrowing = await borrowingService.RequestReturnAsync(id, ownerId);
            return await MapToDtoAsync(borrowing);
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
    /// Initiate return of an item (by borrower)
    /// </summary>
    [HttpPost("{id}/initiate-return")]
    public async Task<ActionResult<BorrowingRecordDto>> InitiateReturn(int id, [FromQuery] string borrowerId, [FromBody] ReturnItemDto? dto)
    {
        try
        {
            if (string.IsNullOrEmpty(borrowerId))
                return BadRequest("BorrowerId is required");

            var borrowing = await borrowingService.InitiateReturnAsync(id, borrowerId, dto?.Notes);
            return await MapToDtoAsync(borrowing);
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
    /// Confirm return of an item (by owner/lender) with rating option
    /// </summary>
    [HttpPost("{id}/confirm-return")]
    public async Task<ActionResult<BorrowingRecordDto>> ConfirmReturn(int id, [FromQuery] string ownerId, [FromBody] ReturnItemDto? dto)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("OwnerId is required");

            var borrowing = await borrowingService.ReturnItemAsync(id, ownerId, dto?.Rating, dto?.Comment, dto?.Notes);
            return await MapToDtoAsync(borrowing);
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
    /// Mark a borrowed item as lost (by owner/lender) with rating option
    /// </summary>
    [HttpPost("{id}/lost")]
    public async Task<ActionResult<BorrowingRecordDto>> MarkAsLost(int id, [FromQuery] string ownerId, [FromBody] MarkItemLostDto? dto)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("OwnerId is required");

            var borrowing = await borrowingService.MarkItemAsLostAsync(id, ownerId, dto?.Rating, dto?.Comment, dto?.Notes);
            return await MapToDtoAsync(borrowing);
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
    /// Get borrowing record by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BorrowingRecordDto>> GetById(int id)
    {
        var borrowing = await borrowingService.GetBorrowingByIdAsync(id);
        if (borrowing == null)
            return NotFound();

        return await MapToDtoAsync(borrowing);
    }

    /// <summary>
    /// Get all items borrowed by a specific user
    /// </summary>
    [HttpGet("borrowed-by/{userId}")]
    public async Task<ActionResult<List<BorrowingRecordDto>>> GetBorrowedByUser(string userId)
    {
        var borrowings = await borrowingService.GetUserBorrowedItemsAsync(userId);
        var dtos = new List<BorrowingRecordDto>();
        foreach (var borrowing in borrowings)
        {
            dtos.Add(await MapToDtoAsync(borrowing));
        }
        return dtos;
    }

    /// <summary>
    /// Get all items lent by a specific user
    /// </summary>
    [HttpGet("lent-by/{userId}")]
    public async Task<ActionResult<List<BorrowingRecordDto>>> GetLentByUser(string userId)
    {
        var borrowings = await borrowingService.GetUserLentItemsAsync(userId);
        var dtos = new List<BorrowingRecordDto>();
        foreach (var borrowing in borrowings)
        {
            dtos.Add(await MapToDtoAsync(borrowing));
        }
        return dtos;
    }

    private Task<BorrowingRecordDto> MapToDtoAsync(Models.BorrowingRecord borrowing)
    {
        var httpContext = httpContextAccessor.HttpContext;

        return Task.FromResult(new BorrowingRecordDto
        {
            Id = borrowing.Id,
            ItemId = borrowing.ItemId,
            Item = borrowing.Item == null ? null : new ItemDto
            {
                Id = borrowing.Item.Id,
                Name = borrowing.Item.Name,
                Description = borrowing.Item.Description,
                OwnerId = borrowing.Item.OwnerId,
                Owner = borrowing.Item.Owner == null ? null : new UserDto
                {
                    Id = borrowing.Item.Owner.Id,
                    Email = borrowing.Item.Owner.Email,
                    FirstName = borrowing.Item.Owner.FirstName,
                    LastName = borrowing.Item.Owner.LastName,
                    AverageRating = borrowing.Item.Owner.AverageRating,
                    TotalRatings = borrowing.Item.Owner.TotalRatings,
                    CreatedAt = borrowing.Item.Owner.CreatedAt
                },
                Status = borrowing.Item.Status.ToString(),
                CreatedAt = borrowing.Item.CreatedAt,
                LastBorrowedAt = borrowing.Item.LastBorrowedAt,
                ImageUrl = httpContext != null ? imageService.GetImageUrl(borrowing.Item.ImageFileName, httpContext) : null
            },
            BorrowerId = borrowing.BorrowerId,
            Borrower = borrowing.Borrower == null ? null : new UserDto
            {
                Id = borrowing.Borrower.Id,
                Email = borrowing.Borrower.Email,
                FirstName = borrowing.Borrower.FirstName,
                LastName = borrowing.Borrower.LastName,
                AverageRating = borrowing.Borrower.AverageRating,
                TotalRatings = borrowing.Borrower.TotalRatings,
                CreatedAt = borrowing.Borrower.CreatedAt
            },
            LenderId = borrowing.LenderId,
            Lender = borrowing.Lender == null ? null : new UserDto
            {
                Id = borrowing.Lender.Id,
                Email = borrowing.Lender.Email,
                FirstName = borrowing.Lender.FirstName,
                LastName = borrowing.Lender.LastName,
                AverageRating = borrowing.Lender.AverageRating,
                TotalRatings = borrowing.Lender.TotalRatings,
                CreatedAt = borrowing.Lender.CreatedAt
            },
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            ReturnedAt = borrowing.ReturnedAt,
            Status = borrowing.Status.ToString(),
            Notes = borrowing.Notes
        });
    }
}
