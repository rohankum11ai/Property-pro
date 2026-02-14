namespace PropertyPro.API.DTOs.Auth;

public class AuthResponse
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public string? FirstName { get; set; }
    public string? AvatarUrl { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool NeedsRoleSelection { get; set; }

    public static AuthResponse Ok(string token, string refreshToken, List<string> roles,
        string firstName, string? avatarUrl, bool needsRoleSelection = false) => new()
    {
        Success = true,
        Token = token,
        RefreshToken = refreshToken,
        Roles = roles,
        FirstName = firstName,
        AvatarUrl = avatarUrl,
        NeedsRoleSelection = needsRoleSelection
    };

    public static AuthResponse Fail(string error) => new()
    {
        Success = false,
        Error = error
    };
}
