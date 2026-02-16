using Microsoft.EntityFrameworkCore;
using PropertyPro.API.Models;

namespace PropertyPro.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserExternalLogin> UserExternalLogins => Set<UserExternalLogin>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Lease> Leases => Set<Lease>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<TenantDocument> TenantDocuments => Set<TenantDocument>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<LeaseActivity> LeaseActivities => Set<LeaseActivity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.UserId);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(100);
            e.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
            e.Property(u => u.LastName).IsRequired().HasMaxLength(50);
            e.Property(u => u.AvatarUrl).HasMaxLength(500);
            e.Property(u => u.PasswordHash).HasMaxLength(255);
        });

        // Role
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(r => r.RoleId);
            e.Property(r => r.RoleName).IsRequired().HasMaxLength(20);
        });

        // UserRole (composite PK)
        modelBuilder.Entity<UserRole>(e =>
        {
            e.HasKey(ur => new { ur.UserId, ur.RoleId });
            e.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
            e.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
        });

        // UserExternalLogin
        modelBuilder.Entity<UserExternalLogin>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.Provider, x.ProviderUserId }).IsUnique();
            e.Property(x => x.Provider).IsRequired().HasMaxLength(20);
            e.Property(x => x.ProviderUserId).IsRequired().HasMaxLength(100);
            e.HasOne(x => x.User).WithMany(u => u.ExternalLogins).HasForeignKey(x => x.UserId);
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Token).IsRequired().HasMaxLength(500);
            e.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.UserId);
        });

        // Property
        modelBuilder.Entity<Property>(e =>
        {
            e.HasKey(p => p.PropertyId);
            e.Property(p => p.Name).IsRequired().HasMaxLength(100);
            e.Property(p => p.Address).IsRequired().HasMaxLength(255);
            e.Property(p => p.City).IsRequired().HasMaxLength(100);
            e.Property(p => p.Province).IsRequired().HasMaxLength(50);
            e.Property(p => p.PostalCode).IsRequired().HasMaxLength(10);
            e.Property(p => p.PropertyType).IsRequired().HasMaxLength(50);
            e.HasOne(p => p.Landlord).WithMany().HasForeignKey(p => p.LandlordId).OnDelete(DeleteBehavior.Restrict);
        });

        // Unit
        modelBuilder.Entity<Unit>(e =>
        {
            e.HasKey(u => u.UnitId);
            e.Property(u => u.UnitNumber).IsRequired().HasMaxLength(20);
            e.Property(u => u.Status).IsRequired().HasMaxLength(20);
            e.Property(u => u.RentAmount).HasColumnType("decimal(10,2)");
            e.Property(u => u.Bathrooms).HasColumnType("decimal(3,1)");
            e.HasOne(u => u.Property).WithMany(p => p.Units).HasForeignKey(u => u.PropertyId).OnDelete(DeleteBehavior.Cascade);
        });

        // Tenant
        modelBuilder.Entity<Tenant>(e =>
        {
            e.HasKey(t => t.TenantId);
            e.Property(t => t.FirstName).IsRequired().HasMaxLength(50);
            e.Property(t => t.LastName).IsRequired().HasMaxLength(50);
            e.Property(t => t.Email).IsRequired().HasMaxLength(100);
            e.Property(t => t.Phone).IsRequired().HasMaxLength(20);
            e.Property(t => t.EmergencyContact).HasMaxLength(100);
            e.Property(t => t.EmergencyPhone).HasMaxLength(20);
            e.Property(t => t.Notes).HasMaxLength(500);
            e.HasOne(t => t.Landlord).WithMany().HasForeignKey(t => t.LandlordId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Unit).WithMany().HasForeignKey(t => t.UnitId).OnDelete(DeleteBehavior.SetNull);
        });

        // Lease
        modelBuilder.Entity<Lease>(e =>
        {
            e.HasKey(l => l.LeaseId);
            e.Property(l => l.MonthlyRent).HasColumnType("decimal(10,2)");
            e.Property(l => l.SecurityDeposit).HasColumnType("decimal(10,2)");
            e.Property(l => l.PaymentFrequency).IsRequired().HasMaxLength(20);
            e.Property(l => l.Status).IsRequired().HasMaxLength(20);
            e.Property(l => l.Notes).HasMaxLength(1000);
            e.HasOne(l => l.Landlord).WithMany().HasForeignKey(l => l.LandlordId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.Tenant).WithMany().HasForeignKey(l => l.TenantId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.Unit).WithMany().HasForeignKey(l => l.UnitId).OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(p => p.PaymentId);
            e.Property(p => p.AmountPaid).HasColumnType("decimal(10,2)");
            e.Property(p => p.LateFee).HasColumnType("decimal(10,2)");
            e.Property(p => p.PaymentMethod).IsRequired().HasMaxLength(30);
            e.Property(p => p.Status).IsRequired().HasMaxLength(20);
            e.Property(p => p.ReceiptNumber).IsRequired().HasMaxLength(30);
            e.Property(p => p.Notes).HasMaxLength(500);
            e.HasOne(p => p.Lease).WithMany(l => l.Payments).HasForeignKey(p => p.LeaseId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Landlord).WithMany().HasForeignKey(p => p.LandlordId).OnDelete(DeleteBehavior.Restrict);
        });

        // TenantDocument
        modelBuilder.Entity<TenantDocument>(e =>
        {
            e.HasKey(d => d.TenantDocumentId);
            e.Property(d => d.FileName).IsRequired().HasMaxLength(255);
            e.Property(d => d.StoredFileName).IsRequired().HasMaxLength(300);
            e.Property(d => d.Category).IsRequired().HasMaxLength(50);
            e.Property(d => d.ContentType).IsRequired().HasMaxLength(100);
            e.HasOne(d => d.Tenant).WithMany().HasForeignKey(d => d.TenantId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(d => d.Landlord).WithMany().HasForeignKey(d => d.LandlordId).OnDelete(DeleteBehavior.Restrict);
        });

        // AppSetting
        modelBuilder.Entity<AppSetting>(e =>
        {
            e.HasKey(s => s.Key);
            e.Property(s => s.Key).IsRequired().HasMaxLength(100);
            e.Property(s => s.Value).IsRequired().HasMaxLength(500);
            e.Property(s => s.Description).HasMaxLength(255);
        });

        // LeaseActivity
        modelBuilder.Entity<LeaseActivity>(e =>
        {
            e.HasKey(a => a.LeaseActivityId);
            e.Property(a => a.OldStatus).IsRequired().HasMaxLength(30);
            e.Property(a => a.NewStatus).IsRequired().HasMaxLength(30);
            e.HasOne(a => a.Lease).WithMany(l => l.Activities).HasForeignKey(a => a.LeaseId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.ChangedBy).WithMany().HasForeignKey(a => a.ChangedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // PropertyImage
        modelBuilder.Entity<PropertyImage>(e =>
        {
            e.HasKey(i => i.PropertyImageId);
            e.Property(i => i.FileName).IsRequired().HasMaxLength(255);
            e.Property(i => i.StoredFileName).IsRequired().HasMaxLength(300);
            e.Property(i => i.ContentType).IsRequired().HasMaxLength(100);
            e.HasOne(i => i.Property).WithMany(p => p.Images).HasForeignKey(i => i.PropertyId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Unit).WithMany(u => u.Images).HasForeignKey(i => i.UnitId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Landlord).WithMany().HasForeignKey(i => i.LandlordId).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin" },
            new Role { RoleId = 2, RoleName = "Landlord" },
            new Role { RoleId = 3, RoleName = "Tenant" }
        );

        // Seed App Settings
        var seedDate = new DateTime(2026, 2, 14, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<AppSetting>().HasData(
            new AppSetting { Key = "MaxImagesPerProperty", Value = "10", Description = "Maximum images allowed per property", UpdatedAt = seedDate },
            new AppSetting { Key = "MaxImagesPerUnit", Value = "5", Description = "Maximum images allowed per unit", UpdatedAt = seedDate },
            new AppSetting { Key = "MaxImageSizeMB", Value = "10", Description = "Maximum image file size in megabytes", UpdatedAt = seedDate }
        );
    }
}
