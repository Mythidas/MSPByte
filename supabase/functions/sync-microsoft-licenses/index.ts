// Setup type definitions
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from './packages/db/server.ts';
import { TablesInsert } from './packages/db/schema.ts';
import { setAuthToken } from './utils.ts';

const CSV_URL =
  'https://download.microsoft.com/download/e/3/e/e3e9faf2-f28b-490a-9ada-c6089a1fc5b0/Product%20names%20and%20service%20plan%20identifiers%20for%20licensing.csv';

Deno.serve(async (req) => {
  try {
    setAuthToken(req.headers.get('Authorization') || '');
    const supabase = createClient();

    // Fetch CSV file
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to download CSV');
    }

    const csvText = await response.text();

    const lines = csvText.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

    const rows = lines.slice(1).map((line) =>
      line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // CSV-safe split
        .map((cell) => cell.trim().replace(/^"|"$/g, ''))
    );

    type Row = Record<string, string>;
    const parsed: Row[] = rows.map((values) =>
      Object.fromEntries(values.map((v, i) => [headers[i], v]))
    );

    // Group by SKU
    const skuMap = new Map<string, { name: string; services: string[] }>();

    for (const row of parsed) {
      const skuId = row['String_Id'];
      const skuName = row['Product_Display_Name'];
      const serviceName = row['Service_Plan_Name'];

      if (!skuId || !skuName) continue;

      if (!skuMap.has(skuId)) {
        skuMap.set(skuId, { name: skuName, services: [] });
      }

      const entry = skuMap.get(skuId)!;
      if (serviceName) {
        entry.services.push(serviceName);
      }
    }

    const inserts: TablesInsert<'source_license_info'>[] = Array.from(skuMap.entries()).map(
      ([sku, { name, services }]) => ({
        sku,
        name,
        services,
        metadata: {},
        source_id: 'microsoft-365',
      })
    );

    const { error } = await supabase
      .from('source_license_info')
      .upsert(inserts, { onConflict: 'sku' });

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }

    return new Response(`✅ Inserted/Updated ${inserts.length} licenses`, { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
