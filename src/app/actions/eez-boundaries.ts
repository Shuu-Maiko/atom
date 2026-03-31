"use server";

export async function getEEZData() {
  const url = 'https://geo.vliz.be/geoserver/MarineRegions/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MarineRegions:eez&outputFormat=application/json&maxFeatures=50';
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch EEZ data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EEZ data:', error);
    return null;
  }
}
