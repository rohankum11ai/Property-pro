using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.DTOs.Properties;
using PropertyPro.API.DTOs.Units;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/properties")]
[Authorize(Roles = "Landlord,Admin")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;

    public PropertiesController(IPropertyService propertyService) =>
        _propertyService = propertyService;

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Properties ────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetProperties() =>
        Ok(await _propertyService.GetPropertiesAsync(LandlordId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProperty(int id)
    {
        var result = await _propertyService.GetPropertyAsync(id, LandlordId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProperty(CreatePropertyRequest request)
    {
        var result = await _propertyService.CreatePropertyAsync(LandlordId, request);
        return CreatedAtAction(nameof(GetProperty), new { id = result.PropertyId }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProperty(int id, UpdatePropertyRequest request)
    {
        var result = await _propertyService.UpdatePropertyAsync(id, LandlordId, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProperty(int id)
    {
        var deleted = await _propertyService.DeletePropertyAsync(id, LandlordId);
        return deleted ? NoContent() : NotFound();
    }

    // ── Units ─────────────────────────────────────────────────────────────────

    [HttpGet("{propertyId}/units")]
    public async Task<IActionResult> GetUnits(int propertyId) =>
        Ok(await _propertyService.GetUnitsAsync(propertyId, LandlordId));

    [HttpGet("{propertyId}/units/{unitId}")]
    public async Task<IActionResult> GetUnit(int propertyId, int unitId)
    {
        var result = await _propertyService.GetUnitAsync(unitId, LandlordId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost("{propertyId}/units")]
    public async Task<IActionResult> CreateUnit(int propertyId, CreateUnitRequest request)
    {
        var result = await _propertyService.CreateUnitAsync(propertyId, LandlordId, request);
        return CreatedAtAction(nameof(GetUnit),
            new { propertyId = result.PropertyId, unitId = result.UnitId }, result);
    }

    [HttpPut("{propertyId}/units/{unitId}")]
    public async Task<IActionResult> UpdateUnit(int propertyId, int unitId, UpdateUnitRequest request)
    {
        var result = await _propertyService.UpdateUnitAsync(unitId, LandlordId, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{propertyId}/units/{unitId}")]
    public async Task<IActionResult> DeleteUnit(int propertyId, int unitId)
    {
        var deleted = await _propertyService.DeleteUnitAsync(unitId, LandlordId);
        return deleted ? NoContent() : NotFound();
    }
}
