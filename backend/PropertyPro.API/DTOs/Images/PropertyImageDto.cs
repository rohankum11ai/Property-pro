namespace PropertyPro.API.DTOs.Images;

public class PropertyImageDto
{
    public int PropertyImageId { get; set; }
    public int? PropertyId { get; set; }
    public int? UnitId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
