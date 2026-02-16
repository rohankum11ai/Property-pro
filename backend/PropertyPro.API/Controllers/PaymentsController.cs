using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.DTOs.Payments;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "Landlord,Admin")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService) =>
        _paymentService = paymentService;

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetPayments(
        [FromQuery] int? leaseId,
        [FromQuery] string? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to) =>
        Ok(await _paymentService.GetPaymentsAsync(LandlordId, leaseId, status, from, to));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(int id)
    {
        var result = await _paymentService.GetPaymentAsync(id, LandlordId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePayment(CreatePaymentRequest request)
    {
        var result = await _paymentService.CreatePaymentAsync(LandlordId, request);
        return CreatedAtAction(nameof(GetPayment), new { id = result.PaymentId }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, UpdatePaymentRequest request)
    {
        var result = await _paymentService.UpdatePaymentAsync(id, LandlordId, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var deleted = await _paymentService.DeletePaymentAsync(id, LandlordId);
        return deleted ? NoContent() : NotFound();
    }
}
