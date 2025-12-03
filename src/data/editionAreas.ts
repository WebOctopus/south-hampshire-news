// Interactive map edition areas data
// Based on the InDesign exported HTML structure

export interface EditionArea {
  id: number;
  name: string;
  postcodes: string;
  homes: number;
  color: string; // Hex color for the area
  highlightImage: string; // PNG filename for highlighted state
  buttonPosition: { top: number; left: number }; // Position as percentage
  coverageDetails: string;
  leafletService: { available: boolean; homes?: number; note?: string };
}

// Position data extracted from the InDesign HTML (converted to percentages of 1125x595 canvas)
export const editionAreas: EditionArea[] = [
  {
    id: 1,
    name: "Southampton City Suburbs",
    postcodes: "SO15 SO16 SO17",
    homes: 10000,
    color: "#93C572",
    highlightImage: "870.png",
    buttonPosition: { top: 68, left: 52 },
    coverageDetails: "ABC1 homes in the more affluent residential suburban streets of Southampton including Chilworth, Upper Shirley, Rownhams, Nursling Bassett Green, Regents Park, Highfield. Sector 7 of SO16 is delivered to by Royal Mail. Excluding HMO, student areas & flats.",
    leafletService: { available: true, homes: 7100 }
  },
  {
    id: 2,
    name: "Chandler's Ford",
    postcodes: "SO53",
    homes: 11300,
    color: "#F5D547",
    highlightImage: "868.png",
    buttonPosition: { top: 42, left: 48 },
    coverageDetails: "Affluent residential suburb between Southampton and Winchester. Includes Valley Park, Knightwood, Hiltingbury, Chalvington, Toynbee, Peverells Wood, Scantabout, Hocombe.",
    leafletService: { available: true, homes: 11300 }
  },
  {
    id: 3,
    name: "Fair Oak, Horton Heath & Eastleigh",
    postcodes: "SO50",
    homes: 12500,
    color: "#E6A8D7",
    highlightImage: "863.png",
    buttonPosition: { top: 48, left: 58 },
    coverageDetails: "Majority of this circulation covers Bishopstoke, Fair Oak, Horton Heath, Lakeside plus the more affluent residential streets of Eastleigh. Properties are either detached or semi-detached, townhouses but excluding flats, council owned areas and terraced houses.",
    leafletService: { available: true, homes: 12500 }
  },
  {
    id: 4,
    name: "Hedge End & Botley",
    postcodes: "SO30",
    homes: 9400,
    color: "#87CEEB",
    highlightImage: "861.png",
    buttonPosition: { top: 58, left: 62 },
    coverageDetails: "A community east of Southampton, Hedge End and Botley is primarily residential with a retail park and village high streets. A mixture of new build estates, bungalows, older detached and semi-detached homes.",
    leafletService: { available: true, homes: 9400 }
  },
  {
    id: 5,
    name: "Locks Heath & Whiteley",
    postcodes: "SO31 PO15",
    homes: 12000,
    color: "#D2691E",
    highlightImage: "837.png",
    buttonPosition: { top: 72, left: 68 },
    coverageDetails: "This area includes the residential communities of Locks Heath, Park Gate, Sarisbury Green, Warsash and the new build estate of Whiteley. The suburban area straddles the M27 and lies equidistant from Southampton and Fareham.",
    leafletService: { available: true, homes: 12000 }
  },
  {
    id: 6,
    name: "Fareham & Villages",
    postcodes: "PO12, PO13, PO14, PO15, PO16",
    homes: 12100,
    color: "#FF6B6B",
    highlightImage: "774.png",
    buttonPosition: { top: 78, left: 78 },
    coverageDetails: "West of Portsmouth lie the town of Fareham plus a collection of villages; Stubbington, Lee-on-the-Solent, Titchfield. Discover is delivered to selected above average affluent homes in the west side of Fareham.",
    leafletService: { available: true, homes: 12100 }
  },
  {
    id: 7,
    name: "Wickham, B Waltham & Meon Valley Villages",
    postcodes: "SO32 PO17",
    homes: 12400,
    color: "#9370DB",
    highlightImage: "770.png",
    buttonPosition: { top: 52, left: 72 },
    coverageDetails: "Often referred to as Meon Valley. Delivered is by Royal Mail and every property in the postcode SO32 includes two sectors 1 and 2 which include the market town of Bishop's Waltham, Waltham Chase, Swanmore, Durley, Upham, Boorley Green. Also included is PO17 which includes Wickham, Shedfield, Shirrell Heath.",
    leafletService: { available: false }
  },
  {
    id: 8,
    name: "Winchester & Surrounding Villages",
    postcodes: "SO21 SO22 SO23",
    homes: 12000,
    color: "#20B2AA",
    highlightImage: "763.png",
    buttonPosition: { top: 22, left: 52 },
    coverageDetails: "The residential suburbs of this affluent, historic city of Winchester include Fulflood, Tegwood, Badger Farm, Olivers Battery, St Cross, Sleepers Hill, Pitt, Kings Worthy, Abbots Barton, Headbourne Worthy, surrounding villages is city center, Weeke, Harestock.",
    leafletService: { available: true, homes: 8000 }
  },
  {
    id: 9,
    name: "Romsey & North Baddesley",
    postcodes: "SO51 SO52",
    homes: 8600,
    color: "#FFB347",
    highlightImage: "758.png",
    buttonPosition: { top: 38, left: 35 },
    coverageDetails: "The residential areas of market town of Romsey including Abbotswood plus the 3,000 strong suburban community between Romsey and Chandler's Ford of North Baddesley.",
    leafletService: { available: true, homes: 8600 }
  },
  {
    id: 10,
    name: "Totton",
    postcodes: "SO40",
    homes: 7000,
    color: "#98D8C8",
    highlightImage: "749.png",
    buttonPosition: { top: 62, left: 38 },
    coverageDetails: "Just west of Southampton this fairly new suburb is a mix of new build estates and bungalows. Included is West Totton, Testwood, Hangers Farm, Testbourne, Rushington, Hammonds Green. The council estate of Calmore and Eling is excluded.",
    leafletService: { available: true, homes: 7000 }
  },
  {
    id: 11,
    name: "New Forest & Waterside",
    postcodes: "SO40, SO41, SO42, SO43, SO45",
    homes: 10640,
    color: "#228B22",
    highlightImage: "711.png",
    buttonPosition: { top: 72, left: 22 },
    coverageDetails: "The New Forest postcodes are delivered to by Royal Mail so every property, many rural, remote and high value properties in SO42, SO43 and parts of SO41 receive Discover. Towns included are Lyndhurst, Brockenhurst, Beaulieu, Minstead, Ashurst, Boldre, Bramshaw.",
    leafletService: { available: true, homes: 4000, note: "Waterside only" }
  },
  {
    id: 12,
    name: "Sholing, Itchen & Woolston",
    postcodes: "SO19",
    homes: 7000,
    color: "#FF69B4",
    highlightImage: "708.png",
    buttonPosition: { top: 72, left: 58 },
    coverageDetails: "This area is a compact residential suburb east of Southampton reached by the Itchen Bridge or south from M27. Selected properties in Sholing, Itchen, Peartree and Woolston.",
    leafletService: { available: true, homes: 7000 }
  },
  {
    id: 13,
    name: "Hamble, Netley, Bursledon & West End",
    postcodes: "SO18 SO31",
    homes: 9200,
    color: "#DDA0DD",
    highlightImage: "665.png",
    buttonPosition: { top: 68, left: 65 },
    coverageDetails: "Neighbouring Area 12 and south of M27 including West End (near Hedge End), Chalk Hill, parts of Bitterne, Bursledon down to the quaint and popular harbour village of Hamble and nearby Netley. Excluded: Townhill.",
    leafletService: { available: true, homes: 9200 }
  },
  {
    id: 14,
    name: "Stockbridge, Wellows & Test Valley Villages",
    postcodes: "SO51, SO20",
    homes: 8000,
    color: "#B8860B",
    highlightImage: "662.png",
    buttonPosition: { top: 18, left: 28 },
    coverageDetails: "This postcode covers an expansive rural district including the Test Valley villages around Romsey, Stockbridge, West Tytherley, Kings Somborne, Broughton, Houghton, Braishfield, Lockerley, Awbridge, Timsbury, Michelmarsh, Wellow, plus the outer Winchester villages.",
    leafletService: { available: false }
  }
];

export const getTotalHomes = () => editionAreas.reduce((sum, area) => sum + area.homes, 0);
export const getTotalLeafletHomes = () => editionAreas
  .filter(area => area.leafletService.available)
  .reduce((sum, area) => sum + (area.leafletService.homes || 0), 0);
