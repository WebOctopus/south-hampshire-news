// Leafleting service specific pricing data based on uploaded specifications

export interface LeafletArea {
  id: string;
  areaNumber: number;
  name: string;
  postcodes: string;
  bimonthlyCirculation: number;
  priceWithVat: number; // £ + VAT as shown in the image
}

export interface LeafletSize {
  id: string;
  label: string;
  description?: string;
}

// 12 leafleting areas from the uploaded image
export const leafletAreas: LeafletArea[] = [
  {
    id: 'leaflet-area-1',
    areaNumber: 1,
    name: 'Southampton City',
    postcodes: 'SO15, SO16, SO17',
    bimonthlyCirculation: 7100,
    priceWithVat: 315
  },
  {
    id: 'leaflet-area-2',
    areaNumber: 2,
    name: "Chandler's Ford",
    postcodes: 'SO53',
    bimonthlyCirculation: 11300,
    priceWithVat: 508
  },
  {
    id: 'leaflet-area-3',
    areaNumber: 3,
    name: 'Eastleigh & Villages',
    postcodes: 'SO50',
    bimonthlyCirculation: 12500,
    priceWithVat: 562
  },
  {
    id: 'leaflet-area-4',
    areaNumber: 4,
    name: 'Hedge End & Botley',
    postcodes: 'SO30',
    bimonthlyCirculation: 9400,
    priceWithVat: 423
  },
  {
    id: 'leaflet-area-5',
    areaNumber: 5,
    name: 'Locksheath, Whiteley, Warsash & Surrounds',
    postcodes: 'SO31, PO15',
    bimonthlyCirculation: 12000,
    priceWithVat: 540
  },
  {
    id: 'leaflet-area-6',
    areaNumber: 6,
    name: 'Fareham West, Titchfield, Stubbington & Lee-on-the-Solent',
    postcodes: 'PO12, PO13, PO14, PO16',
    bimonthlyCirculation: 12100,
    priceWithVat: 544
  },
  {
    id: 'leaflet-area-8',
    areaNumber: 8,
    name: 'Winchester & Villages',
    postcodes: 'SO21, SO22, SO23',
    bimonthlyCirculation: 8000,
    priceWithVat: 360
  },
  {
    id: 'leaflet-area-9',
    areaNumber: 9,
    name: 'Romsey & North Baddesley',
    postcodes: 'SO51, SO52',
    bimonthlyCirculation: 8600,
    priceWithVat: 387
  },
  {
    id: 'leaflet-area-10',
    areaNumber: 10,
    name: 'Totton, Marchwood, Hythe & Dibden',
    postcodes: 'SO40, SO45',
    bimonthlyCirculation: 11000,
    priceWithVat: 495
  },
  {
    id: 'leaflet-area-11',
    areaNumber: 11,
    name: 'Totton only',
    postcodes: 'SO40',
    bimonthlyCirculation: 7000,
    priceWithVat: 315
  },
  {
    id: 'leaflet-area-12',
    areaNumber: 12,
    name: 'Sholing, Itchen, Peartree & Woolston',
    postcodes: 'SO19',
    bimonthlyCirculation: 7000,
    priceWithVat: 315
  },
  {
    id: 'leaflet-area-13',
    areaNumber: 13,
    name: 'Hamble, Bursledon & Netley',
    postcodes: 'SO31',
    bimonthlyCirculation: 9200,
    priceWithVat: 415
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