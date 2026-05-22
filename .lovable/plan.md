# Make directory search, sector pills, and location pills work together

## Problem
The directory is returning `0 businesses found` because the current filters do not line up with the imported listing data:

- Most active businesses have **Sector** and **Business Type** filled in, but almost all have no `category_id`.
- The sector pill buttons currently filter by `category_id`, so choosing a pill like **Medical Services** excludes the matching listings.
- Some edition areas exist in more than one text format, for example Southampton City appears as both `SO15-SO17` and `SO15,SO16,SO17`, so the location filter can accidentally hide valid matches from the same area.
- Keyword search now checks `sector` and `biz_type`, but it still needs to combine cleanly with the pill filters and selected location.

## Fix
Update the directory backend functions and the directory page so all three controls work in unison:

```text
Search keyword  +  Sector pill  +  Location pill/dropdown  =  matching local businesses
```

### 1. Make sector pills match imported businesses
Update `get_public_businesses` and `get_public_businesses_count` so a selected category pill matches either:

- the listing's `category_id`, or
- the listing's text `sector` matching the selected category name.

This keeps the existing category pill UI while making it work with the current imported data.

### 2. Make location filtering tolerant of area variants
Update the location filter so listings in the same numbered Discover area match together, even where the postcode text is formatted differently.

Example: selecting Southampton City should include both:

```text
Area 1 - Southampton City SO15-SO17
Area 1 - Southampton City SO15,SO16,SO17
```

### 3. Keep keyword search hierarchical
Keep keyword matching across:

```text
name | description | sector | business type | city | postcode | keywords
```

So broad searches can match sector, narrower searches can match business type, and free text still works.

### 4. Tidy the frontend filter state
Adjust the directory page so changing the search box, sector pill, or location pill consistently resets to page 1 and refreshes the same results list.

Optionally de-duplicate location pills where they represent the same numbered Discover area, so users do not see multiple Southampton/Winchester variants.

## Validation
After implementing, verify examples directly against the live data:

- **Medical Services** + **Southampton City** should show the Southampton medical listing.
- **dentist** + **SO40 Totton** should show the dental listing in that area.
- **Cleaning** + **Southampton City** should show cleaning businesses.
- Search, sector pills, and location pills should all narrow the same result grid rather than fighting each other.

## Out of scope
- No change to public/private data exposure.
- No removal of the location-required gate.
- No redesign of the directory cards or hero.
