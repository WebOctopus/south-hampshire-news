// Leafleting service specific pricing data based on uploaded specifications

export interface LeafletSchedule {
  month: string;
  copyDeadline: string;
  printDeadline: string;
  delivery: string;
  circulation: number;
}

export interface LeafletArea {
  id: string;
  areaNumber: number;
  name: string;
  postcodes: string;
  bimonthlyCirculation: number;
  priceWithVat: number; // £ + VAT as shown in the image
  schedule: LeafletSchedule[];
}

export interface LeafletSize {
  id: string;
  label: string;
  description?: string;
}

// 12 leafleting areas from the uploaded image with 2025-2026 schedule
export const leafletAreas: LeafletArea[] = [
  {
    id: 'leaflet-area-1',
    areaNumber: 1,
    name: 'Southampton',
    postcodes: 'SO15, SO16, SO17',
    bimonthlyCirculation: 7100,
    priceWithVat: 315,
    schedule: [
      { month: 'October 2025', copyDeadline: '19 Sept', printDeadline: '19 Sept', delivery: '7 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '11 Nov', printDeadline: '14 Nov', delivery: '1 Dec', circulation: 71540 },
      { month: 'February 2026', copyDeadline: '13 Jan', printDeadline: '16 Jan', delivery: '29 Jan', circulation: 71540 }
    ]
  },
  {
    id: 'leaflet-area-2',
    areaNumber: 2,
    name: "Chandler's Ford",
    postcodes: 'SO53',
    bimonthlyCirculation: 11300,
    priceWithVat: 508,
    schedule: [
      { month: 'September 2025', copyDeadline: '18 Aug', printDeadline: '20 Aug', delivery: '1 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '17 Oct', printDeadline: '22 Oct', delivery: '30 Oct', circulation: 70600 },
      { month: 'January 2026', copyDeadline: '12 Dec', printDeadline: '17 Dec', delivery: '7 Jan', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-3',
    areaNumber: 3,
    name: 'Eastleigh',
    postcodes: 'SO50',
    bimonthlyCirculation: 12500,
    priceWithVat: 562,
    schedule: [
      { month: 'October 2025', copyDeadline: '29 Sept', printDeadline: '29 Sept', delivery: '8 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '15 Nov', printDeadline: '18 Nov', delivery: '2 Dec', circulation: 71540 },
      { month: 'February 2026', copyDeadline: '16 Jan', printDeadline: '20 Jan', delivery: '30 Jan', circulation: 71540 }
    ]
  },
  {
    id: 'leaflet-area-4',
    areaNumber: 4,
    name: 'Hedge End & Botley',
    postcodes: 'SO30',
    bimonthlyCirculation: 9400,
    priceWithVat: 423,
    schedule: [
      { month: 'September 2025', copyDeadline: '18 Aug', printDeadline: '20 Aug', delivery: '2 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '17 Oct', printDeadline: '22 Oct', delivery: '31 Oct', circulation: 70600 },
      { month: 'January 2026', copyDeadline: '12 Dec', printDeadline: '17 Dec', delivery: '8 Jan', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-5',
    areaNumber: 5,
    name: 'Locks Heath',
    postcodes: 'SO31, PO15',
    bimonthlyCirculation: 12000,
    priceWithVat: 540,
    schedule: [
      { month: 'September 2025', copyDeadline: '18 Aug', printDeadline: '20 Aug', delivery: '4 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '17 Oct', printDeadline: '22 Oct', delivery: '3 Nov', circulation: 70600 },
      { month: 'January 2026', copyDeadline: '16 Jan', printDeadline: '21 Jan', delivery: '3 Feb', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-6',
    areaNumber: 6,
    name: 'Fareham & Villages',
    postcodes: 'PO12, PO13, PO14, PO16',
    bimonthlyCirculation: 12100,
    priceWithVat: 544,
    schedule: [
      { month: 'September 2025', copyDeadline: '18 Aug', printDeadline: '20 Aug', delivery: '5 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '17 Oct', printDeadline: '22 Oct', delivery: '5 Nov', circulation: 70600 },
      { month: 'March 2026', copyDeadline: '17 Feb', printDeadline: '20 Feb', delivery: '3 Mar', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-8',
    areaNumber: 8,
    name: 'Winchester',
    postcodes: 'SO21, SO22, SO23',
    bimonthlyCirculation: 8000,
    priceWithVat: 360,
    schedule: [
      { month: 'September 2025', copyDeadline: '13 Aug', printDeadline: '15 Aug', delivery: '5 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '12 Feb', printDeadline: '17 Oct', delivery: '5 Nov', circulation: 70600 },
      { month: 'March 2026', copyDeadline: '12 Feb', printDeadline: '16 Feb', delivery: '2 Mar', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-9',
    areaNumber: 9,
    name: 'Romsey & NB',
    postcodes: 'SO51, SO52',
    bimonthlyCirculation: 8600,
    priceWithVat: 387,
    schedule: [
      { month: 'September 2025', copyDeadline: '13 Aug', printDeadline: '15 Aug', delivery: '1 Sept', circulation: 70600 },
      { month: 'November 2025', copyDeadline: '14 Oct', printDeadline: '17 Oct', delivery: '3 Nov', circulation: 70600 },
      { month: 'March 2026', copyDeadline: '12 Feb', printDeadline: '16 Feb', delivery: '2 Mar', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-10',
    areaNumber: 10,
    name: 'Totton',
    postcodes: 'SO40, SO45',
    bimonthlyCirculation: 11000,
    priceWithVat: 495,
    schedule: [
      { month: 'October 2025', copyDeadline: '29 Sept', printDeadline: '29 Sept', delivery: '10 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '19 Nov', printDeadline: '21 Nov', delivery: '4 Dec', circulation: 71540 },
      { month: 'February 2026', copyDeadline: '16 Jan', printDeadline: '21 Jan', delivery: '3 Feb', circulation: 71540 }
    ]
  },
  {
    id: 'leaflet-area-11',
    areaNumber: 11,
    name: 'New Forest & Waterside',
    postcodes: 'SO40',
    bimonthlyCirculation: 7000,
    priceWithVat: 315,
    schedule: [
      { month: 'October 2025', copyDeadline: '19 Sept', printDeadline: '19 Sept', delivery: '7 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '11 Nov', printDeadline: '14 Nov', delivery: '4 Dec', circulation: 71540 },
      { month: 'February 2026', copyDeadline: '13 Jan', printDeadline: '16 Jan', delivery: '29 Jan', circulation: 71540 }
    ]
  },
  {
    id: 'leaflet-area-12',
    areaNumber: 12,
    name: 'Sholing & Itchen',
    postcodes: 'SO19',
    bimonthlyCirculation: 7000,
    priceWithVat: 315,
    schedule: [
      { month: 'October 2025', copyDeadline: '29 Sept', printDeadline: '29 Sept', delivery: '10 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '19 Nov', printDeadline: '21 Nov', delivery: '5 Dec', circulation: 71540 },
      { month: 'February 2026', copyDeadline: '16 Jan', printDeadline: '21 Jan', delivery: '3 Feb', circulation: 71540 }
    ]
  },
  {
    id: 'leaflet-area-13',
    areaNumber: 13,
    name: 'Southampton East',
    postcodes: 'SO31',
    bimonthlyCirculation: 9200,
    priceWithVat: 415,
    schedule: [
      { month: 'October 2025', copyDeadline: '19 Sept', printDeadline: '19 Sept', delivery: '7 Oct', circulation: 71540 },
      { month: 'December 2025', copyDeadline: '17 Oct', printDeadline: '22 Oct', delivery: '3 Nov', circulation: 71540 },
      { month: 'March 2026', copyDeadline: '17 Feb', printDeadline: '20 Feb', delivery: '2 Mar', circulation: 70600 }
    ]
  },
  {
    id: 'leaflet-area-14',
    areaNumber: 14,
    name: 'Test Valley',
    postcodes: 'SO31',
    bimonthlyCirculation: 8500,
    priceWithVat: 382,
    schedule: [
      { month: 'September 2025', copyDeadline: '13 Aug', printDeadline: '15 Aug', delivery: '1 Sept', circulation: 70600 },
      { month: 'December 2025', copyDeadline: '9 Dec', printDeadline: '12 Dec', delivery: '5 Jan', circulation: 70600 },
      { month: 'March 2026', copyDeadline: '12 Feb', printDeadline: '16 Feb', delivery: '2 Mar', circulation: 70600 }
    ]
  }
];

// Leaflet size options from the uploaded image
export const leafletSizes: LeafletSize[] = [
  {
    id: 'a5-single',
    label: 'A5 single sided',
    description: 'Standard A5 leaflet, single sided'
  },
  {
    id: 'a5-double',
    label: 'A5 double sided',
    description: 'Standard A5 leaflet, double sided'
  },
  {
    id: 'a5-folded-a4',
    label: 'A5 - folded A4 (4 sides)',
    description: 'A4 sheet folded to A5 size, 4 sides'
  },
  {
    id: 'menu-trifold',
    label: 'Menu/Price List - A4 tri-fold',
    description: 'A4 tri-fold for menus and price lists'
  },
  {
    id: 'postcard',
    label: 'Post card/ compliment slip',
    description: 'Postcard or compliment slip format'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Custom specification'
  }
];

// Leafleting discount tiers for multi-area bookings (10% discount shown in image)
export const leafletVolumeDiscounts = [
  { minAreas: 1, maxAreas: 1, discountPercentage: 0 },
  { minAreas: 2, maxAreas: 12, discountPercentage: 10 }
];