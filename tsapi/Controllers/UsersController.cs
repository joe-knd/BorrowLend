using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tsapi.DTOs;
using tsapi.Models;

namespace tsapi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterUserDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, MapToDto(user));
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        return MapToDto(user);
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await userManager.Users.ToListAsync();
        return users.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Get user by email
    /// </summary>
    [HttpGet("email/{email}")]
    public async Task<ActionResult<UserDto>> GetByEmail(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            return NotFound();

        return MapToDto(user);
    }

    private static UserDto MapToDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AverageRating = user.AverageRating,
            TotalRatings = user.TotalRatings,
            CreatedAt = user.CreatedAt
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginUserDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }
        return MapToDto(user);
    }

}
