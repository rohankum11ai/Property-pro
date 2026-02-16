using PropertyPro.API.DTOs.Leases;

namespace PropertyPro.API.Services;

public interface ILeaseService
{
    Task<List<LeaseDto>> GetLeasesAsync(int landlordId, string? search, string? status);
    Task<LeaseDto?> GetLeaseAsync(int leaseId, int landlordId);
    Task<LeaseDto> CreateLeaseAsync(int landlordId, CreateLeaseRequest request);
    Task<LeaseDto?> UpdateLeaseAsync(int leaseId, int landlordId, UpdateLeaseRequest request);
    Task<bool> DeleteLeaseAsync(int leaseId, int landlordId);
    Task<LeaseDto?> ChangeLeaseStatusAsync(int leaseId, int landlordId, string newStatus);
}
