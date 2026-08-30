const ALLOWED = new Set(["username","email","domain","ip","url","phone","plate","keyword"]);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept",
  "Cache-Control": "no-store"
};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8",...cors}})}

function searchLinks(target,type){
  const q=encodeURIComponent(target), exact=encodeURIComponent('"'+target+'"');
  const out=[
    {title:"Google",source:"Google Search",url:`https://www.google.com/search?q=${q}`},
    {title:"Bing",source:"Bing Search",url:`https://www.bing.com/search?q=${q}`},
    {title:"DuckDuckGo",source:"DuckDuckGo",url:`https://duckduckgo.com/?q=${q}`},
    {title:"Google exact",source:"Google Search",url:`https://www.google.com/search?q=${exact}`}
  ];
  if(type==="username") out.push({title:"GitHub users",source:"GitHub Search",url:`https://github.com/search?q=${q}&type=users`});
  if(type==="domain"||type==="url") out.push({title:"Certificate Transparency",source:"crt.sh",url:`https://crt.sh/?q=${q}`});
  return out;
}

export default {
  async fetch(request, env) {
    if(request.method==="OPTIONS") return new Response(null,{status:204,headers:cors});
    const u=new URL(request.url);
    if(u.pathname==="/health") return json({ok:true,service:"osint-elite-v3-worker"});
    if(u.pathname!=="/api/analyze") return json({ok:false,error:"Not found"},404);
    if(request.method!=="GET") return json({ok:false,error:"GET required"},405);
    const target=(u.searchParams.get("target")||"").trim();
    const type=(u.searchParams.get("type")||"keyword").toLowerCase();
    if(!target || target.length>300) return json({ok:false,error:"Invalid target"},400);
    if(!ALLOWED.has(type)) return json({ok:false,error:"Unsupported type"},400);

    // The starter backend intentionally returns public-search links.
    // Add approved third-party API adapters here using env secrets.
    // Never put API keys in the GitHub Pages JavaScript.
    return json({
      ok:true,
      version:"3.0.0",
      type,
      target,
      results:searchLinks(target,type),
      providers:{configured:[],note:"Configure approved API adapters in this Worker."}
    });
  }
};
