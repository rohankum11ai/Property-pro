using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Auth;

public class AssignRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty; // Landlord | Tenant
}
