using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tsapi.Models;

namespace tsapi.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : 
    IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Item> Items { get; set; }
    public DbSet<BorrowingRecord> BorrowingRecords { get; set; }
    public DbSet<UserRating> UserRatings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Item relationships
        builder.Entity<Item>()
            .HasOne(i => i.Owner)
            .WithMany(u => u.OwnedItems)
            .HasForeignKey(i => i.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure BorrowingRecord relationships
        builder.Entity<BorrowingRecord>()
            .HasOne(br => br.Item)
            .WithMany(i => i.BorrowingHistory)
            .HasForeignKey(br => br.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<BorrowingRecord>()
            .HasOne(br => br.Borrower)
            .WithMany(u => u.BorrowedRecords)
            .HasForeignKey(br => br.BorrowerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<BorrowingRecord>()
            .HasOne(br => br.Lender)
            .WithMany(u => u.LentRecords)
            .HasForeignKey(br => br.LenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure UserRating relationships
        builder.Entity<UserRating>()
            .HasOne(ur => ur.RatedUser)
            .WithMany(u => u.ReceivedRatings)
            .HasForeignKey(ur => ur.RatedUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<UserRating>()
            .HasOne(ur => ur.RaterUser)
            .WithMany(u => u.GivenRatings)
            .HasForeignKey(ur => ur.RaterUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<UserRating>()
            .HasOne(ur => ur.BorrowingRecord)
            .WithMany()
            .HasForeignKey(ur => ur.BorrowingRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes for performance
        builder.Entity<Item>()
            .HasIndex(i => i.OwnerId);

        builder.Entity<Item>()
            .HasIndex(i => i.Status);

        builder.Entity<BorrowingRecord>()
            .HasIndex(br => br.BorrowerId);

        builder.Entity<BorrowingRecord>()
            .HasIndex(br => br.LenderId);

        builder.Entity<BorrowingRecord>()
            .HasIndex(br => br.Status);

        builder.Entity<UserRating>()
            .HasIndex(ur => ur.RatedUserId);
    }
}
