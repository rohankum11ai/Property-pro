namespace PropertyPro.API.Models;

public class Property
{
    public int PropertyId { get; set; }
    public int LandlordId { get; set; }
    public User Landlord { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty; // Apartment | House | Condo | Commercial
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Unit> Units { get; set; } = new List<Unit>();
    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
}
