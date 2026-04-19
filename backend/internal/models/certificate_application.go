package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CertificateApplication struct {
	ID             string     `gorm:"primaryKey;type:uuid" json:"id"`
	FormURL        string     `gorm:"not null" json:"formUrl"`
	OpenFrom       *time.Time `json:"openFrom"`
	OpenUntil      *time.Time `json:"openUntil"`
	ClosedMessage  *string    `json:"closedMessage"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

func (c *CertificateApplication) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.Must(uuid.NewV7()).String()
	}
	return nil
}
