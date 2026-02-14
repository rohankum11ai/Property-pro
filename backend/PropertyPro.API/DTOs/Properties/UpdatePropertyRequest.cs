using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Properties;

public class UpdatePropertyRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string Address { get; set; } = string.Empty;
    [Required] public string City { get; set; } = string.Empty;
    [Required] public string Province { get; set; } = string.Empty;
    [Required] public string PostalCode { get; set; } = string.Empty;
    [Required] public string PropertyType { get; set; } = string.Empty;
}
