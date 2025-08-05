// Comprehensive advertising pricing data based on Excel specifications

export interface Area {
  id: string;
  name: string;
  postcodes: string;
  townsVillages: string;
  circulation: number;
  // Area-specific pricing multipliers for different ad sizes
  pricingMultipliers: {
    [adSizeId: string]: number;
  };
}

export interface AdSize {
  id: string;
  label: string;
  description?: string;
  dimensions: string;
  // Area-specific pricing for 1-3 issues (columns 1-14 from Excel)
  areaPricing: {
    perMonth: number[];
    perArea: number[];
  };
}

export interface Duration {
  id: string;
  label: string;
  months: number;
  discountMultiplier: number; // Applied to total price
  isSubscription?: boolean;
}

export interface PricingTier {
  minAreas: number;
  maxAreas: number;
  discountPercentage: number;
}

// Updated areas with circulation-based pricing multipliers
export const areas: Area[] = [
  { 
    id: 'area1', 
    name: 'SOUTHAMPTON CITY', 
    postcodes: 'SO15 SO16 SO17', 
    townsVillages: 'Chilworth, Upper Shirley, Rownhams, Bassett, Highfield', 
    circulation: 10000,
    pricingMultipliers: {
      'eighth-page': 1.0,
      'quarter-page': 1.0,
      'half-page': 1.0,
      'full-page': 1.0,
      'double-page': 1.0,
      'loose-insert': 0.85,
      'business-card': 0.4
    }
  },
  { 
    id: 'area2', 
    name: 'CHANDLER\'S FORD', 
    postcodes: 'SO53 SO52', 
    townsVillages: 'Chandler\'s Ford, North Baddesley', 
    circulation: 11300,
    pricingMultipliers: {
      'eighth-page': 1.0,
      'quarter-page': 1.0,
      'half-page': 1.0,
      'full-page': 1.0,
      'double-page': 1.0,
      'loose-insert': 0.85,
      'business-card': 0.4
    }
  },
  { 
    id: 'area3', 
    name: 'EASTLEIGH & VILLAGES', 
    postcodes: 'SO50', 
    townsVillages: 'Fair Oak, Bishopstoke, Horton Heath, Allbrook, Boyatt Wood, Eastleigh', 
    circulation: 12500,
    pricingMultipliers: {
      'eighth-page': 0.85,
      'quarter-page': 0.85,
      'half-page': 0.85,
      'full-page': 0.85,
      'double-page': 0.85,
      'loose-insert': 0.75,
      'business-card': 0.35
    }
  },
  { 
    id: 'area4', 
    name: 'HEDGE END & BOTLEY', 
    postcodes: 'SO30', 
    townsVillages: 'Hedge End, West End, Botley', 
    circulation: 9400,
    pricingMultipliers: {
      'eighth-page': 0.95,
      'quarter-page': 0.95,
      'half-page': 0.95,
      'full-page': 0.95,
      'double-page': 0.95,
      'loose-insert': 0.8,
      'business-card': 0.38
    }
  },
  { 
    id: 'area5', 
    name: 'LOCKS HEATH & VILLAGES', 
    postcodes: 'SO31', 
    townsVillages: 'Locks Heath, Warsash, Swanwick, Bursledon, Hamble, Netley', 
    circulation: 12000,
    pricingMultipliers: {
      'eighth-page': 0.95,
      'quarter-page': 0.95,
      'half-page': 0.95,
      'full-page': 0.95,
      'double-page': 0.95,
      'loose-insert': 0.8,
      'business-card': 0.38
    }
  },
  { 
    id: 'area6', 
    name: 'FAREHAM & VILLAGES', 
    postcodes: 'PO13 PO14 PO15', 
    townsVillages: 'Fareham, Titchfield, Stubbington, Lee on Solent, Hill Head', 
    circulation: 12100,
    pricingMultipliers: {
      'eighth-page': 1.05,
      'quarter-page': 1.05,
      'half-page': 1.05,
      'full-page': 1.05,
      'double-page': 1.05,
      'loose-insert': 0.9,
      'business-card': 0.42
    }
  },
  { 
    id: 'area7', 
    name: 'MEON VALLEY', 
    postcodes: 'SO32 PO17', 
    townsVillages: 'Wickham, Bishop\'s Waltham', 
    circulation: 12400,
    pricingMultipliers: {
      'eighth-page': 1.05,
      'quarter-page': 1.05,
      'half-page': 1.05,
      'full-page': 1.05,
      'double-page': 1.05,
      'loose-insert': 0.9,
      'business-card': 0.42
    }
  },
  { 
    id: 'area8', 
    name: 'WINCHESTER & VILLAGES', 
    postcodes: 'SO21 SO22 SO23', 
    townsVillages: 'Winchester, Otterbourne, Colden Common, Hursley, Crawley, South Wonston, Littleton, Sparsholt', 
    circulation: 12000,
    pricingMultipliers: {
      'eighth-page': 1.0,
      'quarter-page': 1.0,
      'half-page': 1.0,
      'full-page': 1.0,
      'double-page': 1.0,
      'loose-insert': 0.85,
      'business-card': 0.4
    }
  },
  { 
    id: 'area9', 
    name: 'ROMSEY & N BADDESLEY', 
    postcodes: 'SO51 SO20', 
    townsVillages: 'Romsey, Stockbridge, The Wellows, Braishfield, Ampfield, Kings Somborne', 
    circulation: 8600,
    pricingMultipliers: {
      'eighth-page': 1.15,
      'quarter-page': 1.15,
      'half-page': 1.15,
      'full-page': 1.15,
      'double-page': 1.15,
      'loose-insert': 0.95,
      'business-card': 0.45
    }
  },
  { 
    id: 'area10', 
    name: 'TOTTON', 
    postcodes: 'SO40 SO45', 
    townsVillages: 'Totton, Marchwood, Hythe, Dibden, Dibden Purlieu, Holbury, Blackfield', 
    circulation: 7000,
    pricingMultipliers: {
      'eighth-page': 1.05,
      'quarter-page': 1.05,
      'half-page': 1.05,
      'full-page': 1.05,
      'double-page': 1.05,
      'loose-insert': 0.9,
      'business-card': 0.42
    }
  },
  { 
    id: 'area11', 
    name: 'NEW FOREST & WATERSIDE', 
    postcodes: 'SO41 SO42 SO43 BH24 4', 
    townsVillages: 'Lymington, Brockenhurst, Lyndhurst, New Milton, Beaulieu', 
    circulation: 10640,
    pricingMultipliers: {
      'eighth-page': 1.0,
      'quarter-page': 1.0,
      'half-page': 1.0,
      'full-page': 1.0,
      'double-page': 1.0,
      'loose-insert': 0.85,
      'business-card': 0.4
    }
  },
  { 
    id: 'area12', 
    name: 'SHOLING, PEARTREE, ITCHEN, WOOLSTON', 
    postcodes: 'PO9 PO10 PO11 PO12', 
    townsVillages: 'Havant, Waterlooville, Emsworth, Cosham, Drayton, Denmead', 
    circulation: 7000,
    pricingMultipliers: {
      'eighth-page': 1.15,
      'quarter-page': 1.15,
      'half-page': 1.15,
      'full-page': 1.15,
      'double-page': 1.15,
      'loose-insert': 0.95,
      'business-card': 0.45
    }
  },
  { 
    id: 'area13', 
    name: 'SOUTHAMPTON EAST', 
    postcodes: 'PO6 PO7 PO8', 
    townsVillages: 'Cosham, Drayton, Farlington, Widley, Purbrook', 
    circulation: 9200,
    pricingMultipliers: {
      'eighth-page': 1.1,
      'quarter-page': 1.1,
      'half-page': 1.1,
      'full-page': 1.1,
      'double-page': 1.1,
      'loose-insert': 0.92,
      'business-card': 0.43
    }
  },
  { 
    id: 'area14', 
    name: 'TEST VALLEY & STOCKBRIDGE', 
    postcodes: 'PO1 PO2 PO3 PO4 PO5', 
    townsVillages: 'Portsmouth, Southsea, Eastney, Milton, Fratton', 
    circulation: 8000,
    pricingMultipliers: {
      'eighth-page': 1.2,
      'quarter-page': 1.2,
      'half-page': 1.2,
      'full-page': 1.2,
      'double-page': 1.2,
      'loose-insert': 1.0,
      'business-card': 0.48
    }
  }
];

