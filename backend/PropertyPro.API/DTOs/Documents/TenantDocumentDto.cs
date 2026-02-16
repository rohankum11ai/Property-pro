namespace PropertyPro.API.DTOs.Documents;

public class TenantDocumentDto
{
    public int TenantDocumentId { get; set; }
    public int TenantId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
