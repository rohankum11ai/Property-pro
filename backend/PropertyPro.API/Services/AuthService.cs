using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Data;
using PropertyPro.API.DTOs.Auth;
using PropertyPro.API.Models;

namespace PropertyPro.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, ITokenService tokenService, IConfiguration config)
    {
        _db = db;
        _tokenService = tokenService;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return AuthResponse.Fail("Email already registered.");

        var validRoles = new[] { "Landlord", "Tenant" };
        if (!validRoles.Contains(request.Role))
            return AuthResponse.Fail("Invalid role. Must be Landlord or Tenant.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsEmailVerified = false
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await AssignRoleAsync(user.UserId, request.Role);
        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || user.PasswordHash == null)
            return AuthResponse.Fail("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return AuthResponse.Fail("Invalid email or password.");

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponse> GoogleLoginAsync(string idToken)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["Google:ClientId"] }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch
        {
            return AuthResponse.Fail("Invalid Google token.");
        }

        var user = await FindOrCreateGoogleUserAsync(payload);
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var roles = await GetUserRolesAsync(user.UserId);
        var needsRoleSelection = roles.Count == 0;

        return AuthResponse.Ok(
            _tokenService.GenerateJwtToken(user, roles),
            await CreateRefreshTokenAsync(user.UserId),
            roles,
            user.FirstName,
            user.AvatarUrl,
            needsRoleSelection
        );
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken && !r.IsRevoked);

        if (token == null || token.ExpiresAt < DateTime.UtcNow)
            return AuthResponse.Fail("Invalid or expired refresh token.");

        token.IsRevoked = true;
        await _db.SaveChangesAsync();

        return await IssueTokensAsync(token.User);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
        if (token != null)
        {
            token.IsRevoked = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task AssignRoleAsync(int userId, string roleName)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
        if (role == null) return;

        var alreadyAssigned = await _db.UserRoles
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.RoleId);
        if (alreadyAssigned) return;

        _db.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.RoleId });
        await _db.SaveChangesAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task<User> FindOrCreateGoogleUserAsync(GoogleJsonWebSignature.Payload payload)
    {
        var externalLogin = await _db.UserExternalLogins
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Provider == "Google" && x.ProviderUserId == payload.Subject);

        if (externalLogin != null) return externalLogin.User;

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
        if (existingUser != null)
        {
            _db.UserExternalLogins.Add(new UserExternalLogin
            {
                UserId = existingUser.UserId,
                Provider = "Google",
                ProviderUserId = payload.Subject
            });
            await _db.SaveChangesAsync();
            return existingUser;
        }

        var newUser = new User
        {
            Email = payload.Email,
            FirstName = payload.GivenName ?? string.Empty,
            LastName = payload.FamilyName ?? string.Empty,
            AvatarUrl = payload.Picture,
            IsEmailVerified = true
        };
        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        _db.UserExternalLogins.Add(new UserExternalLogin
        {
            UserId = newUser.UserId,
            Provider = "Google",
            ProviderUserId = payload.Subject
        });
        await _db.SaveChangesAsync();

        return newUser;
    }

    private async Task<AuthResponse> IssueTokensAsync(User user)
    {
        var roles = await GetUserRolesAsync(user.UserId);
        var jwt = _tokenService.GenerateJwtToken(user, roles);
        var refreshToken = await CreateRefreshTokenAsync(user.UserId);

        return AuthResponse.Ok(jwt, refreshToken, roles, user.FirstName, user.AvatarUrl);
    }

    private async Task<List<string>> GetUserRolesAsync(int userId) =>
        await _db.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role.RoleName)
            .ToListAsync();

    private async Task<string> CreateRefreshTokenAsync(int userId)
    {
        var token = _tokenService.GenerateRefreshToken(userId);
        _db.RefreshTokens.Add(token);
        await _db.SaveChangesAsync();
        return token.Token;
    }
}
