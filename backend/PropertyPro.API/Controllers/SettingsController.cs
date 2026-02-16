using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyPro.API.DTOs.Settings;
using PropertyPro.API.Services;

namespace PropertyPro.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "Landlord,Admin")]
public class SettingsController : ControllerBase
{
    private readonly IAppSettingsService _settingsService;

    public SettingsController(IAppSettingsService settingsService) =>
        _settingsService = settingsService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _settingsService.GetAllAsync());

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key)
    {
        var result = await _settingsService.GetAsync(key);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Update(string key, UpdateAppSettingRequest request) =>
        Ok(await _settingsService.UpsertAsync(key, request.Value));
}
