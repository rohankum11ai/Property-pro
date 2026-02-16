using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Leases;

public class CreateLeaseRequest
{
    [Required] public int TenantId { get; set; }
    [Required] public int UnitId { get; set; }
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime EndDate { get; set; }
    [Required] public decimal MonthlyRent { get; set; }
    public decimal SecurityDeposit { get; set; }
    public string PaymentFrequency { get; set; } = "Monthly";
    public string? Notes { get; set; }
}
