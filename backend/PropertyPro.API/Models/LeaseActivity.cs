namespace PropertyPro.API.Models;

public class LeaseActivity
{
    public int LeaseActivityId { get; set; }
    public int LeaseId { get; set; }
    public Lease Lease { get; set; } = null!;
    public string OldStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public int ChangedByUserId { get; set; }
    public User ChangedBy { get; set; } = null!;
}
