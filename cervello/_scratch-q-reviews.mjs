import fs from "fs";
for (const f of ["vps/.env", ".env"]) {
  try {
    for (const l of fs.readFileSync(f, "utf8").split("\n")) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch (e) {}
}
const URL = process.env.MARKETPLACE_SUPABASE_URL?.trim();
const KEY = process.env.MARKETPLACE_SUPABASE_KEY?.trim();
if (!URL || !KEY) { console.log(JSON.stringify({ error: "env mancante", URL: !!URL, KEY: !!KEY })); process.exit(0); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
async function q(path) {
  try {
    const res = await fetch(`${URL}/rest/v1/${path}`, { headers: H });
    if (!res.ok) return { _err: res.status, _body: (await res.text()).slice(0, 300) };
    return await res.json();
  } catch (e) { return { _err: String(e) }; }
}
const out = {};
out.orders = await q("orders?select=id,delivery_status,status,payment_status,total_amount,created_at,delivered_at,canceled_at,store_id,buyer_id&order=created_at.desc&limit=100");
out.reviews = await q("reviews?select=*&limit=100");
out.review_alt = await q("product_reviews?select=*&limit=50");
out.store_reviews = await q("store_reviews?select=*&limit=50");
console.log(JSON.stringify(out, null, 2));
