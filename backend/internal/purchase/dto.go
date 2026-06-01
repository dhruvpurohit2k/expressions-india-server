package purchase

// PurchaseRequest is sent by the mobile app after a successful in-app purchase.
type PurchaseRequest struct {
	ReceiptToken string `json:"receiptToken" binding:"required"`
}

// WebhookEvent represents the top-level structure of a RevenueCat webhook payload.
// Phase 2 will expand this with the full RevenueCat schema.
type WebhookEvent struct {
	Event struct {
		Type              string `json:"type"`
		AppUserID         string `json:"app_user_id"`
		ProductID         string `json:"product_id"`
		EntitlementID     string `json:"entitlement_id"`
		TransactionID     string `json:"transaction_id"`
	} `json:"event"`
}
