const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Remove persistCard
html = html.replace(/<div class="cc" id="persistCard">[\s\S]*?Supabase bucket as the single source of truth.\s*<\/div>\s*<\/div>/, '');

// 2. Constants & aliases
html = html.replace(/const SK='sbd_products';\s*const DK='sbd_deleted';\s*/g, '');
html = html.replace(/let pg=1,eId=null,upB64=null,aiD=null,acOpen=false,acInit=false,matchData=\[\];/g, 'let pg=1,eId=null,upB64=null,aiD=null,acOpen=false,acInit=false,matchData=[];\nlet CATALOG=[];');

// 3. Supabase config & sb functions
const sbBlockRegex = /\/\/ ── SUPABASE CONFIG ──[\s\S]*?\/\/ ── BASE CATALOG \(subset for admin\) ──\s*const BASE=\[\];/;
const newSbBlock = `// ── SUPABASE CONFIG ──
const SB_URL = CONFIG_DATA.supabase.url;
const SB_KEY = CONFIG_DATA.supabase.key;
const SB_BUCKET='fotos-productos';

function sbFetch(path, opts){
  return fetch(SB_URL+path,{...opts,headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json',...(opts&&opts.headers)}});
}

async function sbUploadImage(file){
  const ext=file.name.split('.').pop().toLowerCase();
  const fname='producto-'+Date.now()+'.'+ext;
  const res=await fetch(SB_URL+'/storage/v1/object/'+SB_BUCKET+'/'+fname,{
    method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':file.type,'x-upsert':'true'},
    body:file
  });
  if(!res.ok){const e=await res.text();throw new Error('Upload failed: '+e);}
  return SB_URL+'/storage/v1/object/public/'+SB_BUCKET+'/'+fname;
}

// ── BASE CATALOG (subset for admin) ──
const BASE=[];`;
html = html.replace(sbBlockRegex, newSbBlock);

// 4. Data logic
const dataBlockRegex = /function getC\(\)[\s\S]*?function loadProducts\(\)[\s\S]*?\}\nfunction merged\(\)[\s\S]*?\}\n/;
const newDataBlock = `function normalizeProducts(list){
  if(!Array.isArray(list)) return [];
  const used = new Set();
  return list.map(p=>{
    const item = {...p};
    if(!item.title && item.nombre)           item.title       = item.nombre;
    if(!item.description && item.descripcion) item.description = item.descripcion;
    if(!item.image && item.imagen_url)        item.image       = item.imagen_url;
    if(!item.category && item.categoria)      item.category    = item.categoria;
    if(!item.price && item.precio)            item.price       = item.precio;
    if(!item.badge && item.etiqueta)          item.badge       = item.etiqueta;
    if(item.etiqueta === undefined && item.badge) item.etiqueta = item.badge;
    if(!item.id || used.has(item.id)){
      item.id = (Date.now() + Math.floor(Math.random()*1000000)).toString();
    }
    item.id = String(item.id);
    used.add(item.id);
    item._custom = true;
    return item;
  });
}

async function loadProducts(){
  try{
    const res = await sbFetch('/rest/v1/"Productos"?select=*&order=id.asc');
    if(!res.ok){
      console.error('Failed to load products');
      CATALOG = [];
      return [];
    }
    const data = await res.json();
    CATALOG = normalizeProducts(data);
    return CATALOG;
  } catch(e) {
    console.error('Error loading products from Supabase:', e);
    CATALOG = [];
    return [];
  }
}

function merged(){
  return CATALOG;
}
function getC(){
  return CATALOG;
}
`;
html = html.replace(dataBlockRegex, newDataBlock);

