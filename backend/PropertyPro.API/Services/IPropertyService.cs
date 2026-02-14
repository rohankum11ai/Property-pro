using PropertyPro.API.DTOs.Properties;
using PropertyPro.API.DTOs.Units;

namespace PropertyPro.API.Services;

public interface IPropertyService
{
    Task<List<PropertyDto>> GetPropertiesAsync(int landlordId);
    Task<PropertyDto?> GetPropertyAsync(int propertyId, int landlordId);
    Task<PropertyDto> CreatePropertyAsync(int landlordId, CreatePropertyRequest request);
    Task<PropertyDto?> UpdatePropertyAsync(int propertyId, int landlordId, UpdatePropertyRequest request);
    Task<bool> DeletePropertyAsync(int propertyId, int landlordId);

    Task<List<UnitDto>> GetUnitsAsync(int propertyId, int landlordId);
    Task<UnitDto?> GetUnitAsync(int unitId, int landlordId);
    Task<UnitDto> CreateUnitAsync(int propertyId, int landlordId, CreateUnitRequest request);
    Task<UnitDto?> UpdateUnitAsync(int unitId, int landlordId, UpdateUnitRequest request);
    Task<bool> DeleteUnitAsync(int unitId, int landlordId);
}
