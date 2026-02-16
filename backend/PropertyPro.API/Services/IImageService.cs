using PropertyPro.API.DTOs.Images;

namespace PropertyPro.API.Services;

public interface IImageService
{
    Task<List<PropertyImageDto>> GetPropertyImagesAsync(int propertyId, int landlordId);
    Task<List<PropertyImageDto>> GetUnitImagesAsync(int unitId, int landlordId);
    Task<PropertyImageDto> UploadPropertyImageAsync(int propertyId, int landlordId, IFormFile file);
    Task<PropertyImageDto> UploadUnitImageAsync(int unitId, int landlordId, IFormFile file);
    Task<(Stream stream, string contentType, string fileName)?> GetImageFileAsync(int imageId, int landlordId);
    Task<bool> DeleteImageAsync(int imageId, int landlordId);
}
