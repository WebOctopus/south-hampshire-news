// Records a discount-code redemption for a booking after payment is confirmed.
// Must be called with a Supabase client built from SUPABASE_SERVICE_ROLE_KEY —
// the record_discount_redemption RPC is intentionally restricted to service_role.
// Safe to call repeatedly: pre-checks discount_code_redemptions(booking_id) so
// webhook retries / dual-path fires don't double-record.

// deno-lint-ignore no-explicit-any
type SupabaseLike = any;

export async function recordDiscountRedemptionForBooking(
  supabase: SupabaseLike,
  bookingId: string,
): Promise<void> {
  try {
    if (!bookingId) return;

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('user_id, email, final_total, pricing_breakdown, selections')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingErr) {
      console.error('[discount-redemption] failed to load booking', bookingId, bookingErr);
      return;
    }
    if (!booking) {
      console.warn('[discount-redemption] no booking found for', bookingId);
      return;
    }

    const pb = (booking.pricing_breakdown ?? {}) as Record<string, any>;
    const sel = (booking.selections ?? {}) as Record<string, any>;
    const discount = pb.discount ?? sel.discount ?? null;

    if (!discount || !discount.code) {
      // No discount on this booking — nothing to record.
      return;
    }

    // Idempotency: skip if already recorded for this booking.
    const { data: existing, error: existingErr } = await supabase
      .from('discount_code_redemptions')
      .select('id')
      .eq('booking_id', bookingId)
      .limit(1)
      .maybeSingle();
    if (existingErr) {
      console.error('[discount-redemption] redemption pre-check failed', existingErr);
    } else if (existing) {
      console.log('[discount-redemption] already recorded for booking', bookingId);
      return;
    }

    const discountAmount = Number(discount.discount_amount) || 0;
    const finalTotal = Number(booking.final_total) || 0;
    // Booking value should be the pre-discount total.
    const rawFinal = Number(pb.rawFinalTotal);
    const bookingValue = Number.isFinite(rawFinal) && rawFinal > 0
      ? rawFinal
      : finalTotal + discountAmount;

    const productType = discount.product_type
      ?? pb.discount?.product_type
      ?? sel.discount?.product_type
      ?? null;

    const { error: rpcErr } = await supabase.rpc('record_discount_redemption', {
      p_code: discount.code,
      p_user_id: booking.user_id,
      p_email: booking.email,
      p_booking_id: bookingId,
      p_product_type: productType,
      p_booking_value: bookingValue,
      p_discount_amount: discountAmount,
      p_free_item_text: discount.free_item_text ?? null,
    });

    if (rpcErr) {
      console.error('[discount-redemption] RPC failed', rpcErr);
      return;
    }

    console.log('[discount-redemption] recorded', {
      bookingId,
      code: discount.code,
      discountAmount,
      bookingValue,
    });
  } catch (err) {
    console.error('[discount-redemption] unexpected error', err);
  }
}