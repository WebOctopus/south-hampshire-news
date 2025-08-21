// This file is no longer needed since we've moved to Supabase-managed leaflet data
// The old hardcoded data has been removed and replaced with database management

export const seedLeafletData = async () => {
  try {
    console.log('Seeding leaflet areas...');
    
    // Transform areas to match database schema
    const areasData = leafletAreas.map(area => ({
      area_number: area.areaNumber,
      name: area.name,
      postcodes: area.postcodes,
      bimonthly_circulation: area.bimonthlyCirculation,
      price_with_vat: area.priceWithVat,
      schedule: area.schedule.map(item => ({
        month: item.month,
        copyDeadline: item.copyDeadline,
        printDeadline: item.printDeadline,
        delivery: item.delivery,
        circulation: item.circulation
      }))
    }));

    const { error: areasError } = await supabase
      .from('leaflet_areas')
      .insert(areasData);

    if (areasError) {
      console.error('Error seeding areas:', areasError);
      return false;
    }

    console.log('Seeding leaflet sizes...');
    
    // Transform sizes to match database schema
    const sizesData = leafletSizes.map((size, index) => ({
      label: size.label,
      description: size.description || '',
      sort_order: index
    }));

    const { error: sizesError } = await supabase
      .from('leaflet_sizes')
      .insert(sizesData);

    if (sizesError) {
      console.error('Error seeding sizes:', sizesError);
      return false;
    }

    console.log('Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during seeding:', error);
    return false;
  }
};