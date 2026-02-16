namespace PropertyPro.API.Models;

public class Lease
{
    public int LeaseId { get; set; }
    public int LandlordId { get; set; }
    public User Landlord { get; set; } = null!;
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    public int UnitId { get; set; }
    public Unit Unit { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal SecurityDeposit { get; set; }
    public string PaymentFrequency { get; set; } = "Monthly";
    public string Status { get; set; } = "Pending"; // Active | Terminated | Pending
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<LeaseActivity> Activities { get; set; } = new List<LeaseActivity>();
}
