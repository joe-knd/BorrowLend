using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tsapi.Data;
using tsapi.DTOs;
using tsapi.Helpers;
using tsapi.Models;
using tsapi.Services;

namespace tsapi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController(ApplicationDbContext context, IImageService imageService) : ControllerBase
{
    /// <summary>
    /// Create a new item for lending (with optional image upload)
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ItemDto>> Create([FromForm] CreateItemWithImageDto dto)
    {
        if (string.IsNullOrEmpty(dto.OwnerId))
            return BadRequest("OwnerId is required");

        if (string.IsNullOrEmpty(dto.Name))
            return BadRequest("Name is required");

        var owner = await context.Users.FindAsync(dto.OwnerId);
        if (owner == null)
            return BadRequest("Owner not found");

        string? imageFileName = null;
        if (dto.Image != null)
        {
            if (!imageService.IsValidImage(dto.Image))
                return BadRequest("Invalid image file. Supported formats: jpg, jpeg, png, gif, webp. Max size: 5MB");

            try
            {
                imageFileName = await imageService.SaveImageAsync(dto.Image);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
            }
        }

        var item = new Item
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = dto.OwnerId,
            ImageFileName = imageFileName,
            Status = ItemStatus.Available,
            CreatedAt = DateTime.UtcNow
        };

