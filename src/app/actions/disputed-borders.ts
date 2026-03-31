"use server";

export async function getDisputedBorders() {
  const url = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_boundary_lines_land.json';
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch borders data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching borders data:', error);
    return null;
  }
}
