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
  basePrice: number; // Base price per area
  dimensions?: string;
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

// Extended ad sizes based on real pricing structure
export const adSizes: AdSize[] = [
  { 
    id: 'business-card', 
    label: 'Business Card', 
    description: '90mm x 55mm',
    basePrice: 85,
    dimensions: '90mm x 55mm'
  },
  { 
    id: 'eighth-page', 
    label: '1/8 Page', 
    description: 'Quarter column',
    basePrice: 165,
    dimensions: '90mm x 130mm'
  },
  { 
    id: 'quarter-page', 
    label: '1/4 Page', 
    description: 'Half column',
    basePrice: 285,
    dimensions: '186mm x 130mm'
  },
  { 
    id: 'half-page', 
    label: '1/2 Page', 
    description: 'Full column or half page horizontal',
    basePrice: 525,
    dimensions: '186mm x 265mm or 380mm x 130mm'
  },
  { 
    id: 'full-page', 
    label: 'Full Page', 
    description: 'Full page',
    basePrice: 985,
    dimensions: '380mm x 265mm'
  },
  { 
    id: 'double-page', 
    label: 'Double Page Spread', 
    description: 'Center spread',
    basePrice: 1850,
    dimensions: '760mm x 265mm'
  },
  { 
    id: 'loose-insert', 
    label: 'Loose Insert', 
    description: 'A4/A5 loose insert',
    basePrice: 425,
    dimensions: 'A4 or A5'
  }
];

// Extended duration options with proper discount multipliers
export const durations: Duration[] = [
  { 
    id: '1-month', 
    label: '1 Month', 
    months: 1, 
    discountMultiplier: 1.0 
  },
  { 
    id: '3-months', 
    label: '3 Months', 
    months: 3, 
    discountMultiplier: 2.7 // 10% discount
  },
  { 
    id: '6-months', 
    label: '6 Months', 
    months: 6, 
    discountMultiplier: 5.1 // 15% discount
  },
  { 
    id: '12-months', 
    label: '12 Months', 
    months: 12, 
    discountMultiplier: 9.6 // 20% discount
  },
  { 
    id: 'subscription-quarterly', 
    label: 'Subscription (Quarterly)', 
    months: 3, 
    discountMultiplier: 2.4, // 20% subscription discount
    isSubscription: true
  },
  { 
    id: 'subscription-annually', 
    label: 'Subscription (Annual)', 
    months: 12, 
    discountMultiplier: 8.4, // 30% subscription discount
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