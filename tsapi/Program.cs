using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using tsapi.Data;
using tsapi.Models;
using tsapi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=borrowlend.db"));

// Identity configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Register application services
builder.Services.AddScoped<IBorrowingService, BorrowingService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IImageService, ImageService>();

// Add HttpContextAccessor for building absolute URLs
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

// Enable Swagger in all environments for easy testing
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "BorrowLend API v1");
    options.RoutePrefix = string.Empty; // Serve Swagger UI at root (https://localhost:port/)
});

app.UseHttpsRedirection();

// Serve static files (images) - no authentication required
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
