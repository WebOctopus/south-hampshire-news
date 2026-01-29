

## Plan: Make Additional Advertising Page Sections Editable

### Overview
Extend the existing inline editing system to cover three additional sections visible in the screenshots:
1. **"The Product" and "The Advertiser"** cards (ROIFactorsInfo component)
2. **"SEEING DOUBLE" BOGOF promo** (NewAdvertiserPromo component)  
3. **"The all important question"** header section (ROIFactorsInfo component)

---

### Sections to Make Editable

#### 1. "The all important question" Header Section
| Element | Current Text | Type |
|---------|-------------|------|
| Main heading | "The all important question:" | Single line |
| Subheading line 1 | "How Much Does it Cost to Advertise?" | Single line |
| Subheading line 2 | "And What Could your Return (ROI) be?" | Single line |
| Description paragraph | "It's difficult to project as there are so many factors..." | Multiline |

#### 2. "The Product" Card (Left Column)
| Element | Current Text | Type |
|---------|-------------|------|
| Card title | "The Product" | Single line |
| Card subtitle | "What makes a magazine effective" | Single line |
| 6 feature items | Circulation, Distribution Method, etc. | Title + description pairs |

#### 3. "The Advertiser" Card (Right Column)
| Element | Current Text | Type |
|---------|-------------|------|
| Card title | "The Advertiser" | Single line |
| Card subtitle | "What you bring to the table" | Single line |
| 4 feature items | Right Ad Size, Design Quality, etc. | Title + description pairs |
| Footer text | "Remember: Advertising generates response, you create the result" | Single line |

#### 4. "SEEING DOUBLE" BOGOF Promo Section
| Element | Current Text | Type |
|---------|-------------|------|
| Badge text | "New Advertisers Only" | Single line |
| Main headline | "SEEING DOUBLE" | Single line |
| Offer description | "For Every Area Booked We Give You One Area FREE for 6 months" | Multiline |
| Package heading | "3+ Repeat Package for New Advertisers" | Single line |
| 5 benefit bullet points | "Minimum commitment is 3 consecutive issues..." etc. | Array of strings |
| Footer tagline | "Double Your Reach. Double Your Impact." | Single line |

---

### Technical Implementation

#### 1. Extend Default Content Structure

**File: `src/hooks/useAdvertisingContent.ts`**

Add new sections to `defaultAdvertisingContent`:

```typescript
roiSection: {
  mainHeading: "The all important question:",
  subHeading1: "How Much Does it Cost to Advertise?",
  subHeading2: "And What Could your Return (ROI) be?",
  description: "It's difficult to project as there are so many factors that affect ROI. The better these factors are handled the better the end result. The % scales are industry standard. Nothing is guaranteed but we hope this shows we are invested in value for money and results."
},
productSection: {
  title: "The Product",
  subtitle: "What makes a magazine effective",
  features: [
    { title: "Circulation", description: "How many copies are printed—the more printed, the more potential readers and customers" },
    { title: "Distribution Method", description: "Targeted letterbox delivery vs untargeted pick-up (prone to waste)" },
    { title: "Audience Targeting", description: "Who is the magazine aimed at? Where exactly is it delivered?" },
    { title: "Delivery Reliability", description: "Is delivery tracked? Is it reliable?" },
    { title: "Editorial Balance", description: "Good ratio of editorial to adverts = engaged readers" },
    { title: "Editorial Quality", description: "Varied, interesting, local, and topical content" }
  ]
},
advertiserSection: {
  title: "The Advertiser",
  subtitle: "What you bring to the table",
  features: [
    { title: "Right Ad Size", description: "Is the advert the right size for your type of business?" },
    { title: "Design Quality", description: "Is the advert selling or just telling? Professional design matters" },
    { title: "Response Management", description: "Unanswered calls going to voicemail is not well-managed response" },
    { title: "Measuring Correctly", description: "Are you measuring response or only the result?" }
  ],
  footerText: "Remember: Advertising generates response, you create the result"
},
bogofPromo: {
  badge: "New Advertisers Only",
  headline: "SEEING DOUBLE",
  offerDescription: "For Every Area Booked We Give You One Area FREE for 6 months",
  packageHeading: "3+ Repeat Package for New Advertisers",
  benefits: [
    "Minimum commitment is 3 consecutive issues = 6 months advertising",
    "Great opportunity to test and trial areas",
    "Mix the advert sizes, advert designs to experiment",
    "Paid on monthly payment plan",
    "After six months: continue, change areas/size, or cancel"
  ],
  footerTagline: "Double Your Reach. Double Your Impact."
}
```

#### 2. Add Helper Functions for Array Updates

**File: `src/hooks/useAdvertisingContent.ts`**

Add new helpers:

```typescript
// Update feature in product/advertiser sections
const updateFeature = (
  section: 'productSection' | 'advertiserSection',
  index: number,
  field: 'title' | 'description',
  value: string
) => {
  const newFeatures = [...content[section].features];
  newFeatures[index] = { ...newFeatures[index], [field]: value };
  updateMutation.mutate({ [section]: { features: newFeatures } });
};

// Update BOGOF benefit
const updateBogofBenefit = (index: number, value: string) => {
  const newBenefits = [...content.bogofPromo.benefits];
  newBenefits[index] = value;
  updateMutation.mutate({ bogofPromo: { benefits: newBenefits } });
};
```

#### 3. Update ROIFactorsInfo Component

**File: `src/components/ROIFactorsInfo.tsx`**

Changes:
- Accept content and update functions as props
- Wrap all text elements with `EditableText` component
- Import from inline-editor

