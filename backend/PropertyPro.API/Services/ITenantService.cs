using PropertyPro.API.DTOs.Tenants;

namespace PropertyPro.API.Services;

public interface ITenantService
{
    Task<List<TenantDto>> GetTenantsAsync(int landlordId, string? search);
    Task<TenantDto?> GetTenantAsync(int tenantId, int landlordId);
    Task<TenantDto> CreateTenantAsync(int landlordId, CreateTenantRequest request);
    Task<TenantDto?> UpdateTenantAsync(int tenantId, int landlordId, UpdateTenantRequest request);
    Task<bool> DeleteTenantAsync(int tenantId, int landlordId);
}
