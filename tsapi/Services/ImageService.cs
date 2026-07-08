namespace tsapi.Services;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file, string subfolder = "items");
    Task<bool> DeleteImageAsync(string filePath);
    bool IsValidImage(IFormFile file);
    string GetImageUrl(string? relativePath, HttpContext httpContext);
}

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageService> _logger;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public bool IsValidImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        if (file.Length > MaxFileSize)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return false;

        return true;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string subfolder = "items")
    {
        if (!IsValidImage(file))
            throw new ArgumentException("Invalid image file");

        // Create directory if it doesn't exist
        var imagesPath = Path.Combine(_environment.WebRootPath, "images", subfolder);
        Directory.CreateDirectory(imagesPath);

        // Generate unique filename
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(imagesPath, fileName);

        // Save file
        try
        {
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for storage in database
            return $"images/{subfolder}/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving image file");
            throw new InvalidOperationException("Failed to save image", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return false;

        try
        {
            var fullPath = Path.Combine(_environment.WebRootPath, filePath);
            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image file: {FilePath}", filePath);
            return false;
        }
    }

    public string GetImageUrl(string? relativePath, HttpContext httpContext)
    {
        if (string.IsNullOrEmpty(relativePath))
            return string.Empty;

        // Build absolute URL
        var request = httpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        // Ensure path starts with /
        var path = relativePath.StartsWith("/") ? relativePath : $"/{relativePath}";

        return $"{baseUrl}{path}";
    }
}
