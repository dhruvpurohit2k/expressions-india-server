package purchase

import (
	"errors"
	"log"
	"os"
	"time"
)

// RevenueCatClient handles verification of purchase receipts with RevenueCat.
// Phase 1: All methods are stubs that simulate success after a short delay.
// Phase 2: Replace with real RevenueCat REST API calls.
type RevenueCatClient struct {
	apiKey        string
	webhookSecret string
}

// NewRevenueCatClient reads the RevenueCat API key and webhook secret from
// environment variables. The client is usable even if the keys are empty —
// individual methods will return errors when called without a key.
func NewRevenueCatClient() *RevenueCatClient {
	apiKey := os.Getenv("REVENUECAT_API_KEY")
	webhookSecret := os.Getenv("REVENUECAT_WEBHOOK_SECRET")

	if apiKey == "" {
		log.Println("[PURCHASE] WARNING: REVENUECAT_API_KEY is not set — purchase verification will use stub mode")
	}
	if webhookSecret == "" {
		log.Println("[PURCHASE] WARNING: REVENUECAT_WEBHOOK_SECRET is not set — webhook validation will use stub mode")
	}

	return &RevenueCatClient{
		apiKey:        apiKey,
		webhookSecret: webhookSecret,
	}
}

// VerifyReceipt validates a purchase receipt with RevenueCat.
//
// STUB IMPLEMENTATION (Phase 1):
//   - Checks that the API key is configured (returns error if missing).
//   - Simulates a 200ms network delay.
//   - Always returns success.
//
// Phase 2: Call GET /v1/subscribers/{app_user_id} on RevenueCat REST API
// and verify that the user has an active entitlement.
func (rc *RevenueCatClient) VerifyReceipt(userID, receiptToken string) error {
	if rc.apiKey == "" {
		return errors.New("REVENUECAT_API_KEY is not configured")
	}

	log.Printf("[STUB] VerifyReceipt called for user=%s receipt=%s — returning success", userID, receiptToken)
	time.Sleep(200 * time.Millisecond)

	return nil // stub: always succeed
}

// ValidateWebhookSignature checks the HMAC signature of an incoming webhook.
//
// STUB IMPLEMENTATION (Phase 1):
//   - Checks that the webhook secret is configured.
//   - Always returns true (accepts all payloads).
//
// Phase 2: Compute HMAC-SHA256 of the payload using the webhook secret
// and compare with the provided signature header.
func (rc *RevenueCatClient) ValidateWebhookSignature(payload []byte, signature string) bool {
	if rc.webhookSecret == "" {
		log.Println("[STUB] ValidateWebhookSignature: no secret configured — accepting payload")
		return true
	}

	log.Printf("[STUB] ValidateWebhookSignature called with sig=%s — returning true", signature)
	return true // stub: always accept
}
