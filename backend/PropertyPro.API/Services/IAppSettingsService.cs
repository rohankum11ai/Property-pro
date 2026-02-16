using PropertyPro.API.DTOs.Settings;

namespace PropertyPro.API.Services;

public interface IAppSettingsService
{
    Task<List<AppSettingDto>> GetAllAsync();
    Task<AppSettingDto?> GetAsync(string key);
    Task<AppSettingDto> UpsertAsync(string key, string value);
    Task<int> GetIntAsync(string key, int defaultValue = 0);
}
