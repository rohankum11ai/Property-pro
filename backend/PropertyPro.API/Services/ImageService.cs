using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Images;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class ImageService : IImageService
{
    private readonly AppDbContext _db;
    private readonly IAppSettingsService _settings;
    private readonly string _basePath;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    public ImageService(AppDbContext db, IAppSettingsService settings, IConfiguration config)
    {
        _db = db;
        _settings = settings;
        _basePath = config["ImageStorage:BasePath"]
            ?? Path.Combine(config["DocumentStorage:BasePath"] ?? "C:\\PropertyProDocs", "images");
    }

    public async Task<List<PropertyImageDto>> GetPropertyImagesAsync(int propertyId, int landlordId)
    {
        return await _db.PropertyImages
            .Where(i => i.PropertyId == propertyId && i.LandlordId == landlordId)
            .OrderBy(i => i.SortOrder)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<List<PropertyImageDto>> GetUnitImagesAsync(int unitId, int landlordId)
    {
        return await _db.PropertyImages
            .Where(i => i.UnitId == unitId && i.LandlordId == landlordId)
            .OrderBy(i => i.SortOrder)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<PropertyImageDto> UploadPropertyImageAsync(int propertyId, int landlordId, IFormFile file)
    {
        var property = await _db.Properties
            .FirstOrDefaultAsync(p => p.PropertyId == propertyId && p.LandlordId == landlordId);
        if (property == null)
            throw new InvalidOperationException("Property not found.");

        await ValidateFile(file);

        var maxImages = await _settings.GetIntAsync("MaxImagesPerProperty", 10);
        var currentCount = await _db.PropertyImages.CountAsync(i => i.PropertyId == propertyId);
        if (currentCount >= maxImages)
            throw new InvalidOperationException($"Maximum of {maxImages} images allowed per property.");

        var nextOrder = currentCount > 0
            ? await _db.PropertyImages.Where(i => i.PropertyId == propertyId).MaxAsync(i => i.SortOrder) + 1
            : 0;

        var folder = Path.Combine(_basePath, landlordId.ToString(), "property", propertyId.ToString());
        return await SaveImage(file, folder, landlordId, nextOrder, propertyId: propertyId);
    }

    public async Task<PropertyImageDto> UploadUnitImageAsync(int unitId, int landlordId, IFormFile file)
    {
        var unit = await _db.Units
            .Include(u => u.Property)
            .FirstOrDefaultAsync(u => u.UnitId == unitId && u.Property.LandlordId == landlordId);
        if (unit == null)
            throw new InvalidOperationException("Unit not found.");

        await ValidateFile(file);

        var maxImages = await _settings.GetIntAsync("MaxImagesPerUnit", 5);
        var currentCount = await _db.PropertyImages.CountAsync(i => i.UnitId == unitId);
        if (currentCount >= maxImages)
            throw new InvalidOperationException($"Maximum of {maxImages} images allowed per unit.");

        var nextOrder = currentCount > 0
            ? await _db.PropertyImages.Where(i => i.UnitId == unitId).MaxAsync(i => i.SortOrder) + 1
            : 0;

        var folder = Path.Combine(_basePath, landlordId.ToString(), "unit", unitId.ToString());
        return await SaveImage(file, folder, landlordId, nextOrder, unitId: unitId);
    }

    public async Task<(Stream stream, string contentType, string fileName)?> GetImageFileAsync(int imageId, int landlordId)
    {
        var img = await _db.PropertyImages
            .FirstOrDefaultAsync(i => i.PropertyImageId == imageId && i.LandlordId == landlordId);
        if (img == null) return null;

        var filePath = GetFilePath(img);
        if (!File.Exists(filePath)) return null;

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return (stream, img.ContentType, img.FileName);
    }

    public async Task<bool> DeleteImageAsync(int imageId, int landlordId)
    {
        var img = await _db.PropertyImages
            .FirstOrDefaultAsync(i => i.PropertyImageId == imageId && i.LandlordId == landlordId);
        if (img == null) return false;

        var filePath = GetFilePath(img);
        if (File.Exists(filePath))
            File.Delete(filePath);

        _db.PropertyImages.Remove(img);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task ValidateFile(IFormFile file)
    {
        var maxSizeMB = await _settings.GetIntAsync("MaxImageSizeMB", 10);
        if (file.Length > maxSizeMB * 1024L * 1024L)
            throw new InvalidOperationException($"Image size exceeds the {maxSizeMB} MB limit.");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Image type not allowed. Accepted: JPG, PNG, WebP.");
    }

    private async Task<PropertyImageDto> SaveImage(IFormFile file, string folder, int landlordId, int sortOrder, int? propertyId = null, int? unitId = null)
    {
        Directory.CreateDirectory(folder);
        var storedName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(folder, storedName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var img = new PropertyImage
        {
            PropertyId = propertyId,
            UnitId = unitId,
            LandlordId = landlordId,
            FileName = file.FileName,
            StoredFileName = storedName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            SortOrder = sortOrder
        };

        _db.PropertyImages.Add(img);
        await _db.SaveChangesAsync();

        return ToDto(img);
    }

    private string GetFilePath(PropertyImage img)
    {
        var type = img.PropertyId != null ? "property" : "unit";
        var entityId = (img.PropertyId ?? img.UnitId)!.Value;
        return Path.Combine(_basePath, img.LandlordId.ToString(), type, entityId.ToString(), img.StoredFileName);
    }

    private static PropertyImageDto ToDto(PropertyImage i) => new()
    {
        PropertyImageId = i.PropertyImageId,
        PropertyId = i.PropertyId,
        UnitId = i.UnitId,
        FileName = i.FileName,
        ContentType = i.ContentType,
        FileSize = i.FileSize,
        SortOrder = i.SortOrder,
        CreatedAt = i.CreatedAt
    };
}
