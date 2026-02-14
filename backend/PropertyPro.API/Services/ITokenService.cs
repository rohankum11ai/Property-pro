using PropertyPro.API.Models;
using System.Security.Claims;

namespace PropertyPro.API.Services;

public interface ITokenService
{
    string GenerateJwtToken(User user, List<string> roles);
    RefreshToken GenerateRefreshToken(int userId);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