// Fixed rates ad sizes for non-subscription pricing (1-3 issues)
export const fixedRatesAdSizes: AdSize[] = [
  { 
    id: 'full-page', 
    label: 'Full Page', 
    description: '132 x 190',
    dimensions: '132 x 190',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [298, 582, 858, 1128, 1390, 1646, 1896, 2140, 2384, 2620, 2854, 3088, 3322, 3550],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [298, 284, 276, 270, 262, 256, 250, 244, 240, 236, 234, 234, 234, 228]
    }
  },
  { 
    id: 'two-thirds-page', 
    label: '2/3 Page', 
    description: '132 x 125.33',
    dimensions: '132 x 125.33',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [226, 429, 628, 820, 997, 1166, 1324, 1483, 1641, 1799, 1957, 2115, 2274, 2432],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [226, 203, 199, 192, 177, 169, 158, 159, 158, 158, 158, 158, 159, 158]
    }
  },
  { 
    id: 'half-page', 
    label: '1/2 Page', 
    description: '132 x 93',
    dimensions: '132 x 93',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [180, 342, 500, 653, 794, 929, 1055, 1181, 1307, 1433, 1559, 1685, 1811, 1937],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [180, 162, 158, 153, 141, 135, 126, 126, 126, 126, 126, 126, 126, 126]
    }
  },
  { 
    id: 'one-third-page', 
    label: '1/3 Page', 
    description: '132 x 60.66',
    dimensions: '132 x 60.66',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [174, 331, 484, 632, 767, 898, 1020, 1141, 1263, 1385, 1507, 1629, 1750, 1872],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [174, 157, 153, 148, 135, 131, 122, 121, 122, 122, 122, 122, 121, 122]
    }
  },
  { 
    id: 'quarter-page', 
    label: '1/4 Page', 
    description: '64 x 93',
    dimensions: '64 x 93',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [112, 213, 311, 407, 494, 578, 656, 735, 813, 892, 970, 1048, 1127, 1205],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [112, 101, 98, 96, 87, 84, 78, 79, 78, 79, 78, 78, 79, 78]
    }
  },
  { 
    id: 'sixth-page', 
    label: '1/6 Page', 
    description: '64 x 60.66',
    dimensions: '64 x 60.66',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [73, 128, 181, 232, 281, 325, 362, 398, 435, 471, 508, 545, 581, 618],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [73, 55, 53, 51, 49, 44, 37, 36, 37, 36, 37, 37, 36, 37]
    }
  },
  { 
    id: 'eighth-page', 
    label: '1/8 Page', 
    description: '64 x 45.5',
    dimensions: '64 x 45.5',
    areaPricing: {
      // Fixed rates pricing for areas 1-14 from Excel (cumulative pricing)
      perMonth: [54, 95, 134, 172, 209, 242, 269, 296, 324, 351, 378, 405, 432, 460],
      // Per area pricing for areas 1-14 (individual area rates)
      perArea: [54, 41, 39, 38, 37, 33, 27, 27, 28, 27, 27, 27, 27, 28]
    }
  }
];

