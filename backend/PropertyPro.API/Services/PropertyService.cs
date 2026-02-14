using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Properties;
using PropertyPro.API.DTOs.Units;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class PropertyService : IPropertyService
{
    private readonly AppDbContext _db;

    private static readonly HashSet<string> MultiUnitTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Rental Apartment", "Multiplex", "Room Rental"
    };

    public PropertyService(AppDbContext db) => _db = db;

    // ── Properties ────────────────────────────────────────────────────────────

    public async Task<List<PropertyDto>> GetPropertiesAsync(int landlordId)
    {
        return await _db.Properties
            .Where(p => p.LandlordId == landlordId)
            .Include(p => p.Units)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToPropertyDto(p))
            .ToListAsync();
    }

    public async Task<PropertyDto?> GetPropertyAsync(int propertyId, int landlordId)
    {
        var p = await _db.Properties
            .Include(p => p.Units)
            .FirstOrDefaultAsync(p => p.PropertyId == propertyId && p.LandlordId == landlordId);
        return p == null ? null : ToPropertyDto(p);
    }

    public async Task<PropertyDto> CreatePropertyAsync(int landlordId, CreatePropertyRequest request)
    {
        var property = new Property
        {
            LandlordId = landlordId,
            Name = request.Name,
            Address = request.Address,
            City = request.City,
            Province = request.Province,
            PostalCode = request.PostalCode,
            PropertyType = request.PropertyType
        };
        _db.Properties.Add(property);
        await _db.SaveChangesAsync();

        // Auto-create a default unit for single-unit property types
        if (!MultiUnitTypes.Contains(property.PropertyType))
        {
            var defaultUnit = new Unit
            {
                PropertyId = property.PropertyId,
                UnitNumber = "Main",
                Bedrooms = 0,
                Bathrooms = 0,
                RentAmount = 0,
                Status = "Available"
            };
            _db.Units.Add(defaultUnit);
            await _db.SaveChangesAsync();
            property.Units = new List<Unit> { defaultUnit };
        }

        return ToPropertyDto(property);
    }

    public async Task<PropertyDto?> UpdatePropertyAsync(int propertyId, int landlordId, UpdatePropertyRequest request)
    {
        var property = await _db.Properties
            .Include(p => p.Units)
            .FirstOrDefaultAsync(p => p.PropertyId == propertyId && p.LandlordId == landlordId);
        if (property == null) return null;

        property.Name = request.Name;
        property.Address = request.Address;
        property.City = request.City;
        property.Province = request.Province;
        property.PostalCode = request.PostalCode;
        property.PropertyType = request.PropertyType;
        await _db.SaveChangesAsync();
        return ToPropertyDto(property);
    }

    public async Task<bool> DeletePropertyAsync(int propertyId, int landlordId)
    {
        var property = await _db.Properties
            .FirstOrDefaultAsync(p => p.PropertyId == propertyId && p.LandlordId == landlordId);
        if (property == null) return false;
        _db.Properties.Remove(property);
        await _db.SaveChangesAsync();
        return true;
    }

    // ── Units ─────────────────────────────────────────────────────────────────

    public async Task<List<UnitDto>> GetUnitsAsync(int propertyId, int landlordId)
    {
        var propertyExists = await _db.Properties
            .AnyAsync(p => p.PropertyId == propertyId && p.LandlordId == landlordId);
        if (!propertyExists) return new List<UnitDto>();

        return await _db.Units
            .Where(u => u.PropertyId == propertyId)
            .Include(u => u.Property)
            .OrderBy(u => u.UnitNumber)
            .Select(u => ToUnitDto(u))
            .ToListAsync();
    }

    public async Task<UnitDto?> GetUnitAsync(int unitId, int landlordId)
    {
        var unit = await _db.Units
            .Include(u => u.Property)
            .FirstOrDefaultAsync(u => u.UnitId == unitId && u.Property.LandlordId == landlordId);
        return unit == null ? null : ToUnitDto(unit);
    }

    public async Task<UnitDto> CreateUnitAsync(int propertyId, int landlordId, CreateUnitRequest request)
    {
        var unit = new Unit
        {
            PropertyId = propertyId,
            UnitNumber = request.UnitNumber,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            RentAmount = request.RentAmount,
            SquareFeet = request.SquareFeet,
            Status = "Available"
        };
        _db.Units.Add(unit);
        await _db.SaveChangesAsync();
        await _db.Entry(unit).Reference(u => u.Property).LoadAsync();
        return ToUnitDto(unit);
    }

    public async Task<UnitDto?> UpdateUnitAsync(int unitId, int landlordId, UpdateUnitRequest request)
    {
        var unit = await _db.Units
            .Include(u => u.Property)
            .FirstOrDefaultAsync(u => u.UnitId == unitId && u.Property.LandlordId == landlordId);
        if (unit == null) return null;

        unit.UnitNumber = request.UnitNumber;
        unit.Bedrooms = request.Bedrooms;
        unit.Bathrooms = request.Bathrooms;
        unit.RentAmount = request.RentAmount;
        unit.SquareFeet = request.SquareFeet;
        unit.Status = request.Status;
        await _db.SaveChangesAsync();
        return ToUnitDto(unit);
    }

    public async Task<bool> DeleteUnitAsync(int unitId, int landlordId)
    {
        var unit = await _db.Units
            .Include(u => u.Property)
            .FirstOrDefaultAsync(u => u.UnitId == unitId && u.Property.LandlordId == landlordId);
        if (unit == null) return false;
        _db.Units.Remove(unit);
        await _db.SaveChangesAsync();
        return true;
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static PropertyDto ToPropertyDto(Property p) => new()
    {
        PropertyId = p.PropertyId,
        Name = p.Name,
        Address = p.Address,
        City = p.City,
        Province = p.Province,
        PostalCode = p.PostalCode,
        PropertyType = p.PropertyType,
        CreatedAt = p.CreatedAt,
        TotalUnits = p.Units.Count,
        AvailableUnits = p.Units.Count(u => u.Status == "Available"),
        OccupiedUnits = p.Units.Count(u => u.Status == "Occupied")
    };

    private static UnitDto ToUnitDto(Unit u) => new()
    {
        UnitId = u.UnitId,
        PropertyId = u.PropertyId,
        PropertyName = u.Property?.Name ?? string.Empty,
        UnitNumber = u.UnitNumber,
        Bedrooms = u.Bedrooms,
        Bathrooms = u.Bathrooms,
        RentAmount = u.RentAmount,
        SquareFeet = u.SquareFeet,
        Status = u.Status,
        CreatedAt = u.CreatedAt
    };
}
