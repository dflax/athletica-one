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

    console.log(`Scraping URL: ${url}`);
    
    // MileSplit structure often uses 'personal-bests' class
    // We'll try several common selectors found on MileSplit/FloSports sites
    const selectors = [
      '.personal-bests dt',
      '.personal-bests .event',
      '#personal-bests dt',
      '.athlete-records dt',
      '.stats .event'
    ];

    selectors.forEach(selector => {
      $(selector).each((i, el) => {
        const eventName = $(el).text().trim();
        // Record data is usually the next dd or a sibling with mark/time class
        let recordData = $(el).next('dd').text().trim();
        if (!recordData) recordData = $(el).siblings('.mark').text().trim();
        if (!recordData) recordData = $(el).siblings('.time').text().trim();
        if (!recordData) recordData = $(el).parent().find('.mark').text().trim();
        
        if (eventName && recordData) {
          records.push({ eventName, recordData });
        }
      });
    });

    // Fallback: Look for any table rows that look like PRs
    if (records.length === 0) {
      $('tr').each((i, el) => {
        const cells = $(el).find('td');
        if (cells.length >= 2) {
          const eventName = $(cells[0]).text().trim();
          const recordData = $(cells[1]).text().trim();
          // Heuristic: PR data usually contains numbers and often colons/dots
          if (eventName && recordData && /\d/.test(recordData) && eventName.length < 50) {
            records.push({ eventName, recordData });
          }
        }
      });
    }

    console.log(`Found ${records.length} potential records`);

    // De-duplicate records
    const uniqueRecords = Array.from(new Map(records.map(item => [item.eventName, item])).values());

    return NextResponse.json({ records: uniqueRecords });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
