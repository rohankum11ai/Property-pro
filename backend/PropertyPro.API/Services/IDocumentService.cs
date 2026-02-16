using PropertyPro.API.DTOs.Documents;

namespace PropertyPro.API.Services;

public interface IDocumentService
{
    Task<List<TenantDocumentDto>> GetDocumentsAsync(int tenantId, int landlordId);
    Task<TenantDocumentDto> UploadDocumentAsync(int tenantId, int landlordId, IFormFile file, string category);
    Task<(Stream stream, string contentType, string fileName)?> GetDocumentFileAsync(int documentId, int landlordId);
    Task<bool> DeleteDocumentAsync(int documentId, int landlordId);
}
