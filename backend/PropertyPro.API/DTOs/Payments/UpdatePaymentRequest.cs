using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Payments;

public class UpdatePaymentRequest
{
    [Required] public int LeaseId { get; set; }
    [Required] public decimal AmountPaid { get; set; }
    [Required] public DateTime PaymentDate { get; set; }
    [Required] public string PaymentMethod { get; set; } = "E-Transfer";
    [Required] public string Status { get; set; } = "Paid";
    [Required] public int PeriodMonth { get; set; }
    [Required] public int PeriodYear { get; set; }
    public decimal LateFee { get; set; }
    public string? Notes { get; set; }
}
