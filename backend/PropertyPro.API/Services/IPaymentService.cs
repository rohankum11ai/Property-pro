using PropertyPro.API.DTOs.Payments;

namespace PropertyPro.API.Services;

public interface IPaymentService
{
    Task<List<PaymentDto>> GetPaymentsAsync(int landlordId, int? leaseId, string? status, DateTime? from, DateTime? to);
    Task<PaymentDto?> GetPaymentAsync(int paymentId, int landlordId);
    Task<PaymentDto> CreatePaymentAsync(int landlordId, CreatePaymentRequest request);
    Task<PaymentDto?> UpdatePaymentAsync(int paymentId, int landlordId, UpdatePaymentRequest request);
    Task<bool> DeletePaymentAsync(int paymentId, int landlordId);
    Task<List<PaymentDto>> GetPaymentsByLeaseAsync(int leaseId, int landlordId);
}
