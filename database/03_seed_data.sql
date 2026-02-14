-- ============================================================
-- PropertyPro Database
-- Script 03: Seed Data
-- ============================================================

USE PropertyProDB;
GO

-- ── Seed Roles ───────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleName = 'Admin')
    INSERT INTO Roles (RoleName) VALUES ('Admin');

IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleName = 'Landlord')
    INSERT INTO Roles (RoleName) VALUES ('Landlord');

IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleName = 'Tenant')
    INSERT INTO Roles (RoleName) VALUES ('Tenant');

PRINT 'Roles seeded.';
GO

-- ── Seed Admin User ──────────────────────────────────────────
-- Password: Admin@123  (BCrypt hash - change in production!)
DECLARE @AdminEmail NVARCHAR(100) = 'admin@propertypro.com';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @AdminEmail)
BEGIN
    DECLARE @AdminId INT;

    INSERT INTO Users (Email, PasswordHash, FirstName, LastName, IsEmailVerified)
    VALUES (
        @AdminEmail,
        '$2a$11$rTpMj1K3F1e1Cz9zZ1OmQuvFqKm8TZ5JH7j2gLp3k4mN8iVa9yWaO',
        'Admin',
        'User',
        1
    );

    SET @AdminId = SCOPE_IDENTITY();

    INSERT INTO UserRoles (UserId, RoleId)
    SELECT @AdminId, RoleId FROM Roles WHERE RoleName = 'Admin';

    PRINT 'Admin user seeded.';
END
GO

PRINT 'Seed data complete.';
GO
