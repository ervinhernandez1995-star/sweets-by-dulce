# Admin.html Structure Analysis

## 1. PRODUCT FORM DEFINITIONS

### A. ADD PRODUCT FORM (Lines 328-368)
**Location:** `<!-- ADD PRODUCT -->` tab section, inside `#t-add` div

**Form Structure:**
- **Photo Upload Section** (Lines 333-348)
  - Drop zone: `#dz` (id="dz")
  - File input: `#fi2` (id="fi2") - accepts image/*
  - Preview img: `#dp2` (id="dp2")
  - AI Analyze button: `#aiAb` (id="aiAb") - calls `aiAnalyzeImage()`

- **AI Result Display** (Lines 350-356)
  - Container: `#aiR` (id="aiR") - hidden by default
  - Shows: description, price, suggestions

- **Main Form Grid** (Lines 357-368)
  - Form class: `.fg` (grid layout, 2 columns)
  - Contains 6 input fields (see field list below)

**Form Input Fields:**
```
┌─────────────────────────────────────────┐
│ Product Name *         │ Starting Price  │
│ fN (text)              │ fP (number)    │
├─────────────────────────────────────────┤
│ Description (full width)                 │
│ fD (textarea)                           │
├─────────────────────────────────────────┤
│ Category *             │ Badge           │
│ fC (select)            │ fB (select)    │
├─────────────────────────────────────────┤
│ Or paste image URL (full width)         │
│ fI (text)                               │
└─────────────────────────────────────────┘
```

### B. EDIT PRODUCT MODAL (Lines 680-735)
**Location:** `<!-- Edit Modal -->` div, class `em` (edit modal)

**Modal Structure:**
- Header: "✏️ Edit Product" with close button (Line 683-686)
- AI Suggestion button: `#eAiAb` (Line 687) - calls `aiEditGroq()`
- AI Result box: `#eAiR` (Lines 689-697)
- Form Grid: Same structure as ADD form (Lines 698-718)

**Form Input Fields in Edit Modal:**
```
┌─────────────────────────────────────────┐
│ Name *                 │ Price ($)       │
│ mN (text)              │ mP (number)    │
├─────────────────────────────────────────┤
│ Description (full width)                 │
│ mD (textarea)                           │
├─────────────────────────────────────────┤
│ Category               │ Badge           │
│ mC (select)            │ mB (select)    │
├─────────────────────────────────────────┤
│ Image URL / filename (full width)       │
│ mI (text)                               │
└─────────────────────────────────────────┘
```

---

## 2. SAVE/UPDATE FUNCTIONS

### Function 1: `saveProd()` (Lines 619-689)
**Purpose:** Save new product to Supabase DB and localStorage

**Function Flow:**
1. Validates: Product name and category required
2. Handles image upload (if file was dropped/selected)
3. Saves to Supabase DB with Spanish field names
4. Saves to localStorage as fallback
5. Syncs to cloud JSON
6. Clears form and switches to Catalog tab

**Key Operations:**
- Lines 622-628: Input validation
- Lines 630-636: Image upload handling
- Lines 639-652: Supabase save operation
- Lines 654-662: localStorage fallback save
- Lines 664-669: Form reset

### Function 2: `saveEdit()` (Lines 1008-1031)
**Purpose:** Update an existing product

**Function Flow:**
1. Validates: Product name required (Line 1010)
2. Merges original + new data (Line 1014)
3. Updates in localStorage (Line 1017)
4. Updates in Supabase if it has DB ID (Lines 1020-1025)
5. Syncs to cloud JSON (Line 1027)
6. Refreshes display and closes modal

**Key Operations:**
- Line 1014: Find original product
- Line 1017: Update local copy
- Lines 1020-1025: Conditional Supabase update
- Line 1027: Cloud sync

### Function 3: `openEdit(id)` (Lines 1002-1012)
**Purpose:** Load product data into edit modal form

**Function Flow:**
1. Find product by ID from merged list (Line 1004)
2. Populate all form fields (Lines 1005-1009)
3. Reset AI suggestion state (Lines 1010-1011)
4. Show modal (Line 1012)

**Field Population (Lines 1005-1009):**
```javascript
document.getElementById('mN').value = p.title
document.getElementById('mD').value = p.description
document.getElementById('mC').value = p.category
document.getElementById('mP').value = p.price
document.getElementById('mB').value = p.badge
document.getElementById('mI').value = p.image
```

---

## 3. FIELDS BEING SAVED

### A. Product Data Structure (JavaScript Object)
```javascript
{
  id:              String (generated or from Supabase),
  title:           String (product name),
  description:     String (product description),
  category:        String (cakes|cupcakes|specialty|holiday|pies|drinks),
  categoryLabel:   String (display name, e.g., "🎂 Cakes"),
  price:           Number (starting price),
  badge:           String (""|best-seller|limited|new),
  image:           String (URL, filename, or base64),
  _custom:         Boolean (true if added/edited in admin),
  _added:          Number (timestamp),
  _sbId:           String (Supabase DB ID)
}
```

### B. Supabase Table Fields (Spanish naming)
```javascript
// What gets sent to Supabase DB:
{
  nombre:         String,      // = title
  descripcion:    String,      // = description
  categoria:      String,      // = category
  precio:         Number,      // = price
  imagen_url:     String       // = image URL only (not base64 or data URIs)
}

// NOTE: 'badge' is NOT stored in Supabase DB
// It's a local-only field (stored in localStorage with _custom products)
```

### C. localStorage Storage Keys
- **Main catalog:** Key `SK` = `'sbd_products'`
  - Stores: Array of product objects (JavaScript format)
  
- **Image cache:** Keys like `'sbd_img_' + p.id`
  - Stores: Base64 data URIs (if image was uploaded locally)
  - Referenced as: `'__local:sbd_img_...'` in product.image field

- **Deleted products:** Key `DK` = `'sbd_deleted'`
  - Stores: Set of deleted product IDs

---

## 4. WHERE ETIQUETA FIELD SHOULD BE ADDED

### Current Status: ✅ ALREADY EXISTS

The "Badge" field is the equivalent of "Etiqueta" and is **already implemented**:

#### In ADD PRODUCT Form (Lines 350-356):
```html
<div class="fi">
  <label>Badge</label>
  <select id="fB">
    <option value="">None</option>
    <option value="best-seller">⭐ Best Seller</option>
    <option value="limited">✨ Limited Edition</option>
    <option value="new">🆕 New</option>
  </select>
</div>
```

#### In EDIT MODAL (Lines 729-732):
```html
<div class="fi">
  <label>Badge</label>
  <select id="mB">
    <option value="">None</option>
    <option value="best-seller">⭐ Best Seller</option>
    <option value="limited">✨ Limited Edition</option>
    <option value="new">🆕 New</option>
  </select>
</div>
```

#### In Catalog List Display (Line 942):
```javascript
(isC?'<span class="mk cu">✏️ Edited</span>':'')
// Badges are NOT displayed in catalog - only stored
```

### How Badge Data Flows:
1. **Added/Edited:** Form field `fB` or `mB` captures value
2. **Saved:** `badge: document.getElementById('fB').value || null`
3. **Stored:** In product object as `badge` property (localStorage only)
4. **Synced to Supabase:** ❌ NOT synced (no column in DB)
5. **Display:** Currently only shown in edit modal, not in catalog view

---

## 5. PRODUCT LOADING FUNCTIONS

### A. Initial Load on Page Open
**Function:** `loadProducts()` (Lines 480-512)

**Purpose:** Load products from cloud on page startup

**Execution Path:**
1. Try fetch `products-override.json` from Supabase Storage (Line 485)
2. Normalize product fields (Spanish → English field mapping) (Line 488)
3. Mark as `_custom: true` (Line 488)
4. Store in localStorage (Line 489)
5. Fallback to Supabase DB table if override fails (Line 497)
6. Fallback to empty array if all fail (Line 506)

**Called from:** `init()` function at Line 550

### B. Merge Local + Cloud Data
**Function:** `merged()` (Line 521)

**Purpose:** Return all products (cloud + custom/edited)

**Code:**
```javascript
function merged(){
  return getC().map(p=>({...p,_cu:true}));
}
```

**Note:** This returns only localStorage items with `_cu: true` marker

### C. Get Custom Products Only
**Function:** `getC()` (Lines 449-455)

**Purpose:** Retrieve custom/edited products from localStorage

**Code:**
```javascript
function getC(){
  try {
    const raw = JSON.parse(localStorage.getItem(SK)||'[]');
    return raw.map(p => ({...p, image: resolveImg(p.image)}));
  } catch(e){ return []; }
}
```

**Processing:**
- Fetches from key `SK` = `'sbd_products'`
- Resolves image references (base64 cache recovery)
- Returns empty array if parse fails

### D. Product List Rendering
**Function:** `rl()` (Lines 943-983)

**Purpose:** Render product catalog in admin with filters/search

**Execution:**
1. Get search query from input `#pS` (Line 945)
2. Get category filter from `#pCF` (Line 946)
3. Get source filter from `#pSF` (custom|base|all) (Line 946)
4. Filter merged list by query/category/source (Lines 948-951)
5. Apply pagination (PGS = 18 per page) (Lines 952-953)
6. Render each product card (Lines 957-978)

**Displayed Fields in Catalog:**
- Image: `p.image` (Line 969)
- Name: `p.title` (Line 971)
- Category badge: `CL[p.category]` (Line 972)
- Price: `p.price` (conditional) (Line 973)
- Custom marker: "✏️ Edited" if custom (Line 974)

**Note:** Badge values (best-seller, limited, new) are NOT displayed in catalog list

---

## 6. FIELD MAPPING SUMMARY TABLE

| Form Field | HTML ID | Data Property | Supabase Field | Notes |
|-----------|---------|--------|--------|-------|
| Product Name | `fN` (add) / `mN` (edit) | `title` | `nombre` | Required |
| Description | `fD` / `mD` | `description` | `descripcion` | Optional |
| Category | `fC` / `mC` | `category` | `categoria` | Required, 6 options |
| Starting Price | `fP` / `mP` | `price` | `precio` | Optional, number |
| Badge/Etiqueta | `fB` / `mB` | `badge` | ❌ NOT SYNCED | Local only |
| Image | `fI` / `mI` | `image` | `imagen_url` | URL or filename |
| Image Upload | `fi2` (add only) | Via `_pendingUploadFile` | Auto-uploaded URL | Supabase Storage |

---

## 7. AI INTEGRATION POINTS

### Image Analysis Function
**Function:** `aiAnalyzeImage()` (Lines 765-800)

**Analyzes:**
- Product name (optional)
- Category
- Image filename hint
- Generates: Description, suggested price, badge recommendation

**Triggers:** `#aiAb` button click

**Populates:** `aiD` object, shows `#aiR` result box

**Apply:** `useAI()` function (Lines 802-808) copies results to form

### Edit Modal AI
**Function:** `aiEditGroq()` (Lines 811-841)

**Similar to image analysis but for editing existing products**

**Populates:** `editAiD` object, shows `#eAiR` result box

**Apply:** `useAIEdit()` function (Lines 842-849)

---

## 8. LIFECYCLE SUMMARY

### Adding a New Product:
```
User fills form (fN, fD, fC, fP, fB, fI)
         ↓
Click "Save Product" → saveProd()
         ↓
Validate name + category
         ↓
Upload image (if file dropped) → sbUploadImage()
         ↓
Save to Supabase DB (Spanish fields)
         ↓
Save to localStorage (full object with badge)
         ↓
Sync to products-override.json → syncProductsToCloud()
         ↓
Clear form, show Catalog tab
```

### Editing a Product:
```
User clicks ✏️ button on product card
         ↓
openEdit(id) loads data into modal form (mN, mD, mC, mP, mB, mI)
         ↓
User modifies fields
         ↓
Click "Save Changes" → saveEdit()
         ↓
Merge original + new data
         ↓
Update localStorage
         ↓
Update Supabase DB (if has _sbId)
         ↓
Sync to products-override.json
         ↓
Close modal, refresh catalog
```

### Loading Products on Page Open:
```
init() called on auth success
         ↓
loadProducts() – fetch products-override.json from Supabase Storage
         ↓
normalizeProducts() – map Spanish fields to English
         ↓
Store in localStorage
         ↓
updateStats() – refresh dashboard counts
         ↓
renderList() – show catalog in Catalog tab
```

---

## 9. KEY CONSTANTS & CONFIGURATION

```javascript
// Storage keys
const SK = 'sbd_products'           // Main catalog in localStorage
const DK = 'sbd_deleted'            // Deleted products set
const AK = 'sbd_analytics'          // Analytics log

// Pagination
const PGS = 18                      // Products per page

// Categories
const CL = {
  cakes: 'Cakes',
  cupcakes: 'Cupcakes',
  specialty: 'Specialty',
  holiday: 'Special Dates',
  pies: 'Pies & Tarts',
  drinks: 'Drinks'
}

// Badge options
// Options: "" | "best-seller" | "limited" | "new"

// Supabase config
const SB_URL = 'https://ybdybhrbtwuzninrgamv.supabase.co'
const SB_BUCKET = 'fotos-productos'
const OVERRIDE_BUCKET = 'products'
const OVERRIDE_FILE = 'products-override.json'
```

---

## 10. CONCLUSION

✅ **All 5 fields are already implemented:**
- nombre ✅ (title/fN/mN)
- descripcion ✅ (description/fD/mD)
- categoria ✅ (category/fC/mC)
- precio ✅ (price/fP/mP)
- etiqueta ✅ (badge/fB/mB - stored locally, not in Supabase DB)

❌ **Badge/Etiqueta is NOT synced to Supabase** - only stored in localStorage with _custom products. This is intentional per the code comments (Line 641: "NOTE: 'badge' column does not exist in Supabase tabla").

**Recommendation:** If you want to sync badges to Supabase, you would need to:
1. Add a `badge` column to the Supabase `productos` table
2. Modify `sbSaveProduct()` (Line 512) and `sbUpdateProduct()` (Line 516) to include the badge field
3. Update the save operations to pass the badge value
