-- ============================================================
-- PropertyPro Database
-- Script 02: Create Tables (Auth Module)
-- ============================================================

USE PropertyProDB;
GO

-- ── Users ────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        UserId          INT IDENTITY(1,1) PRIMARY KEY,
        Email           NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(255) NULL,
        FirstName       NVARCHAR(50)  NOT NULL,
        LastName        NVARCHAR(50)  NOT NULL,
        AvatarUrl       NVARCHAR(500) NULL,
        IsEmailVerified BIT           NOT NULL DEFAULT 0,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        LastLoginAt     DATETIME2     NULL
    );
    PRINT 'Table Users created.';
END
GO

-- ── Roles ────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE Roles (
        RoleId      INT IDENTITY(1,1) PRIMARY KEY,
        RoleName    NVARCHAR(20) NOT NULL UNIQUE
    );
    PRINT 'Table Roles created.';
END
GO

-- ── UserRoles ────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserRoles' AND xtype='U')
BEGIN
    CREATE TABLE UserRoles (
        UserId  INT NOT NULL,
        RoleId  INT NOT NULL,
        CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
        CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE
    );
    PRINT 'Table UserRoles created.';
END
GO

-- ── UserExternalLogins ───────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserExternalLogins' AND xtype='U')
BEGIN
    CREATE TABLE UserExternalLogins (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT           NOT NULL,
        Provider        NVARCHAR(20)  NOT NULL,
        ProviderUserId  NVARCHAR(100) NOT NULL,
        CONSTRAINT FK_ExternalLogins_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT UQ_Provider_ProviderUserId UNIQUE (Provider, ProviderUserId)
    );
    PRINT 'Table UserExternalLogins created.';
END
GO

-- ── RefreshTokens ────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RefreshTokens' AND xtype='U')
BEGIN
    CREATE TABLE RefreshTokens (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        UserId      INT           NOT NULL,
        Token       NVARCHAR(500) NOT NULL,
        ExpiresAt   DATETIME2     NOT NULL,
        CreatedAt   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        IsRevoked   BIT           NOT NULL DEFAULT 0,
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );
    CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
    PRINT 'Table RefreshTokens created.';
END
GO

PRINT 'All Auth tables created successfully.';
GO
