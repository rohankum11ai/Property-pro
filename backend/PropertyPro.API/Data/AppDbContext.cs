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

        // Seed Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin" },
            new Role { RoleId = 2, RoleName = "Landlord" },
            new Role { RoleId = 3, RoleName = "Tenant" }
        );
    }
}
