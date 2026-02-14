namespace PropertyPro.API.DTOs.Tenants;

public class TenantDto
{
    public int TenantId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? Notes { get; set; }
    public int? UnitId { get; set; }
    public string? UnitNumber { get; set; }
    public int? PropertyId { get; set; }
    public string? PropertyName { get; set; }
    public DateTime CreatedAt { get; set; }
}
