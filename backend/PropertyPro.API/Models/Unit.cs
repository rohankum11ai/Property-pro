namespace PropertyPro.API.Models;

public class Unit
{
    public int UnitId { get; set; }
    public int PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    public string UnitNumber { get; set; } = string.Empty;
    public int Bedrooms { get; set; }
    public decimal Bathrooms { get; set; }
    public decimal RentAmount { get; set; }
    public int? SquareFeet { get; set; }
    public string Status { get; set; } = "Available"; // Available | Occupied | UnderMaintenance
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
}
