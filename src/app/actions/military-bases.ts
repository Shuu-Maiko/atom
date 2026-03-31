"use server";

import { z } from 'zod';

const MilitaryBaseSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string().optional(),
  type: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
});

const MilitaryBasesResponseSchema = z.array(MilitaryBaseSchemaBase);

export async function getMilitaryBases() {
  const sparqlQuery = `
    SELECT ?item ?itemLabel ?coord ?countryLabel ?typeLabel WHERE {
      ?item wdt:P31/wdt:P279* wd:Q1743395. 
      ?item wdt:P625 ?coord.
      OPTIONAL { ?item wdt:P17 ?country. ?country rdfs:label ?countryLabel. FILTER(LANG(?countryLabel) = "en") }
      OPTIONAL { ?item wdt:P31 ?type. ?type rdfs:label ?typeLabel. FILTER(LANG(?typeLabel) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 1500
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

  try {
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/sparql-results+json', 
        'User-Agent': 'ATOM-Geopolitics-Bot/1.0' 
      },
      next: { revalidate: 604800 }
    });

    if (!response.ok) {
      throw new Error(`Wikidata SPARQL error: ${response.statusText}`);
    }

    const rawData = await response.json();
    
    const bases = rawData.results.bindings.map((b: any) => {
      const coordValue = b.coord.value;
      const coordMatch = coordValue.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      return {
        id: b.item.value.split('/').pop(),
        name: b.itemLabel.value,
        country: b.countryLabel?.value || 'Unknown',
        type: b.typeLabel?.value || 'Military Base',
        lon: coordMatch ? parseFloat(coordMatch[1]) : 0,
        lat: coordMatch ? parseFloat(coordMatch[2]) : 0,
      };
    }).filter((b: any) => b.lat !== 0 && b.lon !== 0);

    const validated = MilitaryBasesResponseSchema.safeParse(bases);
    if (!validated.success) {
      console.error("Zod Validation Failed for Military Bases:", validated.error.format());
      return { data: null, error: 'Inconsistent data from Wikidata.' };
    }

    return { data: validated.data, error: null };
  } catch (error) {
    console.error("Error fetching military bases:", error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown network error.' };
  }
}