// Subscription ad sizes for subscription pricing
export const subscriptionAdSizes: AdSize[] = [
  { 
    id: 'full-page', 
    label: 'Full Page', 
    description: '132 x 190',
    dimensions: '132 x 190',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [254, 476, 684, 884, 1080, 1268, 1448, 1620, 1788, 1952, 2112, 2272, 2432, 2592],
      // Per area pricing for areas 1-14
      perArea: [254, 222, 208, 200, 196, 188, 180, 172, 168, 164, 160, 160, 160, 160]
    }
  },
  { 
    id: 'two-thirds-page', 
    label: '2/3 Page', 
    description: '132 x 125.33',
    dimensions: '132 x 125.33',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [204, 357, 504, 647, 785, 908, 1010, 1112, 1214, 1316, 1418, 1520, 1622, 1724],
      // Per area pricing for areas 1-14
      perArea: [204, 153, 147, 143, 138, 123, 102, 102, 102, 102, 102, 102, 102, 102]
    }
  },
  { 
    id: 'half-page', 
    label: '1/2 Page', 
    description: '132 x 93',
    dimensions: '132 x 93',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [153, 268, 378, 485, 589, 681, 757, 834, 910, 987, 1063, 1140, 1216, 1293],
      // Per area pricing for areas 1-14
      perArea: [153, 115, 110, 107, 104, 92, 76, 77, 76, 77, 76, 77, 76, 77]
    }
  },
  { 
    id: 'one-third-page', 
    label: '1/3 Page', 
    description: '132 x 60.66',
    dimensions: '132 x 60.66',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [148, 259, 365, 469, 569, 658, 732, 806, 880, 954, 1028, 1102, 1176, 1250],
      // Per area pricing for areas 1-14
      perArea: [148, 111, 106, 104, 100, 89, 74, 74, 74, 74, 74, 74, 74, 74]
    }
  },
  { 
    id: 'quarter-page', 
    label: '1/4 Page', 
    description: '64 x 93',
    dimensions: '64 x 93',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [95, 167, 235, 302, 367, 424, 471, 519, 566, 614, 662, 709, 757, 804],
      // Per area pricing for areas 1-14
      perArea: [95, 72, 68, 67, 65, 57, 47, 48, 47, 48, 48, 47, 48, 47]
    }
  },
  { 
    id: 'sixth-page', 
    label: '1/6 Page', 
    description: '64 x 60.66',
    dimensions: '64 x 60.66',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [73, 128, 181, 232, 281, 325, 362, 398, 435, 471, 508, 545, 581, 618],
      // Per area pricing for areas 1-14
      perArea: [73, 55, 53, 51, 49, 44, 37, 36, 37, 36, 37, 37, 36, 37]
    }
  },
  { 
    id: 'eighth-page', 
    label: '1/8 Page', 
    description: '64 x 45.5',
    dimensions: '64 x 45.5',
    areaPricing: {
      // Subscription per issue pricing for areas 1-14 from Excel
      perMonth: [54, 95, 134, 172, 209, 242, 269, 296, 324, 351, 378, 405, 432, 460],
      // Per area pricing for areas 1-14
      perArea: [54, 41, 39, 38, 37, 33, 27, 27, 28, 27, 27, 27, 27, 28]
    }
  }
];

