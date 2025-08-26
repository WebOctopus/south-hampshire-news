-- Update all pricing areas with 2025-2026 print schedule data based on the print schedule document

-- Area 1 - SOUTHAMPTON CITY
UPDATE pricing_areas 
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October", 
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November",
    "year": "2025", 
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov", 
    "deliveryDate": "1st Dec"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb", 
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 1 - SOUTHAMPTON CITY';

-- Area 2 - CHANDLER'S FORD  
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October",
    "year": "2025", 
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct", 
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan", 
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 2 - CHANDLER''S FORD';

-- Area 3 - EASTLEIGH & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug", 
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November", 
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 3 - EASTLEIGH & VILLAGES';

-- Area 4 - HEDGE END & BOTLEY
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep", 
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December", 
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 4 - HEDGE END & BOTLEY';

-- Area 5 - LOCKS HEATH & VILLAGES  
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep", 
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 5 - LOCKS HEATH & VILLAGES';

-- Area 6 - FAREHAM & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 6 - FAREHAM & VILLAGES';

-- Area 7 - GOSPORT & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 7 - GOSPORT & VILLAGES';

-- Area 8 - LEE-ON-SOLENT & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  }
]'::jsonb
WHERE name = 'Area 8 - LEE-ON-SOLENT & VILLAGES';

-- Area 9 - WATERLOOVILLE & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 9 - WATERLOOVILLE & VILLAGES';

-- Area 10 - HAVANT & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  }
]'::jsonb
WHERE name = 'Area 10 - HAVANT & VILLAGES';

-- Area 11 - EMSWORTH & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 11 - EMSWORTH & VILLAGES';

-- Area 12 - PETERSFIELD & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  }
]'::jsonb
WHERE name = 'Area 12 - PETERSFIELD & VILLAGES';

-- Area 13 - LIPHOOK & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "September",
    "year": "2025",
    "copyDeadline": "18th Aug",
    "printDeadline": "20th Aug",
    "deliveryDate": "1st Sept"
  },
  {
    "month": "November",
    "year": "2025",
    "copyDeadline": "17th Oct",
    "printDeadline": "17th Oct",
    "deliveryDate": "4th Nov"
  },
  {
    "month": "January",
    "year": "2026",
    "copyDeadline": "2nd Dec",
    "printDeadline": "5th Dec",
    "deliveryDate": "6th Jan"
  },
  {
    "month": "March",
    "year": "2026",
    "copyDeadline": "13th Feb",
    "printDeadline": "13th Feb",
    "deliveryDate": "3rd Mar"
  }
]'::jsonb
WHERE name = 'Area 13 - LIPHOOK & VILLAGES';

-- Area 14 - ALTON & VILLAGES
UPDATE pricing_areas
SET schedule = '[
  {
    "month": "October",
    "year": "2025",
    "copyDeadline": "19th Sep",
    "printDeadline": "19th Sep",
    "deliveryDate": "7th Oct"
  },
  {
    "month": "December",
    "year": "2025",
    "copyDeadline": "11th Nov",
    "printDeadline": "14th Nov",
    "deliveryDate": "1st Dec"
  },
  {
    "month": "February",
    "year": "2026",
    "copyDeadline": "13th Jan",
    "printDeadline": "16th Jan",
    "deliveryDate": "29th Jan"
  }
]'::jsonb
WHERE name = 'Area 14 - ALTON & VILLAGES';