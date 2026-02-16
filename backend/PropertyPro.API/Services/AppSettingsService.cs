using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Settings;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class AppSettingsService : IAppSettingsService
{
    private readonly AppDbContext _db;

    public AppSettingsService(AppDbContext db) => _db = db;

    public async Task<List<AppSettingDto>> GetAllAsync()
    {
        return await _db.AppSettings
            .OrderBy(s => s.Key)
            .Select(s => new AppSettingDto
            {
                Key = s.Key,
                Value = s.Value,
                Description = s.Description,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<AppSettingDto?> GetAsync(string key)
    {
        var s = await _db.AppSettings.FindAsync(key);
        if (s == null) return null;
        return new AppSettingDto { Key = s.Key, Value = s.Value, Description = s.Description, UpdatedAt = s.UpdatedAt };
    }

    public async Task<AppSettingDto> UpsertAsync(string key, string value)
    {
        var existing = await _db.AppSettings.FindAsync(key);
        if (existing != null)
        {
            existing.Value = value;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new AppSetting { Key = key, Value = value, UpdatedAt = DateTime.UtcNow };
            _db.AppSettings.Add(existing);
        }
        await _db.SaveChangesAsync();
        return new AppSettingDto { Key = existing.Key, Value = existing.Value, Description = existing.Description, UpdatedAt = existing.UpdatedAt };
    }

    public async Task<int> GetIntAsync(string key, int defaultValue = 0)
    {
        var s = await _db.AppSettings.FindAsync(key);
        return s != null && int.TryParse(s.Value, out var v) ? v : defaultValue;
    }
}
