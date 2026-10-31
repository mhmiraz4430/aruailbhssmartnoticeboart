ARUAIL BHS Smart Notice Board — Supabase Admin Edition
======================================================

এই প্যাকেজে Supabase-ভিত্তিক অনলাইন নোটিশ বোর্ড ও সুরক্ষিত অ্যাডমিন লগইন রয়েছে।
এটি এখনো আপনার Supabase/GitHub অ্যাকাউন্টে নিজে থেকে প্রকাশিত হয়নি। নিচের একবারের সেটআপ শেষ হলে ব্যবহার করা যাবে।

ফাইল
----
index.html, style.css, script.js, config.js
supabase-setup.sql
assets/aruail-bhs-school-logo.jpg এবং aruail-bhs-logo.svg

১) Supabase সেটআপ
-----------------
১. https://supabase.com/ এ লগইন করে Free Project তৈরি করুন।
২. এই সাইটের config.js-এ Project URL আগে থেকেই বসানো আছে:
   https://zaqfzzhqqfpmpjlqgcfa.supabase.co
   আপনার Supabase Dashboard-এ URL-টি একই কি না নিশ্চিত করুন।
৩. config.js-এ anon/public অথবা publishable key বসানো আছে। আপনার Dashboard-এর API Keys-এ দেখানো বর্তমান Publishable/anon key-এর সঙ্গে মিলিয়ে নিন।
   এখানে কখনো service_role/secret key বসাবেন না।
৪. Supabase Dashboard > SQL Editor খুলে supabase-setup.sql-এর সম্পূর্ণ কোড রান করুন।
৫. Authentication > Users > Add user থেকে নিজের নিয়ন্ত্রণে থাকা ইমেইল এবং শক্তিশালী পাসওয়ার্ড দিয়ে প্রথম অ্যাডমিন অ্যাকাউন্ট তৈরি করুন।
৬. তৈরি হওয়া ইউজারের UUID কপি করে SQL Editor-এ চালান:

   INSERT INTO public.school_admins (user_id)
   VALUES ('এখানে-ইউজারের-UUID')
   ON CONFLICT (user_id) DO NOTHING;

   অথবা ইমেইল দিয়ে চালান (নিজের ইমেইল বসাবেন):

   INSERT INTO public.school_admins (user_id)
   SELECT id FROM auth.users WHERE email = 'আপনার-অ্যাডমিন-ইমেইল'
   ON CONFLICT (user_id) DO NOTHING;

৭. Authentication settings-এ Public sign-up বন্ধ রাখুন, যদি নতুন ব্যবহারকারীর স্ব-নিবন্ধন প্রয়োজন না হয়।

২) অ্যাডমিন প্যানেল
-------------------
- ওয়েবসাইটের ওপরের বাম পাশে স্কুলের লোগোতে ডেস্কটপে ডাবল-ক্লিক বা মোবাইলে দ্রুত ডাবল-ট্যাপ করলে অ্যাডমিন লগইন খুলবে।
- অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।
- নোটিশ যোগ, এডিট, মুছে ফেলা এবং PDF আপলোড করা যাবে। প্রকাশিত নোটিশ সকল দর্শকের কাছে অনলাইনে দেখা যাবে।
- নিজের পাসওয়ার্ড পরিবর্তন: অ্যাডমিন প্যানেলের “পাসওয়ার্ড পরিবর্তন” বোতাম।
- নিজের ইমেইল/লগইন ইউজারনেম পরিবর্তন: “ইমেইল/ইউজারনেম পরিবর্তন” বোতাম। Supabase নতুন ইমেইলে confirmation link পাঠাবে; সেটি নিশ্চিত করার পর নতুন ইমেইল দিয়ে লগইন করুন।
- পাসওয়ার্ড বা secret key কখনো ওয়েবসাইটের ফাইলে লিখবেন না বা কারও সঙ্গে শেয়ার করবেন না।

৩) অতিরিক্ত অ্যাডমিন যোগ/বাদ
---------------------------
নতুন অ্যাডমিন যোগ করতে প্রথমে Supabase Authentication > Users থেকে তার অ্যাকাউন্ট তৈরি করুন। তারপর SQL Editor-এ চালান:

   INSERT INTO public.school_admins (user_id)
   SELECT id FROM auth.users WHERE email = 'নতুন-অ্যাডমিনের-ইমেইল'
   ON CONFLICT (user_id) DO NOTHING;

অ্যাডমিন অনুমতি বাতিল করতে (ইমেইলটি নিজের তথ্য দিয়ে বদলান):

   DELETE FROM public.school_admins
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'যে-অ্যাডমিনকে-বাদ-দেবেন');

অন্তত একজন বিশ্বস্ত অ্যাডমিন রাখুন। অ্যাডমিন তালিকা সাধারণ ওয়েবসাইট থেকে পরিবর্তনযোগ্য নয়—এটি ইচ্ছাকৃত নিরাপত্তা ব্যবস্থা।

৪) GitHub Pages-এ বিনামূল্যে প্রকাশ
----------------------------------
১. https://github.com/ এ একটি repository তৈরি করুন।
২. এই ফোল্ডারের ভেতরের সব ফাইল ও assets ফোল্ডার repository-র root-এ আপলোড করুন (aruail-bhs-ready নামের বাইরের ফোল্ডারটি নয়)।
৩. Repository > Settings > Pages > Deploy from a branch নির্বাচন করুন; Branch: main এবং folder: /(root) দিয়ে Save করুন।
৪. GitHub Pages যে URL দেবে সেটি খুলে মোবাইল ও কম্পিউটারে পরীক্ষা করুন।
৫. আপনার নিজস্ব domain থাকলে DNS/hosting আলাদাভাবে configure করতে হবে।

নিরাপত্তা ও সীমাবদ্ধতা
---------------------
- Supabase Auth লগইন পরিচালনা করে; Row Level Security শুধু school_admins তালিকাভুক্ত UUID-কে নোটিশ পরিবর্তনের অনুমতি দেয়।
- Publishable/anon key browser-এ থাকা স্বাভাবিক; service_role/secret key কখনো প্রকাশ করবেন না।
- PDF bucket public read; কেবল অ্যাডমিন আপলোড করতে পারে। শুধু জনসাধারণের জন্য প্রকাশযোগ্য PDF দিন।
- এটি static frontend + Supabase backend। MFA, audit dashboard ও automated backup এই প্যাকেজে নেই। Free plan-এর quota ও নীতি Supabase-এ যাচাই করুন।
- এই প্যাকেজ নিজে থেকে Supabase project তৈরি, আপনার অ্যাকাউন্টে লগইন, অ্যাডমিন user তৈরি, SQL execute বা GitHub-এ publish করতে পারে না। এগুলো আপনার অ্যাকাউন্টে উপরের ধাপ অনুযায়ী করতে হবে।

সমস্যা হলে
----------
অ্যাডমিনে যে প্রকৃত Supabase error দেখায় সেটি কপি করে পাঠান। Secret key, পাসওয়ার্ড বা recovery code পাঠাবেন না।
