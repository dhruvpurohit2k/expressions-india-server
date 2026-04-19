package dto

import "time"

type CertificateApplicationAdminDTO struct {
	ID            string     `json:"id"`
	FormURL       string     `json:"formUrl"`
	OpenFrom      *time.Time `json:"openFrom"`
	OpenUntil     *time.Time `json:"openUntil"`
	ClosedMessage *string    `json:"closedMessage"`
	CreatedAt     time.Time  `json:"createdAt"`
}

type CertificateApplicationPublicDTO struct {
	ID        string     `json:"id"`
	IsOpen    bool       `json:"isOpen"`
	FormURL   *string    `json:"formUrl"`
	Message   string     `json:"message"`
	OpenFrom  *time.Time `json:"openFrom"`
	OpenUntil *time.Time `json:"openUntil"`
}

type CertificateApplicationCreateDTO struct {
	FormURL       string     `json:"formUrl" binding:"required"`
	OpenFrom      *time.Time `json:"openFrom"`
	OpenUntil     *time.Time `json:"openUntil"`
	ClosedMessage *string    `json:"closedMessage"`
}

type CertificateApplicationUpdateDTO struct {
	FormURL       string     `json:"formUrl" binding:"required"`
	OpenFrom      *time.Time `json:"openFrom"`
	OpenUntil     *time.Time `json:"openUntil"`
	ClosedMessage *string    `json:"closedMessage"`
}
