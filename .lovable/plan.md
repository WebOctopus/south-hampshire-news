

## Fix: Move Login Credentials Above Footer in Admin-Created Quote Emails

### Problem
When custom DB templates don't include the `{{login_credentials}}` placeholder, the fallback logic inserts the credentials block before the **last** `</table>` tag — which is the outermost wrapper table, placing credentials **after** the footer. Users miss their login details because they're below the footer content.

### Solution

**File: `supabase/functions/send-booking-confirmation-email/index.ts`** (lines 440-463)

Change the fallback insertion strategy: instead of inserting before the **last** `</table>`, insert **after the first occurrence of the greeting/intro paragraph** or before the first summary/content section. The most reliable approach is to insert after the first `</p>` that follows the greeting, or use a marker.

A simpler, more robust approach: search for the footer marker (the branded footer block starts with the Discover logo or contact details) and insert credentials **before** it. The footer in these templates contains identifiable content like "Connecting South Hampshire" or the address.

**Concrete change:** Replace the `lastIndexOf('</table>')` strategy with inserting before the footer. Look for the footer's distinctive HTML (e.g., the `<!-- FOOTER -->` comment if present, or the first occurrence of the company address/contact block). If that's not reliably detectable, insert **after the first `</td></tr>` following the header** — i.e., right after the greeting paragraph.

**Best approach:** Insert credentials right after the intro paragraph. Search for the pattern `</p>\n` or a content marker like "Your Quote Summary" / "Your Booking Summary" and insert the credentials block **before** the summary section. Use the first occurrence of a summary heading or "What to do next" as the insertion point.

Updated logic (lines 440-452):
```typescript
if (payload.is_admin_created && payload.generated_password && !customerTemplate.html_body.includes('{{login_credentials}}')) {
  const credentialsBlock = buildLoginCredentialsHtml(payload.email, payload.generated_password);
  // Try to insert early in the email - before the summary or next steps section
  const summaryMarker = templatedHtml.match(/(<(?:div|table)[^>]*>[\s\S]*?(?:Summary|What to do next|Your Quote|Your Booking))/i);
  if (summaryMarker && summaryMarker.index !== undefined) {
    templatedHtml = templatedHtml.slice(0, summaryMarker.index) + credentialsBlock + templatedHtml.slice(summaryMarker.index);
  } else if (templatedHtml.includes('</body>')) {
    templatedHtml = templatedHtml.replace('</body>', credentialsBlock + '</body>');
  } else {
    // Insert after the first paragraph block as early placement
    const firstParaEnd = templatedHtml.indexOf('</p>');
    if (firstParaEnd !== -1) {
      const insertAt = firstParaEnd + 4;
      templatedHtml = templatedHtml.slice(0, insertAt) + credentialsBlock + templatedHtml.slice(insertAt);
    } else {
      templatedHtml += credentialsBlock;
    }
  }
}
```

Apply the same pattern for the existing-user login block (lines 454-463).

**Deploy:** Redeploy the `send-booking-confirmation-email` edge function after the change.

### Files Changed
- `supabase/functions/send-booking-confirmation-email/index.ts` — move credentials insertion to appear before the quote/booking summary, not after the footer

