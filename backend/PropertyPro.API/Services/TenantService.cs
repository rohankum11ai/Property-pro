using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Tenants;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class TenantService : ITenantService
{
    private readonly AppDbContext _db;

    public TenantService(AppDbContext db) => _db = db;

    public async Task<List<TenantDto>> GetTenantsAsync(int landlordId, string? search)
    {
        var query = _db.Tenants
            .Where(t => t.LandlordId == landlordId)
            .Include(t => t.Unit)
                .ThenInclude(u => u!.Property)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t =>
                t.FirstName.ToLower().Contains(term) ||
                t.LastName.ToLower().Contains(term) ||
                t.Email.ToLower().Contains(term) ||
                t.Phone.Contains(term));
        }

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToTenantDto(t))
            .ToListAsync();
    }

    public async Task<TenantDto?> GetTenantAsync(int tenantId, int landlordId)
    {
        var t = await _db.Tenants
            .Include(t => t.Unit)
                .ThenInclude(u => u!.Property)
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.LandlordId == landlordId);
        return t == null ? null : ToTenantDto(t);
    }

    public async Task<TenantDto> CreateTenantAsync(int landlordId, CreateTenantRequest request)
    {
        if (request.UnitId.HasValue)
        {
            var unitOwned = await _db.Units
                .AnyAsync(u => u.UnitId == request.UnitId.Value && u.Property.LandlordId == landlordId);
            if (!unitOwned) throw new InvalidOperationException("Unit not found or not owned by you.");
        }

        var tenant = new Tenant
        {
            LandlordId = landlordId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            EmergencyContact = request.EmergencyContact,
            EmergencyPhone = request.EmergencyPhone,
            Notes = request.Notes,
            UnitId = request.UnitId
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        // Mark unit as Occupied if assigned
        if (tenant.UnitId.HasValue)
        {
            var unit = await _db.Units.FindAsync(tenant.UnitId.Value);
            if (unit != null) { unit.Status = "Occupied"; await _db.SaveChangesAsync(); }
        }

        await _db.Entry(tenant).Reference(t => t.Unit).LoadAsync();
        if (tenant.Unit != null) await _db.Entry(tenant.Unit).Reference(u => u.Property).LoadAsync();
        return ToTenantDto(tenant);
    }

    public async Task<TenantDto?> UpdateTenantAsync(int tenantId, int landlordId, UpdateTenantRequest request)
    {
        var tenant = await _db.Tenants
            .Include(t => t.Unit)
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.LandlordId == landlordId);
        if (tenant == null) return null;

        if (request.UnitId.HasValue && request.UnitId != tenant.UnitId)
        {
            var unitOwned = await _db.Units
                .AnyAsync(u => u.UnitId == request.UnitId.Value && u.Property.LandlordId == landlordId);
            if (!unitOwned) throw new InvalidOperationException("Unit not found or not owned by you.");
        }

        // Free old unit
        if (tenant.UnitId.HasValue && tenant.UnitId != request.UnitId)
        {
            var oldUnit = await _db.Units.FindAsync(tenant.UnitId.Value);
            if (oldUnit != null) { oldUnit.Status = "Available"; }
        }

        tenant.FirstName = request.FirstName;
        tenant.LastName = request.LastName;
        tenant.Email = request.Email;
        tenant.Phone = request.Phone;
        tenant.EmergencyContact = request.EmergencyContact;
        tenant.EmergencyPhone = request.EmergencyPhone;
        tenant.Notes = request.Notes;
        tenant.UnitId = request.UnitId;

        // Mark new unit as Occupied
        if (tenant.UnitId.HasValue)
        {
            var newUnit = await _db.Units.FindAsync(tenant.UnitId.Value);
            if (newUnit != null) { newUnit.Status = "Occupied"; }
        }

        await _db.SaveChangesAsync();

        await _db.Entry(tenant).Reference(t => t.Unit).LoadAsync();
        if (tenant.Unit != null) await _db.Entry(tenant.Unit).Reference(u => u.Property).LoadAsync();
        return ToTenantDto(tenant);
    }

    public async Task<bool> DeleteTenantAsync(int tenantId, int landlordId)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.LandlordId == landlordId);
        if (tenant == null) return false;

        // Free the unit
        if (tenant.UnitId.HasValue)
        {
            var unit = await _db.Units.FindAsync(tenant.UnitId.Value);
            if (unit != null) { unit.Status = "Available"; }
        }

        _db.Tenants.Remove(tenant);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TenantDto ToTenantDto(Tenant t) => new()
    {
        TenantId = t.TenantId,
        FirstName = t.FirstName,
        LastName = t.LastName,
        Email = t.Email,
        Phone = t.Phone,
        EmergencyContact = t.EmergencyContact,
        EmergencyPhone = t.EmergencyPhone,
        Notes = t.Notes,
        UnitId = t.UnitId,
        UnitNumber = t.Unit?.UnitNumber,
        PropertyId = t.Unit?.PropertyId,
        PropertyName = t.Unit?.Property?.Name,
        CreatedAt = t.CreatedAt
    };
}
