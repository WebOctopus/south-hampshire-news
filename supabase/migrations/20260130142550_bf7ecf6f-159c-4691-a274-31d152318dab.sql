-- Rename Fareham to Lee-on-the-Solent & Villages
UPDATE businesses 
SET edition_area = 'Area 6 - Lee-on-the-Solent & Villages'
WHERE edition_area = 'Area 6 - Fareham & Surrounds';