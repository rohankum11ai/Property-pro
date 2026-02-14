using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.DTOs.Tenants;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/tenants")]
[Authorize(Roles = "Landlord,Admin")]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService) =>
        _tenantService = tenantService;

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetTenants([FromQuery] string? search) =>
        Ok(await _tenantService.GetTenantsAsync(LandlordId, search));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTenant(int id)
    {
        var result = await _tenantService.GetTenantAsync(id, LandlordId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTenant(CreateTenantRequest request)
    {
        var result = await _tenantService.CreateTenantAsync(LandlordId, request);
        return CreatedAtAction(nameof(GetTenant), new { id = result.TenantId }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTenant(int id, UpdateTenantRequest request)
    {
        var result = await _tenantService.UpdateTenantAsync(id, LandlordId, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTenant(int id)
    {
        var deleted = await _tenantService.DeleteTenantAsync(id, LandlordId);
        return deleted ? NoContent() : NotFound();
    }
}
