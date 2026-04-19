package certificateapplication

import (
	"errors"
	"net/http"

	"github.com/dhruvpurohit2k/expressions-india-backend/internal/dto"
	"github.com/dhruvpurohit2k/expressions-india-backend/internal/pkg/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (ctrl *Controller) GetPublic(c *gin.Context) {
	records, err := ctrl.service.GetPublic()
	if err != nil {
		utils.FailInternal(c, "FETCH_ERROR", "Failed to fetch certificate applications", err)
		return
	}
	utils.OK(c, records)
}

func (ctrl *Controller) GetAll(c *gin.Context) {
	records, err := ctrl.service.GetAll()
	if err != nil {
		utils.FailInternal(c, "FETCH_ERROR", "Failed to fetch certificate applications", err)
		return
	}
	utils.OK(c, records)
}

func (ctrl *Controller) GetByID(c *gin.Context) {
	id := c.Param("id")
	record, err := ctrl.service.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Fail(c, http.StatusNotFound, "NOT_FOUND", "Certificate application not found")
		} else {
			utils.FailInternal(c, "FETCH_ERROR", "Failed to fetch certificate application", err)
		}
		return
	}
	utils.OK(c, record)
}

func (ctrl *Controller) Create(c *gin.Context) {
	var req dto.CertificateApplicationCreateDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid input")
		return
	}
	if err := ctrl.service.Create(&req); err != nil {
		utils.FailInternal(c, "CREATE_ERROR", "Failed to create certificate application", err)
		return
	}
	utils.OK(c, nil)
}

func (ctrl *Controller) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.CertificateApplicationUpdateDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid input")
		return
	}
	if err := ctrl.service.Update(id, &req); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Fail(c, http.StatusNotFound, "NOT_FOUND", "Certificate application not found")
		} else {
			utils.FailInternal(c, "UPDATE_ERROR", "Failed to update certificate application", err)
		}
		return
	}
	utils.OK(c, nil)
}

func (ctrl *Controller) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.service.Delete(id); err != nil {
		utils.FailInternal(c, "DELETE_ERROR", "Failed to delete certificate application", err)
		return
	}
	utils.OK(c, nil)
}
