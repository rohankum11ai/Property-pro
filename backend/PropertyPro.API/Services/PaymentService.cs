using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Payments;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db) => _db = db;

    public async Task<List<PaymentDto>> GetPaymentsAsync(
        int landlordId, int? leaseId, string? status, DateTime? from, DateTime? to)
    {
        var query = _db.Payments
            .Where(p => p.LandlordId == landlordId)
            .Include(p => p.Lease)
                .ThenInclude(l => l.Tenant)
            .Include(p => p.Lease)
                .ThenInclude(l => l.Unit)
                    .ThenInclude(u => u.Property)
            .AsQueryable();

        if (leaseId.HasValue)
            query = query.Where(p => p.LeaseId == leaseId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(p => p.Status == status);
        if (from.HasValue)
            query = query.Where(p => p.PaymentDate >= from.Value);
        if (to.HasValue)
            query = query.Where(p => p.PaymentDate <= to.Value);

        return await query
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => ToPaymentDto(p))
            .ToListAsync();
    }

    public async Task<PaymentDto?> GetPaymentAsync(int paymentId, int landlordId)
    {
        var p = await _db.Payments
            .Include(p => p.Lease).ThenInclude(l => l.Tenant)
            .Include(p => p.Lease).ThenInclude(l => l.Unit).ThenInclude(u => u.Property)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId && p.LandlordId == landlordId);
        return p == null ? null : ToPaymentDto(p);
    }

    public async Task<PaymentDto> CreatePaymentAsync(int landlordId, CreatePaymentRequest request)
    {
        var lease = await _db.Leases
            .FirstOrDefaultAsync(l => l.LeaseId == request.LeaseId && l.LandlordId == landlordId);
        if (lease == null) throw new InvalidOperationException("Lease not found or not owned by you.");

        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var countToday = await _db.Payments
            .CountAsync(p => p.LandlordId == landlordId &&
                p.CreatedAt.Date == DateTime.UtcNow.Date);
        var receiptNumber = $"RCP-{today}-{(countToday + 1):D3}";

        var payment = new Payment
        {
            LeaseId = request.LeaseId,
            LandlordId = landlordId,
            AmountPaid = request.AmountPaid,
            PaymentDate = request.PaymentDate,
            PaymentMethod = request.PaymentMethod,
            Status = request.Status,
            PeriodMonth = request.PeriodMonth,
            PeriodYear = request.PeriodYear,
            LateFee = request.LateFee,
            Notes = request.Notes,
            ReceiptNumber = receiptNumber,
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _db.Entry(payment).Reference(p => p.Lease).LoadAsync();
        await _db.Entry(payment.Lease).Reference(l => l.Tenant).LoadAsync();
        await _db.Entry(payment.Lease).Reference(l => l.Unit).LoadAsync();
        await _db.Entry(payment.Lease.Unit).Reference(u => u.Property).LoadAsync();
        return ToPaymentDto(payment);
    }

    public async Task<PaymentDto?> UpdatePaymentAsync(int paymentId, int landlordId, UpdatePaymentRequest request)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId && p.LandlordId == landlordId);
        if (payment == null) return null;

        var leaseOwned = await _db.Leases
            .AnyAsync(l => l.LeaseId == request.LeaseId && l.LandlordId == landlordId);
        if (!leaseOwned) throw new InvalidOperationException("Lease not found or not owned by you.");

        payment.LeaseId = request.LeaseId;
        payment.AmountPaid = request.AmountPaid;
        payment.PaymentDate = request.PaymentDate;
        payment.PaymentMethod = request.PaymentMethod;
        payment.Status = request.Status;
        payment.PeriodMonth = request.PeriodMonth;
        payment.PeriodYear = request.PeriodYear;
        payment.LateFee = request.LateFee;
        payment.Notes = request.Notes;

        await _db.SaveChangesAsync();

        await _db.Entry(payment).Reference(p => p.Lease).LoadAsync();
        await _db.Entry(payment.Lease).Reference(l => l.Tenant).LoadAsync();
        await _db.Entry(payment.Lease).Reference(l => l.Unit).LoadAsync();
        await _db.Entry(payment.Lease.Unit).Reference(u => u.Property).LoadAsync();
        return ToPaymentDto(payment);
    }

    public async Task<bool> DeletePaymentAsync(int paymentId, int landlordId)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId && p.LandlordId == landlordId);
        if (payment == null) return false;
        _db.Payments.Remove(payment);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<PaymentDto>> GetPaymentsByLeaseAsync(int leaseId, int landlordId)
    {
        var leaseOwned = await _db.Leases
            .AnyAsync(l => l.LeaseId == leaseId && l.LandlordId == landlordId);
        if (!leaseOwned) return new List<PaymentDto>();

        return await _db.Payments
            .Where(p => p.LeaseId == leaseId && p.LandlordId == landlordId)
            .Include(p => p.Lease).ThenInclude(l => l.Tenant)
            .Include(p => p.Lease).ThenInclude(l => l.Unit).ThenInclude(u => u.Property)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => ToPaymentDto(p))
            .ToListAsync();
    }

    private static PaymentDto ToPaymentDto(Payment p) => new()
    {
        PaymentId = p.PaymentId,
        LeaseId = p.LeaseId,
        TenantId = p.Lease.TenantId,
        TenantFirstName = p.Lease.Tenant.FirstName,
        TenantLastName = p.Lease.Tenant.LastName,
        UnitId = p.Lease.UnitId,
        UnitNumber = p.Lease.Unit.UnitNumber,
        PropertyName = p.Lease.Unit.Property.Name,
        AmountPaid = p.AmountPaid,
        PaymentDate = p.PaymentDate,
        PaymentMethod = p.PaymentMethod,
        Status = p.Status,
        PeriodMonth = p.PeriodMonth,
        PeriodYear = p.PeriodYear,
        LateFee = p.LateFee,
        Notes = p.Notes,
        ReceiptNumber = p.ReceiptNumber,
        CreatedAt = p.CreatedAt,
    };
}
