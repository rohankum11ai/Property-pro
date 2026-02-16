using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Documents;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _db;
    private readonly string _basePath;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc"
    };

    private const long MaxFileSize = 25 * 1024 * 1024; // 25 MB

    public DocumentService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _basePath = config["DocumentStorage:BasePath"]
            ?? throw new InvalidOperationException("DocumentStorage:BasePath not configured.");
    }

    public async Task<List<TenantDocumentDto>> GetDocumentsAsync(int tenantId, int landlordId)
    {
        return await _db.TenantDocuments
            .Where(d => d.TenantId == tenantId && d.LandlordId == landlordId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new TenantDocumentDto
            {
                TenantDocumentId = d.TenantDocumentId,
                TenantId = d.TenantId,
                FileName = d.FileName,
                Category = d.Category,
                FileSize = d.FileSize,
                ContentType = d.ContentType,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<TenantDocumentDto> UploadDocumentAsync(int tenantId, int landlordId, IFormFile file, string category)
    {
        // Validate tenant ownership
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.TenantId == tenantId && t.LandlordId == landlordId);
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found.");

        // Validate file size
        if (file.Length > MaxFileSize)
            throw new InvalidOperationException("File size exceeds the 25 MB limit.");

        // Validate extension
        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("File type not allowed. Accepted: PDF, JPG, PNG, DOCX, DOC.");

        // Build storage path
        var folder = Path.Combine(_basePath, landlordId.ToString(), tenantId.ToString());
        Directory.CreateDirectory(folder);

        var storedName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(folder, storedName);

        // Save file
        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var doc = new TenantDocument
        {
            TenantId = tenantId,
            LandlordId = landlordId,
            FileName = file.FileName,
            StoredFileName = storedName,
            Category = category,
            FileSize = file.Length,
            ContentType = file.ContentType
        };

        _db.TenantDocuments.Add(doc);
        await _db.SaveChangesAsync();

        return new TenantDocumentDto
        {
            TenantDocumentId = doc.TenantDocumentId,
            TenantId = doc.TenantId,
            FileName = doc.FileName,
            Category = doc.Category,
            FileSize = doc.FileSize,
            ContentType = doc.ContentType,
            CreatedAt = doc.CreatedAt
        };
    }

    public async Task<(Stream stream, string contentType, string fileName)?> GetDocumentFileAsync(int documentId, int landlordId)
    {
        var doc = await _db.TenantDocuments
            .FirstOrDefaultAsync(d => d.TenantDocumentId == documentId && d.LandlordId == landlordId);

        if (doc == null) return null;

        var filePath = Path.Combine(_basePath, doc.LandlordId.ToString(), doc.TenantId.ToString(), doc.StoredFileName);

        if (!File.Exists(filePath)) return null;

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return (stream, doc.ContentType, doc.FileName);
    }

    public async Task<bool> DeleteDocumentAsync(int documentId, int landlordId)
    {
        var doc = await _db.TenantDocuments
            .FirstOrDefaultAsync(d => d.TenantDocumentId == documentId && d.LandlordId == landlordId);

        if (doc == null) return false;

        // Delete physical file
        var filePath = Path.Combine(_basePath, doc.LandlordId.ToString(), doc.TenantId.ToString(), doc.StoredFileName);
        if (File.Exists(filePath))
            File.Delete(filePath);

        _db.TenantDocuments.Remove(doc);
        await _db.SaveChangesAsync();
        return true;
    }
}
