/**
 * ═══════════════════════════════════════════════════════════
 *  Aneesa Hampers — n8n Webhook Integration
 * ───────────────────────────────────────────────────────────
 *  Drop this file into your project and import it wherever
 *  you create orders or update their status.
 *
 *  Usage:
 *    import { notifyOrderCreated, notifyStatusUpdate } from './n8n-integration.js';
 *
 *    // On new order:
 *    await notifyOrderCreated({ orderId, customerName, ... });
 *
 *    // When admin updates status:
 *    await notifyStatusUpdate({ orderId, newStatus, customerName, ... });
 * ═══════════════════════════════════════════════════════════
 */

"use strict";

// ── CONFIG ─────────────────────────────────────────────────
// Replace these URLs after you deploy the workflow in n8n.
const N8N_BASE_URL  = "https://mujeebkhan.app.n8n.cloud/webhook"; // ✅ production
const WEBHOOK_ORDER  = `${N8N_BASE_URL}/order-created`;       // Workflow 1
const WEBHOOK_STATUS = `${N8N_BASE_URL}/order-status-update`; // Workflow 2
// ───────────────────────────────────────────────────────────

/**
 * Notify n8n when a new order is placed.
 * Call this immediately after writing the order to Firestore.
 *
 * @param {Object} orderData  - Full order payload from Firestore
 * @param {string} orderId    - Firestore document ID
 * @returns {Promise<{success:boolean, error?:string}>}
 */
export async function notifyOrderCreated(orderData, orderId) {
  try {
    const payload = {
      orderId:       orderId,
      customerName:  orderData.customerName  || orderData.name  || "Valued Customer",
      customerEmail: orderData.customerEmail || orderData.email || null,
      phone:         orderData.phone         || orderData.customerPhone || null,
      address:       orderData.address       || null,
      city:          orderData.city          || null,
      state:         orderData.state         || null,
      zipCode:       orderData.zipCode       || null,
      paymentMethod: orderData.paymentMethod || "UPI",
      total:         orderData.total         || 0,
      items:         orderData.items         || [],
      giftMessage:   orderData.giftMessage   || null,
      status:        orderData.status        || "pending",
    };

    const res = await fetch(WEBHOOK_ORDER, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[n8n] Order notification failed:", res.status, data);
      return { success: false, error: data.error || "n8n request failed" };
    }

    console.log("[n8n] Order notification sent:", data);
    return { success: true };

  } catch (err) {
    console.error("[n8n] notifyOrderCreated error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Notify n8n when admin updates an order's status.
 * Call this when admin changes status in admin.html.
 *
 * @param {Object} params
 * @param {string} params.orderId       - Firestore document ID
 * @param {string} params.newStatus     - e.g. "confirmed", "preparing", "dispatched", "delivered"
 * @param {string} params.customerName
 * @param {string} [params.customerEmail]
 * @param {string} [params.phone]
 * @param {number} [params.total]
 * @param {Array}  [params.items]
 * @param {string} [params.adminNote]   - Optional note from admin
 * @returns {Promise<{success:boolean, error?:string}>}
 */
export async function notifyStatusUpdate({
  orderId,
  newStatus,
  customerName,
  customerEmail = null,
  phone         = null,
  total         = 0,
  items         = [],
  adminNote     = null,
}) {
  const VALID_STATUSES = ["confirmed","preparing","dispatched","shipped","delivered","cancelled"];
  if (!VALID_STATUSES.includes(newStatus)) {
    console.warn(`[n8n] Status '${newStatus}' does not trigger notification — skipping.`);
    return { success: true, skipped: true };
  }

  try {
    const payload = {
      orderId,
      newStatus,
      customerName:  customerName  || "Valued Customer",
      customerEmail: customerEmail || null,
      phone:         phone         || null,
      total:         total         || 0,
      items:         items         || [],
      adminNote:     adminNote     || null,
    };

    const res = await fetch(WEBHOOK_STATUS, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[n8n] Status notification failed:", res.status, data);
      return { success: false, error: data.error || "n8n request failed" };
    }

    console.log("[n8n] Status notification sent:", data);
    return { success: true };

  } catch (err) {
    console.error("[n8n] notifyStatusUpdate error:", err);
    return { success: false, error: err.message };
  }
}
