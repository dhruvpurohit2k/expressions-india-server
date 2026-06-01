package purchase

import (
	"io"
	"log"
	"net/http"

	"github.com/dhruvpurohit2k/expressions-india-backend/internal/auth"
	"github.com/dhruvpurohit2k/expressions-india-backend/internal/course"
	"github.com/dhruvpurohit2k/expressions-india-backend/internal/pkg/utils"
	"github.com/gin-gonic/gin"
)

// Controller handles purchase-related HTTP endpoints.
type Controller struct {
	rc            *RevenueCatClient
	courseService *course.Service
}

// NewController creates a new purchase controller.
func NewController(rc *RevenueCatClient, courseService *course.Service) *Controller {
	return &Controller{
		rc:            rc,
		courseService: courseService,
	}
}

// PurchaseCourse handles POST /api/course/:id/purchase
//
// The mobile app calls this after a successful in-app purchase to verify
// the receipt and enroll the user in the course.
func (ctrl *Controller) PurchaseCourse(c *gin.Context) {
	courseID := c.Param("id")

	claims := auth.GetClaims(c)
	if claims == nil {
		utils.Fail(c, http.StatusUnauthorized, "UNAUTHORIZED", "login required")
		return
	}

	var req PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "BAD_REQUEST", "receiptToken is required")
		return
	}

	// Check if user is already enrolled — return success early.
	enrolled, err := ctrl.courseService.IsEnrolled(courseID, claims.UserID)
	if err != nil {
		utils.FailInternal(c, "ENROLLMENT_CHECK_ERROR", "Failed to check enrollment", err)
		return
	}
	if enrolled {
		utils.OK(c, gin.H{"message": "already enrolled"})
		return
	}

	// Verify the purchase receipt with RevenueCat (stub in Phase 1).
	if err := ctrl.rc.VerifyReceipt(claims.UserID, req.ReceiptToken); err != nil {
		utils.Fail(c, http.StatusPaymentRequired, "PURCHASE_VERIFICATION_FAILED", err.Error())
		return
	}

	// Receipt is valid — enroll the user using the existing service method.
	if err := ctrl.courseService.EnrollUser(courseID, claims.UserID); err != nil {
		utils.FailInternal(c, "ENROLL_ERROR", "Failed to enroll user after purchase", err)
		return
	}

	log.Printf("[PURCHASE] User %s enrolled in course %s via purchase", claims.UserID, courseID)
	utils.OK(c, gin.H{"message": "purchase verified and enrolled"})
}

// RevenueCatWebhook handles POST /api/webhooks/revenuecat
//
// RevenueCat sends server-to-server notifications for events like refunds,
// cancellations, and expirations. This handler processes those events.
//
// Phase 1 (no-refund policy): Only logs the event. No revocation is performed
// since we have a no-refund policy. The handler is still wired up so we can
// enable revocation in Phase 2 if the policy changes.
func (ctrl *Controller) RevenueCatWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		utils.Fail(c, http.StatusBadRequest, "BAD_REQUEST", "cannot read body")
		return
	}

	// Validate webhook signature (stub in Phase 1).
	signature := c.GetHeader("X-RevenueCat-Signature")
	if !ctrl.rc.ValidateWebhookSignature(body, signature) {
		utils.Fail(c, http.StatusUnauthorized, "UNAUTHORIZED", "invalid webhook signature")
		return
	}

	// Parse the event.
	var webhook WebhookEvent
	if err := c.ShouldBindJSON(&webhook); err != nil {
		// Re-bind won't work since body was already read. Parse manually.
		log.Printf("[WEBHOOK] Failed to parse webhook body: %v", err)
		// Still return 200 so RevenueCat doesn't retry endlessly.
		c.JSON(http.StatusOK, gin.H{"status": "received"})
		return
	}

	log.Printf("[WEBHOOK] Received event type=%s user=%s product=%s",
		webhook.Event.Type, webhook.Event.AppUserID, webhook.Event.ProductID)

	// No-refund policy: We log the event but do not revoke access.
	// Phase 2 (if refund policy changes):
	//   case "CANCELLATION", "EXPIRATION":
	//     ctrl.courseService.RevokeAccess(courseID, userID)

	c.JSON(http.StatusOK, gin.H{"status": "received"})
}
