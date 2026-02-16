namespace PropertyPro.API.Models;

public class PropertyImage
{
    public int PropertyImageId { get; set; }
    public int? PropertyId { get; set; }
    public Property? Property { get; set; }
    public int? UnitId { get; set; }
    public Unit? Unit { get; set; }
    public int LandlordId { get; set; }
    public User Landlord { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
