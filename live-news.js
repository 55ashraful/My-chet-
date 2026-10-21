(() => {
  "use strict";
  const start = () => {
    const header = document.querySelector("header");
    if (!header || document.getElementById("liveNewsPanel")) return;

    const panel = document.createElement("section");
    panel.id = "liveNewsPanel";
    panel.className = "live-news-panel";
    panel.innerHTML = `
      <div class="live-news-heading">
        <h2>সর্বশেষ লাইভ নিউজ</h2>
        <button type="button" class="live-refresh" id="liveNewsRefresh">↻ খবর আপডেট</button>
      </div>
      <form class="live-news-search" id="liveNewsSearch">
        <input id="liveNewsQuery" type="search" maxlength="100"
          placeholder="খবর খুঁজুন..." aria-label="লাইভ খবর খুঁজুন">
        <button type="submit">খুঁজুন</button>
      </form>
      <div class="live-news-controls" aria-label="নিউজ বিভাগ">
        <button type="button" data-live-category="all" class="is-active">সর্বশেষ</button>
        <button type="button" data-live-category="national">বাংলাদেশ</button>
        <button type="button" data-live-category="world">বিশ্ব</button>
        <button type="button" data-live-category="technology">প্রযুক্তি</button>
        <button type="button" data-live-category="sports">খেলাধুলা</button>
        <button type="button" data-live-category="entertainment">বিনোদন</button>
      </div>
      <p class="live-news-status" id="liveNewsStatus" role="status">খবর লোড হচ্ছে...</p>
      <div class="live-news-grid" id="liveNewsGrid"></div>
      <p style="font-size:.85rem;color:#777;margin-top:14px">
        খবরের তথ্য ও ছবি সংশ্লিষ্ট প্রকাশকের। সম্পূর্ণ খবর পড়তে মূল সংবাদমাধ্যমে যান।
      </p>
    `;

    header.insertAdjacentElement("afterend", panel);

    const navList = document.querySelector("header .navbar-nav");
    if (navList && !navList.querySelector('[data-live-news-link]')) {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = '<a class="nav-link" data-live-news-link href="#liveNewsPanel">লাইভ নিউজ</a>';
      navList.appendChild(li);
    }

    const grid = panel.querySelector("#liveNewsGrid");
    const status = panel.querySelector("#liveNewsStatus");
    const queryInput = panel.querySelector("#liveNewsQuery");
    const refresh = panel.querySelector("#liveNewsRefresh");
    let category = "all";
    let query = "";
    let sequence = 0;

    const formatDate = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleString("bn-BD", {
        dateStyle: "medium", timeStyle: "short"
      });
    };

    function showArticles(articles) {
      grid.replaceChildren();
      if (!articles.length) {
        status.textContent = "এই বিভাগে আপাতত কোনো খবর পাওয়া যায়নি।";
        return;
      }

      let count = 0;
      articles.forEach((article) => {
        if (!article || typeof article.url !== "string") return;
        let target;
        try {
          target = new URL(article.url);
          if (target.protocol !== "https:") return;
        } catch { return; }

        const card = document.createElement("article");
        card.className = "live-news-card";

        // Isolate each Adsterra banner in its own iframe. The 300x250 Adsterra
        // tag may use document.write; running it in the page after load can fail.
        // An isolated document gives every story its own atOptions scope.
        const storyAd = document.createElement("div");
        storyAd.className = "story-ad-slot";
        storyAd.setAttribute("aria-label", "বিজ্ঞাপন");
        const adLabel = document.createElement("span");
        adLabel.className = "story-ad-label";
        adLabel.textContent = "বিজ্ঞাপন";
        const adFrame = document.createElement("iframe");
        adFrame.className = "story-ad-iframe";
        adFrame.title = "বিজ্ঞাপন";
        adFrame.width = "300";
        adFrame.height = "250";
        adFrame.loading = "lazy";
        adFrame.referrerPolicy = "strict-origin-when-cross-origin";
        adFrame.scrolling = "no";
        adFrame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;width:300px;height:250px;overflow:hidden"><script data-cfasync="false">var atOptions = { 'key': '5323d19afb267c0f1f923017f0a8a6a1', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} };<\/script><script data-cfasync="false" src="https://bicea.org/22/5323d19afb267c0f1f923017f0a8a6a1"><\/script></body></html>`;
        // Smartlink button sits directly below the banner, with varied CTA text.
        const sponsored = document.createElement("a");
        sponsored.className = "story-sponsored-link";
        sponsored.href = "https://arwf.org/4/15c791dad56db996e6b3e5efb321df55";
        sponsored.target = "_blank";
        sponsored.rel = "sponsored noopener noreferrer";
        sponsored.setAttribute("aria-label", "স্পন্সরড লিংক খুলুন");
        const buttonLabels = ["আরও জানুন ↗", "এখানে ক্লিক করুন ↗", "বিস্তারিত দেখুন ↗", "এখনই দেখুন ↗", "আরও দেখুন ↗"];
        sponsored.textContent = buttonLabels[count % buttonLabels.length];
        storyAd.append(adLabel, adFrame, sponsored);

        // Put the banner and its clearly marked CTA above the story content.
        card.appendChild(storyAd);

        if (typeof article.image === "string" && article.image.startsWith("https://")) {
          const img = document.createElement("img");
          img.src = article.image;
          img.alt = "";
          img.loading = "lazy";
          img.referrerPolicy = "no-referrer";
          img.onerror = () => img.remove();
          card.appendChild(img);
        }

        const content = document.createElement("div");
        content.className = "live-news-content";

        const source = document.createElement("div");
        source.className = "live-news-source";
        source.textContent = article.source || "সংবাদমাধ্যম";

        const title = document.createElement("h3");
        title.textContent = article.title || "শিরোনাম পাওয়া যায়নি";

        const date = document.createElement("div");
        date.className = "live-news-meta";
        date.textContent = formatDate(article.publishedAt);

        const description = document.createElement("p");
        description.textContent = article.description || "বিস্তারিত জানতে মূল খবরটি পড়ুন।";

        const link = document.createElement("a");
        link.href = target.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "সম্পূর্ণ খবর পড়ুন ↗";

        content.append(source, title, date, description, link);
        card.appendChild(content);
        grid.appendChild(card);
        count++;
      });

      status.textContent = count
        ? `${count}টি খবর পাওয়া গেছে।`
        : "দেখানোর মতো কোনো বৈধ খবরের লিংক পাওয়া যায়নি।";
    }

    async function loadNews() {
      const id = ++sequence;
      status.textContent = "খবর লোড হচ্ছে...";
      grid.replaceChildren();

      const params = new URLSearchParams({ category });
      if (query) params.set("q", query);

      try {
        const response = await fetch(`/api/news?${params.toString()}`, {
          headers: { "Accept": "application/json" }
        });
        const data = await response.json();
        if (id !== sequence) return;
        if (!response.ok) throw new Error(data.error || "খবর লোড করা যায়নি।");
        showArticles(Array.isArray(data.articles) ? data.articles : []);
      } catch (error) {
        if (id !== sequence) return;
        status.textContent = error.message ||
          "সংযোগে সমস্যা হয়েছে। Vercel deployment ও API সেটিংস পরীক্ষা করুন।";
      }
    }

    panel.querySelectorAll("[data-live-category]").forEach((button) => {
      button.addEventListener("click", () => {
        category = button.dataset.liveCategory;
        query = "";
        queryInput.value = "";
        panel.querySelectorAll("[data-live-category]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        loadNews();
      });
    });

    panel.querySelector("#liveNewsSearch").addEventListener("submit", (event) => {
      event.preventDefault();
      query = queryInput.value.trim().slice(0, 100);
      loadNews();
    });

    refresh.addEventListener("click", loadNews);
    loadNews();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
