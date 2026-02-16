namespace PropertyPro.API.DTOs.Settings;

public class AppSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateAppSettingRequest
{
    public string Value { get; set; } = string.Empty;
}
