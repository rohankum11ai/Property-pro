namespace PropertyPro.API.Models;

public class Tenant
{
    public int TenantId { get; set; }
    public int LandlordId { get; set; }
    public User Landlord { get; set; } = null!;
    public int? UnitId { get; set; }
    public Unit? Unit { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
