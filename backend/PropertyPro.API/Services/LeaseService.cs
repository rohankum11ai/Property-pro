using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Leases;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class LeaseService : ILeaseService
{
    private readonly AppDbContext _db;

    private static readonly Dictionary<string, HashSet<string>> _allowedTransitions = new()
    {
        ["Pending"] = new() { "Active" },
        ["Active"] = new() { "Terminated" },
        ["Month-to-Month"] = new() { "Terminated" },
        ["Terminated"] = new() { "Active", "Pending" },
    };

    public LeaseService(AppDbContext db) => _db = db;

    public async Task<List<LeaseDto>> GetLeasesAsync(int landlordId, string? search, string? status)
    {
        var query = _db.Leases
            .Where(l => l.LandlordId == landlordId)
            .Include(l => l.Tenant)
            .Include(l => l.Unit)
                .ThenInclude(u => u.Property)
            .Include(l => l.Activities)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "Month-to-Month")
                query = query.Where(l => l.Status == "Active" && l.EndDate < DateTime.UtcNow);
            else if (status == "Active")
                query = query.Where(l => l.Status == "Active" && l.EndDate >= DateTime.UtcNow);
            else
                query = query.Where(l => l.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(l =>
                l.Tenant.FirstName.ToLower().Contains(term) ||
                l.Tenant.LastName.ToLower().Contains(term) ||
                l.Unit.UnitNumber.ToLower().Contains(term) ||
                l.Unit.Property.Name.ToLower().Contains(term));
        }

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => ToLeaseDto(l))
            .ToListAsync();
    }

    public async Task<LeaseDto?> GetLeaseAsync(int leaseId, int landlordId)
    {
        var l = await _db.Leases
            .Include(l => l.Tenant)
            .Include(l => l.Unit).ThenInclude(u => u.Property)
            .Include(l => l.Activities)
            .FirstOrDefaultAsync(l => l.LeaseId == leaseId && l.LandlordId == landlordId);
        return l == null ? null : ToLeaseDto(l);
    }

    public async Task<LeaseDto> CreateLeaseAsync(int landlordId, CreateLeaseRequest request)
    {
        var tenantOwned = await _db.Tenants
            .AnyAsync(t => t.TenantId == request.TenantId && t.LandlordId == landlordId);
        if (!tenantOwned) throw new InvalidOperationException("Tenant not found or not owned by you.");

        var unitOwned = await _db.Units
            .AnyAsync(u => u.UnitId == request.UnitId && u.Property.LandlordId == landlordId);
        if (!unitOwned) throw new InvalidOperationException("Unit not found or not owned by you.");

        var lease = new Lease
        {
            LandlordId = landlordId,
            TenantId = request.TenantId,
            UnitId = request.UnitId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MonthlyRent = request.MonthlyRent,
            SecurityDeposit = request.SecurityDeposit,
            PaymentFrequency = request.PaymentFrequency,
            Status = "Pending",
            Notes = request.Notes,
        };

        _db.Leases.Add(lease);

        _db.LeaseActivities.Add(new LeaseActivity
        {
            Lease = lease,
            OldStatus = "—",
            NewStatus = "Pending",
            ChangedByUserId = landlordId,
        });

        await _db.SaveChangesAsync();

        await _db.Entry(lease).Reference(l => l.Tenant).LoadAsync();
        await _db.Entry(lease).Reference(l => l.Unit).LoadAsync();
        await _db.Entry(lease.Unit).Reference(u => u.Property).LoadAsync();
        await _db.Entry(lease).Collection(l => l.Activities).LoadAsync();
        return ToLeaseDto(lease);
    }

    public async Task<LeaseDto?> UpdateLeaseAsync(int leaseId, int landlordId, UpdateLeaseRequest request)
    {
        var lease = await _db.Leases
            .Include(l => l.Unit)
            .Include(l => l.Activities)
            .FirstOrDefaultAsync(l => l.LeaseId == leaseId && l.LandlordId == landlordId);
        if (lease == null) return null;

        var tenantOwned = await _db.Tenants
            .AnyAsync(t => t.TenantId == request.TenantId && t.LandlordId == landlordId);
        if (!tenantOwned) throw new InvalidOperationException("Tenant not found or not owned by you.");

        var unitOwned = await _db.Units
            .AnyAsync(u => u.UnitId == request.UnitId && u.Property.LandlordId == landlordId);
        if (!unitOwned) throw new InvalidOperationException("Unit not found or not owned by you.");

        var oldTenantId = lease.TenantId;
        var oldUnitId = lease.UnitId;
        var isActive = lease.Status == "Active";

        // If unit changed while lease is Active, handle unit/tenant reassignment
        if (isActive && oldUnitId != request.UnitId)
        {
            var hasActiveLease = await _db.Leases
                .AnyAsync(l => l.UnitId == request.UnitId && l.Status == "Active" && l.LeaseId != leaseId);
            if (hasActiveLease)
                throw new InvalidOperationException("The new unit already has an active lease.");

            var noOtherActive = !await _db.Leases
                .AnyAsync(l => l.UnitId == oldUnitId && l.Status == "Active" && l.LeaseId != leaseId);
            if (noOtherActive)
            {
                var oldUnit = await _db.Units.FindAsync(oldUnitId);
                if (oldUnit != null) oldUnit.Status = "Available";
            }

            var oldTenant = await _db.Tenants.FindAsync(oldTenantId);
            if (oldTenant != null && oldTenant.UnitId == oldUnitId) oldTenant.UnitId = null;

            var newUnit = await _db.Units.FindAsync(request.UnitId);
            if (newUnit != null) newUnit.Status = "Occupied";

            var tenant = await _db.Tenants.FindAsync(request.TenantId);
            if (tenant != null) tenant.UnitId = request.UnitId;
        }
        else if (isActive && oldTenantId != request.TenantId)
        {
            var oldTenant = await _db.Tenants.FindAsync(oldTenantId);
            if (oldTenant != null && oldTenant.UnitId == oldUnitId) oldTenant.UnitId = null;

            var newTenant = await _db.Tenants.FindAsync(request.TenantId);
            if (newTenant != null) newTenant.UnitId = lease.UnitId;
        }

        lease.TenantId = request.TenantId;
        lease.UnitId = request.UnitId;
        lease.StartDate = request.StartDate;
        lease.EndDate = request.EndDate;
        lease.MonthlyRent = request.MonthlyRent;
        lease.SecurityDeposit = request.SecurityDeposit;
        lease.PaymentFrequency = request.PaymentFrequency;
        lease.Notes = request.Notes;

        await _db.SaveChangesAsync();

        await _db.Entry(lease).Reference(l => l.Tenant).LoadAsync();
        await _db.Entry(lease).Reference(l => l.Unit).LoadAsync();
        await _db.Entry(lease.Unit).Reference(u => u.Property).LoadAsync();
        return ToLeaseDto(lease);
    }

    public async Task<bool> DeleteLeaseAsync(int leaseId, int landlordId)
    {
        var lease = await _db.Leases
            .FirstOrDefaultAsync(l => l.LeaseId == leaseId && l.LandlordId == landlordId);
        if (lease == null) return false;

        if (lease.Status == "Active")
        {
            var noOtherActive = !await _db.Leases
                .AnyAsync(l => l.UnitId == lease.UnitId && l.Status == "Active" && l.LeaseId != leaseId);
            if (noOtherActive)
            {
                var unit = await _db.Units.FindAsync(lease.UnitId);
                if (unit != null) unit.Status = "Available";
            }

            var tenant = await _db.Tenants.FindAsync(lease.TenantId);
            if (tenant != null && tenant.UnitId == lease.UnitId) tenant.UnitId = null;
        }

        _db.Leases.Remove(lease);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<LeaseDto?> ChangeLeaseStatusAsync(int leaseId, int landlordId, string newStatus)
    {
        var lease = await _db.Leases
            .Include(l => l.Tenant)
            .Include(l => l.Unit).ThenInclude(u => u.Property)
            .Include(l => l.Activities)
            .FirstOrDefaultAsync(l => l.LeaseId == leaseId && l.LandlordId == landlordId);
        if (lease == null) return null;

        var effectiveStatus = GetEffectiveStatus(lease);

        if (!_allowedTransitions.TryGetValue(effectiveStatus, out var allowed) || !allowed.Contains(newStatus))
            throw new InvalidOperationException($"Cannot change status from '{effectiveStatus}' to '{newStatus}'.");

        var oldEffective = effectiveStatus;

        if (newStatus == "Active")
        {
            var hasActiveLease = await _db.Leases
                .AnyAsync(l => l.UnitId == lease.UnitId && l.Status == "Active" && l.LeaseId != leaseId);
            if (hasActiveLease)
                throw new InvalidOperationException("This unit already has an active lease.");

            lease.Status = "Active";

            var unit = await _db.Units.FindAsync(lease.UnitId);
            if (unit != null) unit.Status = "Occupied";

            var tenant = await _db.Tenants.FindAsync(lease.TenantId);
            if (tenant != null) tenant.UnitId = lease.UnitId;
        }
        else if (newStatus == "Terminated")
        {
            lease.Status = "Terminated";

            var noOtherActive = !await _db.Leases
                .AnyAsync(l => l.UnitId == lease.UnitId && l.Status == "Active" && l.LeaseId != leaseId);
            if (noOtherActive)
            {
                var unit = await _db.Units.FindAsync(lease.UnitId);
                if (unit != null) unit.Status = "Available";
            }

            var tenant = await _db.Tenants.FindAsync(lease.TenantId);
            if (tenant != null && tenant.UnitId == lease.UnitId) tenant.UnitId = null;
        }
        else if (newStatus == "Pending")
        {
            lease.Status = "Pending";
        }

        _db.LeaseActivities.Add(new LeaseActivity
        {
            LeaseId = leaseId,
            OldStatus = oldEffective,
            NewStatus = newStatus,
            ChangedByUserId = landlordId,
        });

        await _db.SaveChangesAsync();
        return ToLeaseDto(lease);
    }

    private static string GetEffectiveStatus(Lease l)
    {
        if (l.Status == "Active" && l.EndDate < DateTime.UtcNow)
            return "Month-to-Month";
        return l.Status;
    }

    private static LeaseDto ToLeaseDto(Lease l) => new()
    {
        LeaseId = l.LeaseId,
        TenantId = l.TenantId,
        TenantFirstName = l.Tenant.FirstName,
        TenantLastName = l.Tenant.LastName,
        TenantEmail = l.Tenant.Email,
        UnitId = l.UnitId,
        UnitNumber = l.Unit.UnitNumber,
        PropertyId = l.Unit.PropertyId,
        PropertyName = l.Unit.Property.Name,
        StartDate = l.StartDate,
        EndDate = l.EndDate,
        MonthlyRent = l.MonthlyRent,
        SecurityDeposit = l.SecurityDeposit,
        PaymentFrequency = l.PaymentFrequency,
        Status = GetEffectiveStatus(l),
        Notes = l.Notes,
        CreatedAt = l.CreatedAt,
        Activities = l.Activities
            .OrderByDescending(a => a.ChangedAt)
            .Select(a => new LeaseActivityDto
            {
                LeaseActivityId = a.LeaseActivityId,
                OldStatus = a.OldStatus,
                NewStatus = a.NewStatus,
                ChangedAt = a.ChangedAt,
            })
            .ToList(),
    };
}
