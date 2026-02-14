using System.ComponentModel.DataAnnotations;

namespace PropertyPro.API.DTOs.Units;

public class UpdateUnitRequest
{
    [Required] public string UnitNumber { get; set; } = string.Empty;
    [Range(0, 20)] public int Bedrooms { get; set; }
    [Range(0, 10)] public decimal Bathrooms { get; set; }
    [Range(0, 999999)] public decimal RentAmount { get; set; }
    public int? SquareFeet { get; set; }
    [Required] public string Status { get; set; } = string.Empty;
}