// 5. Save product
const saveProdRegex = /async function saveProd\(\)[\s\S]*?sw\('cat',document\.querySelector\('\\\[data-t="cat"\\\]'\)\);\n\}/;
const newSaveProd = `async function saveProd(){
  const nm=document.getElementById('fN').value.trim();
  const cat=document.getElementById('fC').value;
  if(!nm){toast('Enter a product name','er');return;}
  if(!cat){toast('Select a category','er');return;}

  const saveBtn=document.querySelector('.sb');
  if(saveBtn){saveBtn.disabled=true;saveBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...';}

  let imageUrl=document.getElementById('fI').value.trim()||document.getElementById('fImg').value||FB;

  if(window._pendingUploadFile){
    try{
      toast('⏫ Uploading image to cloud...','ok');
      imageUrl=await sbUploadImage(window._pendingUploadFile);
      window._pendingUploadFile=null;
      toast('✅ Image uploaded!','ok');
    }catch(e){
      toast('⚠️ Image upload failed, saving without cloud image','er');
    }
  }

  try{
    const res = await sbFetch('/rest/v1/"Productos"',{
      method:'POST',
      headers:{'Prefer':'return=representation'},
      body:JSON.stringify({
        nombre:nm,
        descripcion:document.getElementById('fD').value.trim(),
        categoria:cat,
        precio:document.getElementById('fP').value?parseFloat(document.getElementById('fP').value):null,
        imagen_url:imageUrl&&!imageUrl.startsWith('data:')?imageUrl:null,
        etiqueta:document.getElementById('fB').value||null
      })
    });
    if(!res.ok){const e=await res.text();throw new Error(e);}
    toast('☁️ Saved to Supabase!','ok');
  }catch(e){
    toast('⚠️ Cloud save failed: '+e.message.slice(0,80),'er');
    if(saveBtn){saveBtn.disabled=false;saveBtn.innerHTML='<i class="fas fa-save"></i> Save Product';}
    return;
  }

  ['fN','fD','fP','fI','fImg'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fC').value='';document.getElementById('fB').value='';
  document.getElementById('dp2').style.display='none';document.getElementById('dz').classList.remove('hi');
  document.getElementById('aiAb').disabled=true;document.getElementById('aiR').classList.remove('on');
  upB64=null;aiD=null;upFileName='';
  if(saveBtn){saveBtn.disabled=false;saveBtn.innerHTML='<i class="fas fa-save"></i> Save Product';}
  
  await loadProducts();
  upS();
  sw('cat',document.querySelector('[data-t="cat"]'));
}`;
html = html.replace(saveProdRegex, newSaveProd);

// 6. Fix Edit
const saveEditRegex = /async function saveEdit\(\)[\s\S]*?upS\(\);rl\(\);closeEdit\(\);toast\('✅ Updated!','ok'\);\n\}/;
const newSaveEdit = `async function saveEdit(){
  if(!eId)return;const nm=document.getElementById('mN').value.trim();if(!nm){toast('Name required','er');return;}
  const cat=document.getElementById('mC').value;
  const orig=CATALOG.find(p=>String(p.id)===String(eId))||{};
  const newImg=document.getElementById('mI').value.trim()||orig.image;

  try{
    const res = await sbFetch('/rest/v1/"Productos"?id=eq.'+eId,{
      method:'PATCH',
      headers:{'Prefer':'return=representation'},
      body:JSON.stringify({
        nombre:nm,
        descripcion:document.getElementById('mD').value.trim(),
        categoria:cat,
        precio:document.getElementById('mP').value?parseFloat(document.getElementById('mP').value):null,
        imagen_url:newImg&&!newImg.startsWith('data:')?newImg:null,
        etiqueta:document.getElementById('mB').value||null
      })
    });
    if(!res.ok) throw new Error(await res.text());
    toast('☁️ Updated in Supabase!','ok');
  }catch(e){
    toast('⚠️ Cloud update failed','er');
    return;
  }

  await loadProducts();
  upS();rl();closeEdit();toast('✅ Updated!','ok');
}`;
html = html.replace(saveEditRegex, newSaveEdit);

// 7. Fix Delete
const delPRegex = /async function delP\(id\)[\s\S]*?upS\(\);rl\(\);toast\('🗑️ Deleted','ok'\);\n\}/;
const newDelP = `async function delP(id){
  if(!confirm('Delete this product?'))return;
  try{
    const res = await sbFetch('/rest/v1/"Productos"?id=eq.'+id,{method:'DELETE'});
    if(!res.ok) throw new Error(await res.text());
    toast('☁️ Deleted from Supabase','ok');
  }catch(e){
    toast('⚠️ Cloud delete failed','er');
    return;
  }
  
  await loadProducts();
  upS();rl();
}`;
html = html.replace(delPRegex, newDelP);

// 8. Fix applyMatches
const applyMatchesRegex = /function applyMatches\(\)[\s\S]*?document\.getElementById\('applyMatchBtn'\)\.style\.display='none';\n\}/;
const newApplyMatches = `async function applyMatches(){
  let count=0;
  for(const m of matchData.filter(m=>m.id&&m.file)){
    const newImg='images/'+m.file;
    try{
      await sbFetch('/rest/v1/"Productos"?id=eq.'+m.id,{
        method:'PATCH',
        body:JSON.stringify({ imagen_url: newImg })
      });
      count++;
    } catch(e){}
  }
  await loadProducts();
  rl();toast('✅ Applied '+count+' image matches!','ok');
  document.getElementById('applyMatchBtn').style.display='none';
}`;
html = html.replace(applyMatchesRegex, newApplyMatches);

// 9. Remove all Priority 2 DB data sync logic
const exportDataRegex = /\/\/ ══════════════════════════════════════════════════[\s\S]*?\/\/ PRIORITY 2: DATA PERSISTENCE — SURVIVE DEPLOYS[\s\S]*?async function autoLoadOverride\(\) { return loadProducts\(\); }\n/;
html = html.replace(exportDataRegex, '');

fs.writeFileSync('admin.html', html);
console.log('Refactor complete!');
