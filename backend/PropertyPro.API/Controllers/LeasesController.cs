using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.DTOs.Leases;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/leases")]
[Authorize(Roles = "Landlord,Admin")]
public class LeasesController : ControllerBase
{
    private readonly ILeaseService _leaseService;
    private readonly IPaymentService _paymentService;

    public LeasesController(ILeaseService leaseService, IPaymentService paymentService)
    {
        _leaseService = leaseService;
        _paymentService = paymentService;
    }

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetLeases(
        [FromQuery] string? search, [FromQuery] string? status) =>
        Ok(await _leaseService.GetLeasesAsync(LandlordId, search, status));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLease(int id)
    {
        var result = await _leaseService.GetLeaseAsync(id, LandlordId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLease(CreateLeaseRequest request)
    {
        var result = await _leaseService.CreateLeaseAsync(LandlordId, request);
        return CreatedAtAction(nameof(GetLease), new { id = result.LeaseId }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLease(int id, UpdateLeaseRequest request)
    {
        var result = await _leaseService.UpdateLeaseAsync(id, LandlordId, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLease(int id)
    {
        var deleted = await _leaseService.DeleteLeaseAsync(id, LandlordId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, ChangeLeaseStatusRequest request)
    {
        try
        {
            var result = await _leaseService.ChangeLeaseStatusAsync(id, LandlordId, request.Status);
            return result == null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/payments")]
    public async Task<IActionResult> GetLeasePayments(int id) =>
        Ok(await _paymentService.GetPaymentsByLeaseAsync(id, LandlordId));
}
