using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Auth;

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