// Default export for backward compatibility (uses fixed rates)
export const adSizes = fixedRatesAdSizes;

// Duration options for 1,2 or 3 issues - fixed booking
export const durations: Duration[] = [
  { 
    id: '1-issue', 
    label: '1 Issue', 
    months: 1, 
    discountMultiplier: 1.0 
  },
  { 
    id: '2-issues', 
    label: '2 Issues', 
    months: 2, 
    discountMultiplier: 2.0
  },
  { 
    id: '3-issues', 
    label: '3 Issues', 
    months: 3, 
    discountMultiplier: 3.0
  }
];

// Subscription duration options
export const subscriptionDurations: Duration[] = [
  { 
    id: '6-months', 
    label: '6 Months', 
    months: 6, 
    discountMultiplier: 6.0,
    isSubscription: true
  },
  { 
    id: '12-months', 
    label: '12 Months', 
    months: 12, 
    discountMultiplier: 12.0,
    isSubscription: true
  }
];

// Volume discount tiers
export const volumeDiscounts: PricingTier[] = [
  { minAreas: 1, maxAreas: 2, discountPercentage: 0 },
  { minAreas: 3, maxAreas: 5, discountPercentage: 5 },
  { minAreas: 6, maxAreas: 9, discountPercentage: 10 },
  { minAreas: 10, maxAreas: 14, discountPercentage: 15 }
];