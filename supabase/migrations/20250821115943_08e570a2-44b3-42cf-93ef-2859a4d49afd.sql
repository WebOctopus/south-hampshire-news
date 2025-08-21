-- Update all leaflet areas with their complete 2025-2026 schedules

-- Area 1: Chandler's Ford
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Aug", "printDeadline": "20 Aug", "delivery": "1 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "19 Sept", "printDeadline": "19 Sept", "delivery": "7 Oct", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "17 Oct", "printDeadline": "22 Oct", "delivery": "30 Oct", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "11 Nov", "printDeadline": "14 Nov", "delivery": "1 Dec", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "12 Dec", "printDeadline": "17 Dec", "delivery": "7 Jan", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "27 Feb", "circulation": 70600}
]'::jsonb
WHERE area_number = 1;

-- Area 2: Eastleigh  
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "29 Sept", "printDeadline": "29 Sept", "delivery": "8 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "15 Nov", "printDeadline": "18 Nov", "delivery": "2 Dec", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "19 Nov", "printDeadline": "21 Nov", "delivery": "4 Dec", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "3 Feb", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "3 Mar", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 2;

-- Area 3: Locks Heath
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "29 Sept", "printDeadline": "29 Sept", "delivery": "9 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "3 Feb", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "3 Mar", "circulation": 70600},
  {"month": "December 2026", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 71540}
]'::jsonb
WHERE area_number = 3;

-- Area 4: Meon Valley
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Sept", "printDeadline": "19 Sept", "delivery": "1 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "11 Nov", "printDeadline": "14 Nov", "delivery": "1 Dec", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "2 Feb", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "2 Feb", "circulation": 71540}
]'::jsonb
WHERE area_number = 4;

-- Area 5: Totton
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "29 Sept", "printDeadline": "29 Sept", "delivery": "10 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "19 Nov", "printDeadline": "21 Nov", "delivery": "4 Dec", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "3 Feb", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "3 Feb", "circulation": 71540}
]'::jsonb
WHERE area_number = 5;

-- Area 6: New Forest & Waterside
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Sept", "printDeadline": "19 Sept", "delivery": "2 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "11 Nov", "printDeadline": "14 Nov", "delivery": "4 Dec", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 71540}
]'::jsonb
WHERE area_number = 6;

-- Area 8: Shelling & Itchen
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "29 Sept", "printDeadline": "29 Sept", "delivery": "10 Oct", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "19 Nov", "printDeadline": "21 Nov", "delivery": "5 Dec", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "29 Jan", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "29 Jan", "circulation": 71540}
]'::jsonb
WHERE area_number = 8;

-- Area 9: Hedge End & Botley
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Aug", "printDeadline": "20 Aug", "delivery": "2 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "17 Oct", "printDeadline": "22 Oct", "delivery": "31 Oct", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "15 Nov", "printDeadline": "18 Nov", "delivery": "2 Dec", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "12 Dec", "printDeadline": "17 Dec", "delivery": "7 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "30 Jan", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "14 Jan", "printDeadline": "20 Jan", "delivery": "30 Jan", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "2 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 9;

-- Area 10: Fareham & Villages
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Aug", "printDeadline": "20 Aug", "delivery": "4 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "17 Oct", "printDeadline": "22 Oct", "delivery": "3 Nov", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "3 Mar", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "9 Dec", "printDeadline": "17 Dec", "delivery": "5 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "2 Feb", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "3 Feb", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "3 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 10;

-- Area 11: Winchester
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "19 Aug", "printDeadline": "20 Aug", "delivery": "5 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "17 Oct", "printDeadline": "17 Oct", "delivery": "5 Nov", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "9 Dec", "printDeadline": "17 Dec", "delivery": "5 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "5 Feb", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "2 Feb", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "12 Feb", "printDeadline": "14 Feb", "delivery": "3 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 11;

-- Area 12: Romsey & NB
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "13 Aug", "printDeadline": "15 Aug", "delivery": "1 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "14 Oct", "printDeadline": "17 Oct", "delivery": "5 Nov", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "9 Dec", "printDeadline": "17 Dec", "delivery": "5 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "5 Feb", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "1 Feb", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "12 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 12;

-- Area 13: Southampton East
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "13 Aug", "printDeadline": "15 Aug", "delivery": "1 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "17 Oct", "printDeadline": "22 Oct", "delivery": "3 Nov", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "2 Mar", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "12 Dec", "printDeadline": "17 Dec", "delivery": "5 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "13 Jan", "printDeadline": "16 Jan", "delivery": "29 Jan", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "17 Feb", "printDeadline": "20 Feb", "delivery": "2 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 13;

-- Area 14: Test Valley
UPDATE public.leaflet_areas 
SET schedule = '[
  {"month": "September 2025", "copyDeadline": "13 Aug", "printDeadline": "15 Aug", "delivery": "1 Sept", "circulation": 70600},
  {"month": "October 2025", "copyDeadline": "14 Oct", "printDeadline": "17 Oct", "delivery": "3 Nov", "circulation": 71540},
  {"month": "November 2025", "copyDeadline": "14 Oct", "printDeadline": "17 Oct", "delivery": "3 Nov", "circulation": 70600},
  {"month": "December 2025", "copyDeadline": "9 Dec", "printDeadline": "12 Dec", "delivery": "5 Jan", "circulation": 71540},
  {"month": "January 2026", "copyDeadline": "16 Jan", "printDeadline": "21 Jan", "delivery": "2 Feb", "circulation": 70600},
  {"month": "February 2026", "copyDeadline": "16 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 71540},
  {"month": "March 2026", "copyDeadline": "17 Feb", "printDeadline": "16 Feb", "delivery": "2 Mar", "circulation": 70600}
]'::jsonb
WHERE area_number = 14;