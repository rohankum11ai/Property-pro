namespace PropertyPro.API.DTOs.Leases;

public class LeaseDto
{
    public int LeaseId { get; set; }
    public int TenantId { get; set; }
    public string TenantFirstName { get; set; } = string.Empty;
    public string TenantLastName { get; set; } = string.Empty;
    public string TenantEmail { get; set; } = string.Empty;
    public int UnitId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal SecurityDeposit { get; set; }
    public string PaymentFrequency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<LeaseActivityDto> Activities { get; set; } = new();
}
