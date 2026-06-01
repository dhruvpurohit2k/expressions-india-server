package storage

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	_ "github.com/tursodatabase/libsql-client-go/libsql" // libSQL driver for Turso
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB() *gorm.DB {
	env := os.Getenv("APP_ENV")

	const maxAttempts = 5
	var db *gorm.DB
	var err error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if attempt > 1 {
			wait := time.Duration(attempt*2) * time.Second
			log.Printf("DB connection failed, retrying in %s (attempt %d/%d)...", wait, attempt, maxAttempts)
			time.Sleep(wait)
		}

		if env == "production" || env == "staging" {
			fmt.Println("USING TURSO (LIBSQL)")
			tursoURL := os.Getenv("DB_URL")
			authToken := os.Getenv("DB_AUTH_TOKEN")

			if tursoURL == "" || authToken == "" {
				log.Fatalf("DB_URL or DB_AUTH_TOKEN not set in environment variables")
			}

			// Open raw sql connection using libsql driver
			dsn := fmt.Sprintf("%s?authToken=%s", tursoURL, authToken)
			sqlDB, connErr := sql.Open("libsql", dsn)
			if connErr != nil {
				err = connErr
				continue
			}

			// Initialize GORM using the pure Go sqlite driver and the custom connection
			db, err = gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{
				Logger:         logger.Default.LogMode(logger.Error),
				TranslateError: true,
			})
		} else {
			fmt.Println("USING SQLITE (LOCAL)")
			db, err = gorm.Open(sqlite.Open("dev.db"), &gorm.Config{
				Logger:         logger.Default.LogMode(logger.Info),
				TranslateError: true,
			})
		}

		if err == nil {
			break
		}
	}

	if err != nil {
		log.Fatalf("Could not open DB after %d attempts: %v", maxAttempts, err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get underlying sql.DB: %v", err)
	}
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetMaxOpenConns(5)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	return db
}
