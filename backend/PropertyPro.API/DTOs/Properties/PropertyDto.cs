namespace PropertyPro.API.DTOs.Properties;

public class PropertyDto
{
    public int PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalUnits { get; set; }
    public int AvailableUnits { get; set; }
    public int OccupiedUnits { get; set; }
}
