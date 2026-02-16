namespace PropertyPro.API.Models;

public class Payment
{
    public int PaymentId { get; set; }
    public int LeaseId { get; set; }
    public Lease Lease { get; set; } = null!;
    public int LandlordId { get; set; }
    public User Landlord { get; set; } = null!;
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = "E-Transfer"; // E-Transfer | Cash | Cheque | Bank Transfer | Credit Card | Other
    public string Status { get; set; } = "Paid"; // Paid | Partial | Late | Pending
    public int PeriodMonth { get; set; }
    public int PeriodYear { get; set; }
    public decimal LateFee { get; set; }
    public string? Notes { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
