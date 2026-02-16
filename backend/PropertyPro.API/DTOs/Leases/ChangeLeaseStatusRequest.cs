using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Leases;

public class ChangeLeaseStatusRequest
{
    [Required] public string Status { get; set; } = string.Empty;
}
