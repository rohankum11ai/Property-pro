namespace PropertyPro.API.DTOs.Leases;

public class LeaseActivityDto
{
    public int LeaseActivityId { get; set; }
    public string OldStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}
