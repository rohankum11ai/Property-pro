using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.Services;
using System.Security.Claims;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/tenants/{tenantId}/documents")]
[Authorize(Roles = "Landlord,Admin")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService) =>
        _documentService = documentService;

    private int LandlordId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetDocuments(int tenantId) =>
        Ok(await _documentService.GetDocumentsAsync(tenantId, LandlordId));

    [HttpPost]
    [RequestSizeLimit(26_214_400)] // ~25 MB
    public async Task<IActionResult> UploadDocument(int tenantId, IFormFile file, [FromForm] string category)
    {
        try
        {
            var result = await _documentService.UploadDocumentAsync(tenantId, LandlordId, file, category);
            return CreatedAtAction(nameof(GetDocuments), new { tenantId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{documentId}/download")]
    public async Task<IActionResult> DownloadDocument(int tenantId, int documentId)
    {
        var result = await _documentService.GetDocumentFileAsync(documentId, LandlordId);
        if (result == null) return NotFound();

        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    [HttpDelete("{documentId}")]
    public async Task<IActionResult> DeleteDocument(int tenantId, int documentId)
    {
        var deleted = await _documentService.DeleteDocumentAsync(documentId, LandlordId);
        return deleted ? NoContent() : NotFound();
    }
}
