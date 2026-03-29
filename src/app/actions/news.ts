'use server';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsData {
  articles: NewsArticle[];
  totalResults: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function getNewsByLocation(lat: number, lon: number): Promise<NewsData> {
  const radius = 50;

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=location&lat=${lat}&lon=${lon}&radius=${radius}&pageSize=10&sortBy=publishedAt`,
      {
        headers: {
          'User-Agent': getRandomUserAgent(),
        },
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      return {
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
      };
    }
  } catch {}

  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=pub_demo&q=recent&language=en&page=1`,
      {
        headers: {
          'User-Agent': getRandomUserAgent(),
        },
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      return {
        articles: (data.results || []).map((r: any) => ({
          title: r.title || '',
          description: r.description || '',
          url: r.link || '',
          publishedAt: r.pubDate || '',
          source: { name: r.source_id || 'Unknown' },
        })),
        totalResults: data.totalResults || 0,
      };
    }
  } catch {}
  
  return { articles: [], totalResults: 0 };
}

export async function getNewsByCountry(country: string): Promise<NewsData> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  
  try {
    const url = apiKey 
      ? `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(country)}&language=en&pageSize=10`
      : `https://newsdata.io/api/1/news?apikey=pub_demo&q=${encodeURIComponent(country)}&language=en&pageSize=10`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });
    
    if (res.ok) {
      const data = await res.json();
      return {
        articles: (data.results || []).map((r: any) => ({
          title: r.title || '',
          description: r.description || '',
          url: r.link || '',
          publishedAt: r.pubDate || '',
          source: { name: r.source_id || 'Unknown' },
        })),
        totalResults: data.totalResults || 0,
      };
    }
  } catch {}
  
  return { articles: [], totalResults: 0 };
}
