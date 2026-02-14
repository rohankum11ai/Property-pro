using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PropertyPro.API.Migrations
{
    /// <inheritdoc />
    public partial class RenameStateToProvinceZipToPostal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "State",
                table: "Properties",
                newName: "Province");

            migrationBuilder.RenameColumn(
                name: "ZipCode",
                table: "Properties",
                newName: "PostalCode");

            // Shrink max-length from 20 to 10 for postal codes
            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Properties",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Properties",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.RenameColumn(
                name: "PostalCode",
                table: "Properties",
                newName: "ZipCode");

            migrationBuilder.RenameColumn(
                name: "Province",
                table: "Properties",
                newName: "State");
        }
    }
}
