namespace PropertyPro.API.DTOs.Payments;

public class PaymentDto
{
    public int PaymentId { get; set; }
    public int LeaseId { get; set; }
    public int TenantId { get; set; }
    public string TenantFirstName { get; set; } = string.Empty;
    public string TenantLastName { get; set; } = string.Empty;
    public int UnitId { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public string PropertyName { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int PeriodMonth { get; set; }
    public int PeriodYear { get; set; }
    public decimal LateFee { get; set; }
    public string? Notes { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
