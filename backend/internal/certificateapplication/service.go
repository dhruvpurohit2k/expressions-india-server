package certificateapplication

import (
	"time"

	"github.com/dhruvpurohit2k/expressions-india-backend/internal/dto"
	"github.com/dhruvpurohit2k/expressions-india-backend/internal/models"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Create(req *dto.CertificateApplicationCreateDTO) error {
	ca := models.CertificateApplication{
		FormURL:       req.FormURL,
		OpenFrom:      req.OpenFrom,
		OpenUntil:     req.OpenUntil,
		ClosedMessage: req.ClosedMessage,
	}
	return s.db.Create(&ca).Error
}

func (s *Service) GetAll() ([]dto.CertificateApplicationAdminDTO, error) {
	var records []models.CertificateApplication
	if err := s.db.Order("created_at DESC").Find(&records).Error; err != nil {
		return nil, err
	}
	result := make([]dto.CertificateApplicationAdminDTO, 0, len(records))
	for _, r := range records {
		result = append(result, toAdminDTO(r))
	}
	return result, nil
}

func (s *Service) GetByID(id string) (*dto.CertificateApplicationAdminDTO, error) {
	var r models.CertificateApplication
	if err := s.db.First(&r, "id = ?", id).Error; err != nil {
		return nil, err
	}
	d := toAdminDTO(r)
	return &d, nil
}

func (s *Service) Update(id string, req *dto.CertificateApplicationUpdateDTO) error {
	var r models.CertificateApplication
	if err := s.db.First(&r, "id = ?", id).Error; err != nil {
		return err
	}
	r.FormURL = req.FormURL
	r.OpenFrom = req.OpenFrom
	r.OpenUntil = req.OpenUntil
	r.ClosedMessage = req.ClosedMessage
	return s.db.Save(&r).Error
}

func (s *Service) Delete(id string) error {
	return s.db.Delete(&models.CertificateApplication{}, "id = ?", id).Error
}

// GetPublic returns all certificate applications with open/closed status for the app.
func (s *Service) GetPublic() ([]dto.CertificateApplicationPublicDTO, error) {
	var records []models.CertificateApplication
	if err := s.db.Order("created_at DESC").Find(&records).Error; err != nil {
		return nil, err
	}
	now := time.Now()
	result := make([]dto.CertificateApplicationPublicDTO, 0, len(records))
	for _, r := range records {
		result = append(result, toPublicDTO(r, now))
	}
	return result, nil
}

func isOpen(r models.CertificateApplication, now time.Time) bool {
	if r.OpenFrom != nil && now.Before(*r.OpenFrom) {
		return false
	}
	if r.OpenUntil != nil && now.After(*r.OpenUntil) {
		return false
	}
	// If neither date is set, treat as always open.
	return true
}

func toPublicDTO(r models.CertificateApplication, now time.Time) dto.CertificateApplicationPublicDTO {
	open := isOpen(r, now)
	d := dto.CertificateApplicationPublicDTO{
		ID:        r.ID,
		IsOpen:    open,
		OpenFrom:  r.OpenFrom,
		OpenUntil: r.OpenUntil,
	}
	if open {
		d.FormURL = &r.FormURL
	} else {
		if r.ClosedMessage != nil && *r.ClosedMessage != "" {
			d.Message = *r.ClosedMessage
		} else {
			d.Message = "Check back later for certification applications."
		}
	}
	return d
}

func toAdminDTO(r models.CertificateApplication) dto.CertificateApplicationAdminDTO {
	return dto.CertificateApplicationAdminDTO{
		ID:            r.ID,
		FormURL:       r.FormURL,
		OpenFrom:      r.OpenFrom,
		OpenUntil:     r.OpenUntil,
		ClosedMessage: r.ClosedMessage,
		CreatedAt:     r.CreatedAt,
	}
}
