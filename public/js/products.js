/**
 * CampusCart - Student Shopping Store
 * Product Database & Catalog Management
 */

const PRODUCTS = [
  {
    id: 1,
    name: "Campus Backpack",
    price: 1299,
    originalPrice: 1999,
    category: "College Essentials",
    rating: 4.8,
    reviewsCount: 142,
    image: "images/backpack.jpg",
    description: "Water-resistant student backpack engineered with a dedicated padded 15.6\" laptop compartment, external USB charging port, ergonomic ventilated mesh back panel, and water bottle side pockets.",
    features: [
      "Dedicated padded sleeve for up to 15.6-inch laptops",
      "External USB pass-through port for charging on the go",
      "Water-repellent durable polyester oxford fabric",
      "Ergonomic S-curve breathable shoulder straps"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 2,
    name: "Premium Notebook",
    price: 249,
    originalPrice: 349,
    category: "Study Essentials",
    rating: 4.9,
    reviewsCount: 215,
    image: "images/notebook.svg",
    description: "Hardcover college-ruled journal designed for extensive lecture notes. Features 192 thick, bleed-proof 100 GSM cream pages, ribbon bookmark, inner storage pocket, and elastic band closure.",
    features: [
      "192 pages (96 sheets) of 100 GSM acid-free ivory paper",
      "Durable faux-leather hardcover with gold foil detailing",
      "Lies completely flat at 180° for easy writing",
      "Expandable back pocket for loose handouts and slips"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 3,
    name: "Gel Pen Set",
    price: 199,
    originalPrice: 299,
    category: "Study Essentials",
    rating: 4.7,
    reviewsCount: 184,
    image: "images/gel-pens.svg",
    description: "Set of 8 precision 0.5mm quick-drying gel pens in classic and vibrant campus ink colors. Glides smoothly across pages without smearing, leaking, or skipping during fast exams.",
    features: [
      "0.5mm Japanese ultra-fine tungsten carbide tip",
      "Super quick-dry pigment ink prevents hand smudges",
      "Ergonomic soft matte rubber grip for fatigue-free exams",
      "Includes 8 pens: 3 Navy, 2 Black, 1 Red, 1 Green, 1 Sky Blue"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    price: 599,
    originalPrice: 899,
    category: "Lifestyle",
    rating: 4.8,
    reviewsCount: 168,
    image: "images/water-bottle.svg",
    description: "Vacuum-insulated double-wall 750ml stainless steel flask. Keeps water ice-cold for 24 hours or coffee hot for 12 hours. Sweat-proof finish with an easy-carry carabiner loop lid.",
    features: [
      "Double-walled vacuum insulation: 24h cold, 12h hot",
      "Food-grade 304 (18/8) stainless steel, 100% BPA-free",
      "Leak-proof screw top with sturdy finger-carry loop",
      "Wide mouth accommodates ice cubes and simplifies cleaning"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 5,
    name: "Adjustable Laptop Stand",
    price: 899,
    originalPrice: 1499,
    category: "Tech Accessories",
    rating: 4.9,
    reviewsCount: 190,
    image: "images/laptop-stand.svg",
    description: "Ergonomic aluminum laptop riser with 6 adjustable height angles to eliminate neck and back strain during long study sessions. Features hollow ventilation and anti-slip silicone cushions.",
    features: [
      "6-level adjustable ergonomic tilt from 15° to 45°",
      "Sturdy aerospace-grade aluminum alloy construction",
      "Hollow cooling design maximizes laptop airflow",
      "Folds completely flat and fits inside any backpack pocket"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 6,
    name: "Wireless Headphones",
    price: 1899,
    originalPrice: 2999,
    category: "Tech Accessories",
    rating: 4.7,
    reviewsCount: 112,
    image: "images/headphones.jpg",
    description: "Over-ear Bluetooth headphones with hybrid active noise cancellation (ANC), crystal-clear microphone for online lectures, deep bass 40mm audio drivers, and up to 40 hours of playtime.",
    features: [
      "Active Noise Cancellation for quiet dorm and library study",
      "Up to 40 hours battery life with USB-C quick charging",
      "Ultra-soft breathable protein leather ear cushions",
      "Low latency Bluetooth 5.3 + backup 3.5mm audio cable included"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 7,
    name: "LED Study Lamp",
    price: 749,
    originalPrice: 1199,
    category: "Tech Accessories",
    rating: 4.8,
    reviewsCount: 136,
    image: "images/lamp.jpg",
    description: "Modern minimalist desk lamp with flicker-free eye protection. Offers 3 lighting modes (Warm, Natural, Cool White) with stepless touch brightness dimming and a 360-degree flexible gooseneck.",
    features: [
      "Flicker-free eye-care LEDs prevent late-night study fatigue",
      "3 color modes (3000K, 4500K, 6000K) with touch dimming",
      "360° flexible silicone neck for tailored light direction",
      "Built-in phone rest stand on base for hands-free video classes"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 8,
    name: "College ID Card Holder",
    price: 149,
    originalPrice: 249,
    category: "College Essentials",
    rating: 4.6,
    reviewsCount: 89,
    image: "images/id-card-holder.svg",
    description: "Premium vegan leather student ID badge holder with dual transparent windows for college pass, metro cards, and library card. Includes a comfortable fabric lanyard and heavy-duty metal clip.",
    features: [
      "Front transparent window + back quick-access card slot",
      "Reinforced heavy-duty metal swivel lobster clasp",
      "Premium water-resistant PU leather stitching",
      "Comfortable wide polyester neck lanyard strap"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 9,
    name: "Pencil Case",
    price: 299,
    originalPrice: 449,
    category: "Study Essentials",
    rating: 4.8,
    reviewsCount: 154,
    image: "images/pencil-case.svg",
    description: "High-capacity multi-compartment canvas pencil case. Expands to hold over 50 pens, highlighters, compass, calculator, and sticky notes with structured interior mesh organizers.",
    features: [
      "Large expandable interior holding up to 50+ pens and pencils",
      "Interior mesh zip pocket for small USBs, eraser, and lead",
      "Elastic pen loop flap for instant access to daily writing tools",
      "Durable washable oxford fabric with smooth metallic zippers"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 10,
    name: "USB Study Light",
    price: 179,
    originalPrice: 299,
    category: "Tech Accessories",
    rating: 4.5,
    reviewsCount: 96,
    image: "images/usb-light.svg",
    description: "Pocket-sized flexible USB LED stick light. Plugs directly into your laptop, power bank, or USB wall adapter to illuminate your desk without disturbing roommates during midnight study sessions.",
    features: [
      "Direct USB plug-and-play with zero batteries needed",
      "Flexible metal snake neck holds any curved position",
      "Gentle diffuse lighting panel shields eyes from direct glare",
      "Compact 17cm length slips into any notebook pouch"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 11,
    name: "Sticky Notes Pack",
    price: 129,
    originalPrice: 199,
    category: "Study Essentials",
    rating: 4.7,
    reviewsCount: 245,
    image: "images/sticky-notes.svg",
    description: "500-sheet study divider pack featuring self-adhesive pastel memo pads and colorful fluorescent index arrow flags. Clean release adhesive leaves zero sticky residue on textbook pages.",
    features: [
      "500 total sheets: 100 pastel squares + 400 colored index tabs",
      "Strong adhesion that re-sticks cleanly without paper damage",
      "Smooth paper surface accepts all pen, pencil, and gel inks",
      "Essential for textbook bookmarking, thesis review, and revisions"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 12,
    name: "Desk Organizer",
    price: 449,
    originalPrice: 699,
    category: "College Essentials",
    rating: 4.8,
    reviewsCount: 167,
    image: "images/desk-organizer.svg",
    description: "6-compartment metal mesh desktop caddy with a slide-out drawer. Declutters dorm room study tables by holding pens, notebooks, staplers, calculators, sticky notes, and phones.",
    features: [
      "6 multi-functional compartments + 1 pull-out sliding drawer",
      "Durable steel wire mesh with rust-resistant epoxy coating",
      "Four non-slip silicone pads prevent scratching table surfaces",
      "Compact footprint (22 x 14 x 13 cm) fits dorm study corners"
    ],
    inStock: true,
    isFeatured: true
  }
];

// Helper functions
function getProductById(id) {
  const numId = parseInt(id, 10);
  return PRODUCTS.find(p => p.id === numId) || null;
}

function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.isFeatured);
}

function getAllCategories() {
  return ["All", "Study Essentials", "Tech Accessories", "College Essentials", "Lifestyle"];
}

function formatPrice(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}
