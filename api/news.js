export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "শুধু GET অনুরোধ গ্রহণ করা হয়।" });
  }

  // ক্যাটাগরি অনুযায়ী গুগল নিউজ RSS লিংক
  const category = typeof req.query.category === "string" ? req.query.category : "all";
  
  let rssUrl = "https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn"; // সব বাংলা নিউজ
  
  if (category === "technology") {
    rssUrl = "https://news.google.com/rss/search?q=প্রযুক্তি&hl=bn&gl=BD&ceid=BD:bn";
  } else if (category === "sports") {
    rssUrl = "https://news.google.com/rss/search?q=খেলাধুলা&hl=bn&gl=BD&ceid=BD:bn";
  } else if (category === "entertainment") {
    rssUrl = "https://news.google.com/rss/search?q=বিনোদন&hl=bn&gl=BD&ceid=BD:bn";
  }

  try {
    const upstream = await fetch(rssUrl, {
      method: "GET",
      signal: AbortSignal.timeout(12000)
    });

    const xmlText = await upstream.text();

    // খুব সহজে XML থেকে নিউজ পার্স করার জন্য সাধারণ নিয়ম
    const matches = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const articles = matches.slice(0, 20).map(match => {
      const item = match[1];
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = item.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      return {
        title: titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "",
        description: "",
        image: "",
        url: linkMatch ? linkMatch[1].trim() : "",
        source: sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "Google News",
        publishedAt: dateMatch ? dateMatch[1].trim() : ""
      };
    });

    return res.status(200).json({
      totalResults: articles.length,
      articles
    });
  } catch (error) {
    return res.status(502).json({
      error: "বাংলা নিউজ লোড করা যায়নি। পরে আবার চেষ্টা করুন।"
    });
  }
}