```tsx
interface ROIFactorsInfoProps {
  content: AdvertisingContent;
  updateField: (path: string, value: string) => void;
  updateFeature: (section: 'productSection' | 'advertiserSection', index: number, field: 'title' | 'description', value: string) => void;
}

const ROIFactorsInfo: React.FC<ROIFactorsInfoProps> = ({ content, updateField, updateFeature }) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative ...">
        <EditableText
          value={content.roiSection.mainHeading}
          onSave={(val) => updateField('roiSection.mainHeading', val)}
          as="h2"
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
        />
        {/* ... more EditableText components */}
      </div>

      {/* Product Features - map through array */}
      {content.productSection.features.map((point, index) => (
        <li key={index}>
          <EditableText
            value={point.title}
            onSave={(val) => updateFeature('productSection', index, 'title', val)}
            as="span"
            className="font-bold text-community-navy block"
          />
          <EditableText
            value={point.description}
            onSave={(val) => updateFeature('productSection', index, 'description', val)}
            as="span"
            className="text-muted-foreground text-sm"
          />
        </li>
      ))}
    </div>
  );
};
```

#### 4. Update NewAdvertiserPromo Component

**File: `src/components/NewAdvertiserPromo.tsx`**

Changes:
- Accept content and update functions as props
- Wrap all text elements with `EditableText`
- Benefits array rendered with editable items

```tsx
interface NewAdvertiserPromoProps {
  content: AdvertisingContent;
  updateField: (path: string, value: string) => void;
  updateBogofBenefit: (index: number, value: string) => void;
}

const NewAdvertiserPromo: React.FC<NewAdvertiserPromoProps> = ({ 
  content, 
  updateField, 
  updateBogofBenefit 
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Badge */}
      <Badge>
        <EditableText
          value={content.bogofPromo.badge}
          onSave={(val) => updateField('bogofPromo.badge', val)}
          as="span"
        />
      </Badge>

      {/* Headline */}
      <EditableText
        value={content.bogofPromo.headline}
        onSave={(val) => updateField('bogofPromo.headline', val)}
        as="h2"
        className="text-4xl md:text-5xl lg:text-6xl font-black text-white"
      />

      {/* Benefits - editable array */}
      {content.bogofPromo.benefits.map((benefit, index) => (
        <div key={index}>
          <EditableText
            value={benefit}
            onSave={(val) => updateBogofBenefit(index, val)}
            as="span"
            className="text-slate-300 text-sm"
          />
        </div>
      ))}
    </div>
  );
};
```

#### 5. Update QuickQuoteCalculator

**File: `src/components/QuickQuoteCalculator.tsx`**

Pass content and update functions to child components:

```tsx
const QuickQuoteCalculator: React.FC = () => {
  const { content, updateField, updateFeature, updateBogofBenefit } = useAdvertisingContent();

  return (
    <div className="space-y-8">
      <ROIFactorsInfo 
        content={content}
        updateField={updateField}
        updateFeature={updateFeature}
      />
      
      <NewAdvertiserPromo 
        content={content}
        updateField={updateField}
        updateBogofBenefit={updateBogofBenefit}
      />
      
      {/* ... rest of calculator */}
    </div>
  );
};
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAdvertisingContent.ts` | Add new section defaults + helper functions |
| `src/components/ROIFactorsInfo.tsx` | Convert to accept props, wrap text in EditableText |
| `src/components/NewAdvertiserPromo.tsx` | Convert to accept props, wrap text in EditableText |
| `src/components/QuickQuoteCalculator.tsx` | Pass content/update props to child components |

---

### Content Structure in Database

The `content_blocks` table entry with `position = 'advertising'` will store all content in a single JSONB field:

```json
{
  "hero": { ... },
  "stats": [ ... ],
  "loveSection": { ... },
  "mediaPack": { ... },
  "editionsMap": { ... },
  "calculatorSection": { ... },
  "enquirySection": { ... },
  "roiSection": {
    "mainHeading": "The all important question:",
    "subHeading1": "How Much Does it Cost to Advertise?",
    "subHeading2": "And What Could your Return (ROI) be?",
    "description": "It's difficult to project..."
  },
  "productSection": {
    "title": "The Product",
    "subtitle": "What makes a magazine effective",
    "features": [
      { "title": "Circulation", "description": "..." },
      ...
    ]
  },
  "advertiserSection": {
    "title": "The Advertiser",
    "subtitle": "What you bring to the table",
    "features": [ ... ],
    "footerText": "Remember: Advertising generates response, you create the result"
  },
  "bogofPromo": {
    "badge": "New Advertisers Only",
    "headline": "SEEING DOUBLE",
    "offerDescription": "For Every Area Booked...",
    "packageHeading": "3+ Repeat Package...",
    "benefits": [ ... ],
    "footerTagline": "Double Your Reach..."
  }
}
```

---

### Admin Experience

When an admin enables edit mode:

1. **ROI Header Section**: All text becomes editable with click-to-edit
2. **The Product Card**: 
   - Title and subtitle editable
   - Each of the 6 feature titles and descriptions editable
3. **The Advertiser Card**:
   - Title, subtitle, footer editable
   - Each of the 4 feature items editable
4. **SEEING DOUBLE Section**:
   - Badge text, headline, offer description editable
   - Package heading and each benefit bullet editable
   - Footer tagline editable

All changes auto-save to the database with toast confirmation.

---

### Security

- Edit mode toggle only visible to admin users (existing `isAdmin` check)
- All updates go through Supabase RLS policies (existing "Only admins can manage content blocks" policy)
- Content sanitized through React's built-in XSS protection

