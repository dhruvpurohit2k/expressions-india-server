package main

import (
	"fmt"
	"log"
	"os"
	"reflect"

	"github.com/dhruvpurohit2k/expressions-india-backend/internal/models"
	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


func main() {
	if _, statErr := os.Stat(".env"); statErr == nil {
		if err := godotenv.Load(); err != nil {
			log.Fatal("Found .env file but could not parse it: ", err)
		}
	} else {
		log.Fatal(".env not found.")
	}
	// 1. Connect to Postgres (RDS)
	// You can retrieve this from your production environment or pass it manually
	pgDSN := os.Getenv("PG_RDS_URL")
	if pgDSN == "" {
		log.Fatal("No connection string setup")
		// pgDSN = "postgres://username:password@rds-host:5432/database_name?sslmode=require"
	}

	fmt.Println("Connecting to source PostgreSQL...")
	pgDB, err := gorm.Open(postgres.Open(pgDSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}

	// 2. Connect to local target SQLite file
	fmt.Println("Deleting existing prod.db if it exists...")
	os.Remove("prod.db")
	os.Remove("prod.db-wal")
	os.Remove("prod.db-shm")

	fmt.Println("Creating target SQLite database (prod.db)...")
	sqliteDB, err := gorm.Open(sqlite.Open("prod.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to sqlite: %v", err)
	}

	// 3. AutoMigrate target SQLite tables
	fmt.Println("Running AutoMigrate on SQLite...")
	err = sqliteDB.AutoMigrate(
		&models.User{},
		&models.Event{},
		&models.Media{},
		&models.Audience{},
		&models.Promotion{},
		&models.Link{},
		&models.Journal{},
		&models.JournalChapter{},
		&models.Author{},
		&models.Podcast{},
		&models.Enquiry{},
		&models.Article{},
		&models.Course{},
		&models.CourseChapter{},
		&models.Team{},
		&models.Member{},
		&models.Almanac{},
		&models.Brochure{},
		&models.CertificateApplication{},
	)
	if err != nil {
		log.Fatalf("failed to migrate sqlite: %v", err)
	}

	// 4. Helper to migrate a table, skipping hooks to ensure a 1:1 data copy
	migrateTable := func(name string, model interface{}, slice interface{}) {
		fmt.Printf("Migrating %s...\n", name)

		// Fetch all records from Postgres
		if err := pgDB.Find(slice).Error; err != nil {
			log.Fatalf("failed to fetch %s: %v", name, err)
		}

		// Check if the slice actually has elements using reflection
		val := reflect.ValueOf(slice)
		if val.Kind() == reflect.Ptr {
			val = val.Elem()
		}
		if val.Kind() != reflect.Slice {
			log.Fatalf("expected slice pointer for %s, got %v", name, val.Kind())
		}

		if val.Len() == 0 {
			fmt.Printf("No records found for %s, skipping insert.\n", name)
			return
		}

		// Write to SQLite using a hook-free session
		session := sqliteDB.Session(&gorm.Session{SkipHooks: true})

		// Write to SQLite
		if err := session.Create(slice).Error; err != nil {
			log.Fatalf("failed to insert %s: %v", name, err)
		}
	}

	// 5. Run migrations in dependency order
	migrateTable("Users", &models.User{}, &[]models.User{})
	migrateTable("Audiences", &models.Audience{}, &[]models.Audience{})
	migrateTable("Events", &models.Event{}, &[]models.Event{})
	migrateTable("Media", &models.Media{}, &[]models.Media{})
	migrateTable("Promotions", &models.Promotion{}, &[]models.Promotion{})
	migrateTable("Links", &models.Link{}, &[]models.Link{})
	migrateTable("Authors", &models.Author{}, &[]models.Author{})
	migrateTable("Journals", &models.Journal{}, &[]models.Journal{})
	migrateTable("JournalChapters", &models.JournalChapter{}, &[]models.JournalChapter{})
	migrateTable("Podcasts", &models.Podcast{}, &[]models.Podcast{})
	migrateTable("Enquiries", &models.Enquiry{}, &[]models.Enquiry{})
	migrateTable("Articles", &models.Article{}, &[]models.Article{})
	migrateTable("Courses", &models.Course{}, &[]models.Course{})
	migrateTable("CourseChapters", &models.CourseChapter{}, &[]models.CourseChapter{})
	migrateTable("Teams", &models.Team{}, &[]models.Team{})
	migrateTable("Members", &models.Member{}, &[]models.Member{})
	migrateTable("Almanacs", &models.Almanac{}, &[]models.Almanac{})
	migrateTable("Brochures", &models.Brochure{}, &[]models.Brochure{})
	migrateTable("CertificateApplications", &models.CertificateApplication{}, &[]models.CertificateApplication{})

	fmt.Println("\nMigration completed successfully! SQLite database saved to prod.db")
}
