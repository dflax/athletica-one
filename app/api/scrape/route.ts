import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('milesplit.com')) {
      return NextResponse.json({ error: 'Invalid MileSplit URL' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch MileSplit: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const records: { eventName: string; recordData: string }[] = [];

    // MileSplit usually has Personal Bests in a section with class 'personal-bests' or similar
    // Based on the research, we look for '.personal-bests' or the specific headers
    
    $('.personal-bests dt, .personal-bests .event').each((i, el) => {
      const eventName = $(el).text().trim();
      const recordData = $(el).next('dd').text().trim() || $(el).siblings('.mark').text().trim();
      
      if (eventName && recordData) {
        records.push({ eventName, recordData });
      }
    });

    // Fallback parser if the structure is different
    if (records.length === 0) {
      // Look for any table-like structure that might contain PRs
      $('tr').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('personal best') || text.includes('personal record')) {
          // This might be a header, skip or handle
        }
      });
      
      // Attempt to find dt/dd pairs globally if .personal-bests class is missing
      $('dt').each((i, el) => {
        const eventName = $(el).text().trim();
        const recordData = $(el).next('dd').text().trim();
        if (eventName && recordData && (recordData.includes(':') || recordData.includes('.') || /\d/.test(recordData))) {
            // Heuristic to avoid grabbing non-PR data
            if (eventName.length < 50 && recordData.length < 20) {
                records.push({ eventName, recordData });
            }
        }
      });
    }

    // De-duplicate records
    const uniqueRecords = Array.from(new Map(records.map(item => [item.eventName, item])).values());

    return NextResponse.json({ records: uniqueRecords });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