        context.Items.Add(item);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, await MapToDtoAsync(item));
    }

    /// <summary>
    /// Get item by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetById(int id)
    {
        var item = await context.Items
            .Include(i => i.Owner)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound();

        return await MapToDtoAsync(item);
    }

    /// <summary>
    /// Get all items with search, filtering, and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ItemDto>>> GetAll(
        [FromQuery] string? searchQuery = null,
        [FromQuery] string? status = null,
        [FromQuery] string? ownerId = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = context.Items.Include(i => i.Owner).AsQueryable();

        // Search by name or description
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var searchLower = searchQuery.ToLower();
            query = query.Where(i => 
                i.Name.ToLower().Contains(searchLower) || 
                (i.Description != null && i.Description.ToLower().Contains(searchLower)));
        }

        // Filter by status
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ItemStatus>(status, true, out var itemStatus))
        {
            query = query.Where(i => i.Status == itemStatus);
        }

        // Filter by owner
        if (!string.IsNullOrEmpty(ownerId))
        {
            query = query.Where(i => i.OwnerId == ownerId);
        }

        // Order by creation date (newest first)
        query = query.OrderByDescending(i => i.CreatedAt);

        // Apply pagination
        var pagedResult = await query.ToPagedResultAsync(pageNumber, pageSize);

        // Map to DTOs
        var itemDtos = new List<ItemDto>();
        foreach (var item in pagedResult.Items)
        {
            itemDtos.Add(await MapToDtoAsync(item));
        }

        return new PagedResult<ItemDto>
        {
            Items = itemDtos,
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }

    /// <summary>
    /// Get all available items for borrowing with pagination
    /// </summary>
    [HttpGet("available")]
    public async Task<ActionResult<PagedResult<ItemDto>>> GetAvailable(
        [FromQuery] string? excludeOwnerId = null,
        [FromQuery] string? searchQuery = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = context.Items
            .Include(i => i.Owner)
            .Where(i => i.Status == ItemStatus.Available && !i.IsDisabled);

        if (!string.IsNullOrEmpty(excludeOwnerId))
        {
            query = query.Where(i => i.OwnerId != excludeOwnerId);
        }

        // Search by name or description
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var searchLower = searchQuery.ToLower();
            query = query.Where(i => 
                i.Name.ToLower().Contains(searchLower) || 
                (i.Description != null && i.Description.ToLower().Contains(searchLower)));
        }

        query = query.OrderByDescending(i => i.CreatedAt);

        var pagedResult = await query.ToPagedResultAsync(pageNumber, pageSize);

        var itemDtos = new List<ItemDto>();
        foreach (var item in pagedResult.Items)
        {
            itemDtos.Add(await MapToDtoAsync(item));
        }

        return new PagedResult<ItemDto>
        {
            Items = itemDtos,
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }

    /// <summary>
    /// Get all items owned by a specific user with pagination
    /// </summary>
    [HttpGet("owned-by/{ownerId}")]
    public async Task<ActionResult<PagedResult<ItemDto>>> GetByOwner(
        string ownerId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = context.Items
            .Include(i => i.Owner)
            .Where(i => i.OwnerId == ownerId)
            .OrderByDescending(i => i.CreatedAt);

        var pagedResult = await query.ToPagedResultAsync(pageNumber, pageSize);

        var itemDtos = new List<ItemDto>();
        foreach (var item in pagedResult.Items)
        {
            itemDtos.Add(await MapToDtoAsync(item));
        }

        return new PagedResult<ItemDto>
        {
            Items = itemDtos,
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }

    /// <summary>
    /// Update an item (including optional image replacement)
    /// </summary>
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ItemDto>> Update(int id, [FromForm] UpdateItemWithImageDto dto)
    {
        var item = await context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        if (item.OwnerId != dto.OwnerId)
            return Forbid();

        item.Name = dto.Name;
        item.Description = dto.Description;

        // Handle image update
        if (dto.RemoveImage && !string.IsNullOrEmpty(item.ImageFileName))
        {
            await imageService.DeleteImageAsync(item.ImageFileName);
            item.ImageFileName = null;
        }
        else if (dto.Image != null)
        {
            if (!imageService.IsValidImage(dto.Image))
                return BadRequest("Invalid image file. Supported formats: jpg, jpeg, png, gif, webp. Max size: 5MB");

            // Delete old image if exists
            if (!string.IsNullOrEmpty(item.ImageFileName))
            {
                await imageService.DeleteImageAsync(item.ImageFileName);
            }

            // Save new image
            try
            {
                item.ImageFileName = await imageService.SaveImageAsync(dto.Image);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
            }
        }

        await context.SaveChangesAsync();

        return await MapToDtoAsync(item);
    }

    /// <summary>
    /// Delete an item
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id, [FromQuery] string ownerId)
    {
        var item = await context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        if (item.OwnerId != ownerId)
            return Forbid();

        var activeBorrowings = await context.BorrowingRecords
            .AnyAsync(br => br.ItemId == id && 
                (br.Status == BorrowingStatus.Borrowed || 
                 br.Status == BorrowingStatus.ReturnRequested || 
                 br.Status == BorrowingStatus.ReturnPending || 
                 br.Status == BorrowingStatus.Requested));

        if (activeBorrowings)
            return BadRequest("Cannot delete an item that is currently borrowed, requested, or has a return pending");

        // Delete associated image file
        if (!string.IsNullOrEmpty(item.ImageFileName))
        {
            await imageService.DeleteImageAsync(item.ImageFileName);
        }

        context.Items.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Toggle the disabled status of an item
    /// </summary>
    [HttpPost("{id}/toggle-disable")]
    public async Task<ActionResult<ItemDto>> ToggleDisable(int id, [FromQuery] string ownerId)
    {
        var item = await context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        if (item.OwnerId != ownerId)
            return Forbid();

        item.IsDisabled = !item.IsDisabled;
        await context.SaveChangesAsync();

        return await MapToDtoAsync(item);
    }

    private async Task<ItemDto> MapToDtoAsync(Item item)
    {
        if (item.Owner == null)
        {
            var owner = await context.Users.FindAsync(item.OwnerId);
            item.Owner = owner!;
        }

        return new ItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            OwnerId = item.OwnerId,
            Owner = item.Owner == null ? null : new UserDto
            {
                Id = item.Owner.Id,
                Email = item.Owner.Email,
                FirstName = item.Owner.FirstName,
                LastName = item.Owner.LastName,
                AverageRating = item.Owner.AverageRating,
                TotalRatings = item.Owner.TotalRatings,
                CreatedAt = item.Owner.CreatedAt
            },
            Status = item.Status.ToString(),
            CreatedAt = item.CreatedAt,
            LastBorrowedAt = item.LastBorrowedAt,
            ImageUrl = imageService.GetImageUrl(item.ImageFileName, HttpContext),
            IsDisabled = item.IsDisabled
        };
    }
}
