using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Authorize(Roles = "Landlord,Admin")]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;

    public ImagesController(IImageService imageService) =>
        _imageService = imageService;

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Property Images ───────────────────────────────────────────────────────

    [HttpGet("api/properties/{propertyId}/images")]
    public async Task<IActionResult> GetPropertyImages(int propertyId) =>
        Ok(await _imageService.GetPropertyImagesAsync(propertyId, LandlordId));

    [HttpPost("api/properties/{propertyId}/images")]
    [RequestSizeLimit(15_728_640)] // 15 MB
    public async Task<IActionResult> UploadPropertyImage(int propertyId, IFormFile file)
    {
        try
        {
            var result = await _imageService.UploadPropertyImageAsync(propertyId, LandlordId, file);
            return CreatedAtAction(nameof(GetPropertyImages), new { propertyId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Unit Images ───────────────────────────────────────────────────────────

    [HttpGet("api/units/{unitId}/images")]
    public async Task<IActionResult> GetUnitImages(int unitId) =>
        Ok(await _imageService.GetUnitImagesAsync(unitId, LandlordId));

    [HttpPost("api/units/{unitId}/images")]
    [RequestSizeLimit(15_728_640)]
    public async Task<IActionResult> UploadUnitImage(int unitId, IFormFile file)
    {
        try
        {
            var result = await _imageService.UploadUnitImageAsync(unitId, LandlordId, file);
            return CreatedAtAction(nameof(GetUnitImages), new { unitId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Shared ────────────────────────────────────────────────────────────────

    [HttpGet("api/images/{imageId}")]
    public async Task<IActionResult> GetImage(int imageId)
    {
        var result = await _imageService.GetImageFileAsync(imageId, LandlordId);
        if (result == null) return NotFound();
        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    [HttpDelete("api/images/{imageId}")]
    public async Task<IActionResult> DeleteImage(int imageId)
    {
        var deleted = await _imageService.DeleteImageAsync(imageId, LandlordId);
        return deleted ? NoContent() : NotFound();
    }
}
