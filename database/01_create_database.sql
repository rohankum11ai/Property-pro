-- ============================================================
-- PropertyPro Database
-- Script 01: Create Database
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PropertyProDB')
BEGIN
    CREATE DATABASE PropertyProDB;
    PRINT 'Database PropertyProDB created.';
END
ELSE
BEGIN
    PRINT 'Database PropertyProDB already exists.';
END
GO

USE PropertyProDB;
GO
