# বাংলা সংবাদ — NewsAPI + Vercel

এই ZIP-এ দেওয়া মূল নিউজ টেমপ্লেটের পেজ ও ফাইলগুলো রাখা হয়েছে। লাইভ নিউজ বিভাগ যোগ করা হয়েছে, এবং API Key শুধু Vercel serverless function-এ ব্যবহৃত হবে।

## নিরাপত্তা
- কোনো API Key এই ZIP বা HTML/JavaScript ফাইলে রাখা হয়নি।
- `NEWS_API_KEY` নামে Vercel Environment Variable যোগ করুন।
- API Key আগে কোথাও শেয়ার হয়ে থাকলে NewsAPI ড্যাশবোর্ডে সেটি বদলে নতুন Key ব্যবহার করুন।
- `.env` ফাইল কখনো GitHub-এ আপলোড করবেন না।

## Vercel-এ চালানোর ধাপ
1. ZIP extract করে সব ফাইল GitHub repository-র root-এ আপলোড করুন। `api` ফোল্ডারও root-এ থাকবে।
2. Vercel Dashboard → Add New → Project → GitHub repository Import করুন।
3. Project → Settings → Environment Variables খুলুন।
4. Name: `NEWS_API_KEY`
5. Value: NewsAPI থেকে নেওয়া আপনার নতুন API Key।
6. Environment হিসেবে Production (এবং চাইলে Preview) নির্বাচন করে Save করুন।
7. Deployments থেকে Redeploy করুন।
8. সাইট খুলুন। `/api/news` দিয়ে API endpoint পরীক্ষা করুন।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
- NewsAPI-এর Developer/free plan সাধারণত development/testing-এর জন্য; পাবলিক প্রোডাকশন নিউজ সাইটে ব্যবহারের আগে NewsAPI-র বর্তমান plan/licence যাচাই করুন।
- সব বাংলা সংবাদমাধ্যম বা প্রথম আলোর সব খবর NewsAPI-তে থাকবে এমন নিশ্চয়তা নেই।
- মূল প্রকাশকের শর্ত মেনে চলুন; সম্পূর্ণ খবর কপি না করে উৎসের লিংক দিন।
- API endpoint-এ ব্যবহার সীমা (rate limiting) যোগ করা দরকার হতে পারে যদি সাইটটি ব্যাপকভাবে চালু করেন।
