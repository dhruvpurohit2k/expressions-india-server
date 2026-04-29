package dto

import "encoding/json"

type JournalListItemDTO struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Volume     int    `gorm:"not null" json:"volume"`
	Issue      int    `gorm:"not null" json:"issue"`
	StartMonth string `gorm:"not null" json:"startMonth"`
	EndMonth   string `gorm:"not null" json:"endMonth"`
	Year       int    `gorm:"not null" json:"year"`
}

// JournalChapterInput is parsed from the chapters JSON form field.
// MediaUpload (when set) is a pre-uploaded chapter PDF reference.
type JournalChapterInput struct {
	ID             string            `json:"id"`
	Title          string            `json:"title"`
	Description    string            `json:"description"`
	Authors        []string          `json:"authors"`
	DeletedMediaID string            `json:"deletedMediaId"`
	MediaUpload    *UploadedMediaRef `json:"mediaUpload"`
}

type JournalCreateRequestDTO struct {
	Title       string `form:"title" binding:"required"`
	Description string `form:"description"`
	Volume      int    `form:"volume" binding:"required"`
	Issue       int    `form:"issue" binding:"required"`
	StartMonth  string `form:"startMonth" binding:"required"`
	EndMonth    string `form:"endMonth" binding:"required"`
	Year        int    `form:"year" binding:"required"`
	// Pre-uploaded cover (JSON-encoded UploadedMediaRef). Empty = no cover.
	CoverMediaUpload string `form:"coverMediaUpload"`
	// Chapters as JSON ([]JournalChapterInput).
	ChaptersJSON string `form:"chapters"`
}

type JournalUpdateRequestDTO struct {
	Title               string `form:"title" binding:"required"`
	Description         string `form:"description"`
	Volume              int    `form:"volume" binding:"required"`
	Issue               int    `form:"issue" binding:"required"`
	StartMonth          string `form:"startMonth" binding:"required"`
	EndMonth            string `form:"endMonth" binding:"required"`
	Year                int    `form:"year" binding:"required"`
	CoverMediaUpload    string `form:"coverMediaUpload"`
	DeletedCoverMediaID string `form:"deletedCoverMediaId"`
	ChaptersJSON        string `form:"chapters"`
	// JSON-encoded array of chapter IDs to delete.
	DeletedChapterIDsJSON string `form:"deletedChapterIds"`
}

func ParseJournalChapters(raw string) ([]JournalChapterInput, error) {
	if raw == "" {
		return nil, nil
	}
	var chapters []JournalChapterInput
	if err := json.Unmarshal([]byte(raw), &chapters); err != nil {
		return nil, err
	}
	return chapters, nil
}

func ParseDeletedChapterIDs(raw string) ([]string, error) {
	if raw == "" {
		return nil, nil
	}
	var ids []string
	if err := json.Unmarshal([]byte(raw), &ids); err != nil {
		return nil, err
	}
	return ids, nil
}
