/* ARUAIL BHS Smart Notice Board — Supabase-backed edition */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const bnDigits = value => String(value).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const formatDate = value => { if(!value) return 'তারিখ দেওয়া নেই'; const d=new Date(value+'T00:00:00'); return new Intl.DateTimeFormat('bn-BD',{day:'numeric',month:'long',year:'numeric'}).format(d); };
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const config=window.SUPABASE_CONFIG||{};
const configured=!!(window.supabase&&config.url&&config.anonKey&&!config.url.startsWith('YOUR_')&&!config.anonKey.startsWith('YOUR_'));
const db=configured?window.supabase.createClient(config.url,config.anonKey):null;
let notices=[], fileUrls=new Map(), currentUser=null;
const samples=[
{id:'s1',title:'বার্ষিক পরীক্ষার সময়সূচি সংক্রান্ত বিজ্ঞপ্তি',category:'পরীক্ষা',className:'সকল শ্রেণি',date:todayISO(),body:'এটি একটি নমুনা নোটিশ। প্রকাশের আগে বিদ্যালয় কর্তৃপক্ষের অনুমোদিত তথ্য দিয়ে প্রতিস্থাপন করুন।',important:true},
{id:'s2',title:'বিদ্যালয়ের অফিসিয়াল নোটিশ অনুসরণ করুন',category:'সাধারণ',className:'সকল শ্রেণি',date:todayISO(),body:'গুরুত্বপূর্ণ তথ্যের জন্য বিদ্যালয়ের কর্তৃপক্ষের অনুমোদিত ঘোষণা যাচাই করুন।',important:false}
];
function categoryClass(cat){return cat==='জরুরি'?'red':cat==='পরীক্ষা'?'':'green';}
function tags(n){return `<span class="tag ${categoryClass(n.category)}">${escapeHTML(n.category==='পরীক্ষা'?'পরীক্ষা ও রুটিন':n.category)}</span>${n.important?'<span class="tag orange">★ গুরুত্বপূর্ণ</span>':''}<span class="tag gray">${escapeHTML(n.className||'সকল শ্রেণি')} শ্রেণি</span>`;}
function filteredNotices(){
 const q=$('#searchInput').value.trim().toLocaleLowerCase('bn-BD'), cl=$('#classFilter').value, sort=$('#sortSelect').value, category=$('#notices').dataset.category;
 return notices.filter(n=>{const text=[n.title,n.body,n.category,n.className].join(' ').toLocaleLowerCase('bn-BD');return (!q||text.includes(q))&&(!cl||n.className===cl||n.className==='সকল শ্রেণি')&&(!category||n.category===category||(category==='জরুরি'&&n.important));}).sort((a,b)=>sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function render(){
 const list=filteredNotices(), featured=list.find(n=>n.important), feature=$('#featuredNotice');
 feature.classList.toggle('show',!!featured);
 feature.innerHTML=featured?`<div class="featured-inner" role="button" tabindex="0" data-open="${escapeHTML(featured.id)}"><div class="featured-icon">⚑</div><div class="featured-copy"><div class="tag-row">${tags(featured)}</div><h3>${escapeHTML(featured.title)}</h3><p>${escapeHTML(featured.body)}</p></div><span class="featured-date">${formatDate(featured.date)}　↗</span></div>`:'';
 $('#noticeGrid').innerHTML=list.filter(n=>!featured||n.id!==featured.id).map(n=>`<article class="notice-card"><div class="tag-row">${tags(n)}</div><h3>${escapeHTML(n.title)}</h3><p class="excerpt">${escapeHTML(n.body)}</p><div class="notice-card-footer"><span class="notice-date">◷ ${formatDate(n.date)}</span><button class="read-more" data-open="${escapeHTML(n.id)}">বিস্তারিত দেখুন ↗</button></div></article>`).join('');
 $('#emptyState').hidden=list.length>0;$('#resultCount').textContent=`${bnDigits(list.length)}টি নোটিশ`;
 $('#heroTotal').textContent=bnDigits(notices.length);$('#heroImportant').textContent=bnDigits(notices.filter(n=>n.important).length);
 $('#heroUpdated').textContent=notices.length?'আপডেটেড':'—';renderAdminList();
}
function openNotice(id){
 const n=notices.find(x=>x.id===id);if(!n)return;
 $('#noticeDetail').innerHTML=`<div class="tag-row">${tags(n)}</div><h2 class="detail-title">${escapeHTML(n.title)}</h2><div class="detail-meta"><span>◷ ${formatDate(n.date)}</span><span>শ্রেণি: ${escapeHTML(n.className||'সকল শ্রেণি')}</span>${n.expires?`<span>মেয়াদ: ${formatDate(n.expires)}</span>`:''}</div><div class="detail-body">${escapeHTML(n.body)}</div>${n.pdf_url?`<p><a class="pdf-link" href="${escapeHTML(n.pdf_url)}" target="_blank" rel="noopener noreferrer">↓ PDF নোটিশ দেখুন</a></p>`:''}`;
 $('#noticeDialog').showModal();
}
function renderAdminList(){
 $('#adminCount').textContent=bnDigits(notices.length)+'টি';
 $('#adminNoticeList').innerHTML=notices.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(n=>`<div class="admin-item"><div><b>${escapeHTML(n.title)}</b><small>${formatDate(n.date)} · ${escapeHTML(n.category)}</small></div><button class="btn btn-subtle" type="button" data-edit="${escapeHTML(n.id)}">এডিট</button><button class="delete-btn" data-delete="${escapeHTML(n.id)}">মুছুন</button></div>`).join('')||'<p class="notice-date">কোনো নোটিশ নেই।</p>';
}
function resetFilters(){$('#searchInput').value='';$('#classFilter').value='';$('#notices').dataset.category='';render();}
async function loadNotices(){
 if(!configured){notices=samples;$('#adminStatus').textContent='সেটআপ অসম্পূর্ণ: আগে config.js ও Supabase সেটআপ সম্পন্ন করুন।';render();return;}
 const {data,error}=await db.from('notices').select('*').order('date',{ascending:false});
 if(error){notices=[];$('#adminStatus').textContent='নোটিশ লোড করা যায়নি: '+(error.message||error.code||'অজানা ত্রুটি')+'। Supabase URL/key, notices টেবিল ও SELECT/RLS অনুমতি যাচাই করুন।';console.error('Supabase notices load error:',error);}
 else { notices=(data||[]).map(n=>({...n,className:n.class_name,pdf_url:n.pdf_url})); if(!currentUser) $('#adminStatus').textContent='Supabase সংযুক্ত। প্রকাশিত নোটিশ: '+bnDigits(notices.length)+'টি।'; }
 render();
}
function setLoggedIn(user){
 currentUser=user;$('#loginForm').hidden=!!user;$('#adminTools').hidden=!user;
 $('#adminStatus').textContent=user?`লগইন: ${user.email}`:(configured?'প্রশাসনিক অ্যাকাউন্ট দিয়ে লগইন করুন।':'সেটআপ অসম্পূর্ণ: config.js-এ Supabase তথ্য বসাতে হবে।');
}
async function ensureAdmin(){if(!db)return false;const {data,error}=await db.rpc('is_school_admin');if(error||data!==true){alert('এই অ্যাকাউন্টের অ্যাডমিন অনুমতি নেই।');await db.auth.signOut();setLoggedIn(null);return false;}return true;}
$('#todayDate').textContent=new Intl.DateTimeFormat('bn-BD',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
$('#year').textContent=new Date().getFullYear();$('#noticeForm').elements.date.value=todayISO();
$('#searchInput').addEventListener('input',render);$('#classFilter').addEventListener('change',render);$('#sortSelect').addEventListener('change',render);
$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';render();$('#searchInput').focus();});
$('#resetFilters').addEventListener('click',resetFilters);
$$('.category-card').forEach(btn=>btn.addEventListener('click',()=>{$('#notices').dataset.category=btn.dataset.category;$('#classFilter').value='';$('#searchInput').value='';render();$('#notices').scrollIntoView({behavior:'smooth'});}));
document.addEventListener('click',async e=>{
 const open=e.target.closest('[data-open]');if(open)openNotice(open.dataset.open);
 const edit=e.target.closest('[data-edit]');if(edit&&currentUser){
  const n=notices.find(x=>String(x.id)===edit.dataset.edit);
  if(n){const f=$('#noticeForm');f.elements.editingId.value=n.id;f.elements.title.value=n.title;f.elements.category.value=n.category;f.elements.className.value=n.class_name||n.className||'সকল শ্রেণি';f.elements.date.value=n.date;f.elements.expires.value=n.expires||'';f.elements.body.value=n.body;f.elements.important.checked=!!n.important;$('#saveNoticeBtn').textContent='পরিবর্তন সংরক্ষণ';$('#cancelEdit').hidden=false;f.scrollIntoView({behavior:'smooth',block:'start'});}
 }
 const del=e.target.closest('[data-delete]');if(del&&currentUser&&confirm('এই নোটিশটি স্থায়ীভাবে মুছে ফেলবেন?')){
  const {error}=await db.from('notices').delete().eq('id',del.dataset.delete);
  if(error)alert('মুছতে ব্যর্থ: '+error.message);else await loadNotices();
 }
 const close=e.target.closest('[data-close]');if(close)$('#'+close.dataset.close).close();
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-open]')){e.preventDefault();openNotice(e.target.dataset.open);}});
const brandLogo=$('#brandLogo');
 const openAdminPanel=()=>{if(!$('#adminDialog').open)$('#adminDialog').showModal();};
 brandLogo.addEventListener('dblclick',e=>{e.preventDefault();openAdminPanel();});
 let lastLogoTap=0;
 brandLogo.addEventListener('touchend',e=>{const now=Date.now();if(now-lastLogoTap>0&&now-lastLogoTap<450){e.preventDefault();openAdminPanel();lastLogoTap=0;}else{lastLogoTap=now;}},{passive:false});
$('#loginForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!configured){alert('প্রথমে config.js-এ Supabase Project URL ও anon key বসান এবং SQL সেটআপ করুন।');return;}
 const fd=new FormData(e.currentTarget);const {data,error}=await db.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});
 if(error){alert('লগইন ব্যর্থ। ইমেইল/পাসওয়ার্ড যাচাই করুন।');return;}
 if(await ensureAdmin()){setLoggedIn(data.user);await loadNotices();}
});
$('#logoutAdmin').addEventListener('click',async()=>{await db.auth.signOut();setLoggedIn(null);});
$('#changePassword').addEventListener('click',async()=>{
 const password=prompt('নতুন পাসওয়ার্ড দিন (কমপক্ষে 10 অক্ষর; অক্ষর, সংখ্যা ও চিহ্ন ব্যবহার করুন):');
 if(!password)return;if(password.length<10){alert('পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে।');return;}
 const {error}=await db.auth.updateUser({password});if(error)alert('পাসওয়ার্ড পরিবর্তন হয়নি: '+error.message);else alert('পাসওয়ার্ড পরিবর্তন হয়েছে। নিরাপদ স্থানে সংরক্ষণ করুন।');
});
$('#changeEmail').addEventListener('click',async()=>{
 if(!currentUser)return;
 const email=prompt('নতুন অ্যাডমিন ইমেইল লিখুন:',currentUser.email||'');
 if(!email||email.trim().toLowerCase()===String(currentUser.email||'').toLowerCase())return;
 const {data,error}=await db.auth.updateUser({email:email.trim()});
 if(error){alert('ইমেইল পরিবর্তনের অনুরোধ ব্যর্থ: '+error.message);return;}
 alert('ইমেইল পরিবর্তনের নিশ্চিতকরণ লিংক নতুন ইমেইলে পাঠানো হয়েছে। লিংকটি নিশ্চিত করার পর নতুন ইমেইল দিয়ে লগইন করুন।');
});
$('#cancelEdit').addEventListener('click',()=>{const f=$('#noticeForm');f.reset();f.elements.editingId.value='';f.elements.date.value=todayISO();$('#saveNoticeBtn').textContent='নোটিশ প্রকাশ করুন';$('#cancelEdit').hidden=true;});
$('#noticeForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!currentUser){alert('আগে অ্যাডমিন হিসেবে লগইন করুন।');return;}
 const form=e.currentTarget,fd=new FormData(form),file=fd.get('pdf');let pdf_url=null;
 const title=String(fd.get('title')||'').trim(),body=String(fd.get('body')||'').trim();
 if(!title||!body){alert('শিরোনাম ও বিস্তারিত লিখুন।');return;}
 if(file&&file.size){
  if(file.type!=='application/pdf'||file.size>10*1024*1024){alert('শুধু ১০ MB-এর কম PDF আপলোড করুন।');return;}
  const safeName=`${crypto.randomUUID()}.pdf`,path=safeName;
  const {error:uploadError}=await db.storage.from('notice-pdfs').upload(path,file,{contentType:'application/pdf',upsert:false});
  if(uploadError){alert('PDF আপলোড ব্যর্থ। Storage bucket ও policy যাচাই করুন।');return;}
  const {data}=db.storage.from('notice-pdfs').getPublicUrl(path);pdf_url=data.publicUrl;
 }
 const row={title,category:fd.get('category'),class_name:fd.get('className'),date:fd.get('date'),expires:fd.get('expires')||null,body,important:fd.get('important')==='on'};
 if(pdf_url)row.pdf_url=pdf_url;
 const editingId=fd.get('editingId');
 const request=editingId?db.from('notices').update(row).eq('id',editingId):db.from('notices').insert(row);
 const {error}=await request;
 if(error){alert('নোটিশ প্রকাশ/আপডেট ব্যর্থ: '+error.message);return;}
 form.reset();form.elements.editingId.value='';form.elements.date.value=todayISO();$('#saveNoticeBtn').textContent='নোটিশ প্রকাশ করুন';$('#cancelEdit').hidden=true;await loadNotices();alert(editingId?'নোটিশ আপডেট হয়েছে।':'নোটিশ অনলাইনে প্রকাশিত হয়েছে।');
});
(async()=>{
 if(configured){
  const {data}=await db.auth.getSession();
  if(data.session?.user){if(await ensureAdmin())setLoggedIn(data.session.user);else setLoggedIn(null);}
  db.auth.onAuthStateChange(async(_event,session)=>{if(!session)setLoggedIn(null);});
 }
 await loadNotices();
})();
$('#menuToggle').addEventListener('click',()=>{const nav=$('#mainNav'),open=nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}));

// Keep public notice boards reasonably fresh across devices without requiring Realtime publication setup.
setInterval(()=>{ if(configured && document.visibilityState==='visible') loadNotices(); },30000);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible' && configured) loadNotices(); });
