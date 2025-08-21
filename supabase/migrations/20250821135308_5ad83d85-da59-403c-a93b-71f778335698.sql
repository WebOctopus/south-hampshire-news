-- Add schedule column to pricing_areas table
ALTER TABLE public.pricing_areas 
ADD COLUMN schedule jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add some example schedule data to existing areas
UPDATE public.pricing_areas 
SET schedule = '[
  {
    "month": "January",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "February", 
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "March",
    "copyDeadline": "15th", 
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "April",
    "copyDeadline": "15th",
    "printDeadline": "20th", 
    "deliveryDate": "25th"
  },
  {
    "month": "May",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "June",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "July",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "August",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "September", 
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "October",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  },
  {
    "month": "November",
    "copyDeadline": "15th",
    "printDeadline": "20th", 
    "deliveryDate": "25th"
  },
  {
    "month": "December",
    "copyDeadline": "15th",
    "printDeadline": "20th",
    "deliveryDate": "25th"
  }
]'::jsonb;