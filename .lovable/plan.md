

## Fix Phone Number Leading Zero in Events CSV Template

### Problem
When the CSV template is downloaded and opened in Excel/Sheets, phone numbers like `01234567890` lose their leading `0` because the application treats them as numeric values. This is a common CSV/spreadsheet issue.

### Solution

**File: `src/components/admin/EventsManagement.tsx`**

1. **Template download**: Prefix the phone number example values with an equals-sign-quote pattern (`="01234567890"`) which forces Excel to treat them as text. Alternatively, add a comment row or note in the template header.

2. **Better approach**: Add a BOM (byte order mark) to the CSV and wrap phone numbers with `=""` formula syntax so Excel keeps them as text:
   - Change example phone from `"01234567890"` to `="01234567890"` 
   - Actually, the cleanest fix: wrap the phone value in the CSV as `="'01234567890"` or use the tab-separated trick

3. **Simplest reliable fix**: In the `downloadCsvTemplate` function, use the Excel formula trick `="01234567890"` for the phone column example. Also, in the CSV import parser (`handleCsvUpload`), ensure that if the `contact_phone` value is purely numeric and doesn't start with `0`, we don't try to "fix" it (the data is already lost at that point), but we can add a note in the template.

4. **Add instruction row or note**: Add a comment in the downloaded template indicating phone numbers should be formatted as text in the spreadsheet, and prefix the example with the Excel text-force pattern.

### Specific change
In `downloadCsvTemplate()` (~line 282):
- Wrap phone examples with `="01234567890"` format so Excel preserves leading zeros
- Add a UTF-8 BOM to help Excel handle the file correctly

In the import parser (~line 309):
- Strip any `=` or extra quotes from the Excel formula wrapper when parsing phone values back

This is a small, targeted fix to two spots in one file.

