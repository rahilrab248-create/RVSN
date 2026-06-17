import type { ProductSize } from "@/types/ecommerce";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  brand: string;
  sizes: ProductSize[];
  stock: number;
  price: number;
  rating: number;
  featured: boolean;
  colorway: string;
  badge: string;
  imageUrl: string;
  detailHref?: string;
};

export type CatalogReview = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
};

export const catalogCategories: CatalogCategory[] = [
  {
    id: "jerseys",
    name: "Jerseys",
    slug: "jerseys",
    description: "Match-ready shirts, heritage kits, and tunnel-grade club style.",
  },
  {
    id: "boots",
    name: "Boots",
    slug: "boots",
    description: "Speed, control, and power boots engineered for every surface.",
  },
  {
    id: "training",
    name: "Training",
    slug: "training",
    description: "Layers, gloves, bags, and everyday football equipment.",
  },
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "volt-strike-jersey",
    title: "Volt Strike Jersey",
    description:
      "A high-contrast match jersey with ventilated panels, sharp club energy, and a lightweight performance cut.",
    images: ["/images/products/volt-strike-jersey.webp"],
    category: "jerseys",
    brand: "Fooltball Elite",
    sizes: ["S", "M", "L", "XL"],
    stock: 42,
    price: 89,
    rating: 4.8,
    featured: true,
    colorway: "from-lime-300 via-emerald-300 to-slate-950",
    badge: "Hot drop",
    imageUrl: "/images/products/volt-strike-jersey.webp",
  },
  {
    id: "night-derby-jersey",
    title: "Night Derby Jersey",
    description:
      "A cinematic away kit built for floodlights, city derbies, and sharp everyday styling.",
    images: ["/images/products/night-derby-jersey.avif", "/images/products/night-derby-jersey_1.avif" ,"/images/products/night-derby-jersey_2.avif"],
    category: "jerseys",
    brand: "Fooltball Studio",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 36,
    price: 95,
    rating: 4.7,
    featured: true,
    colorway: "from-sky-300 via-fuchsia-300 to-slate-950",
    badge: "City edition",
    imageUrl: "/images/products/night-derby-jersey.avif",
  },
  {
    id: "heritage-gold-jersey",
    title: "Heritage Gold Jersey",
    description:
      "A limited third kit with gold accents, deep red blocking, and a premium collector feel.",
    images: ["/images/products/heritage-gold-jersey.webp", "/images/products/heritage-gold-jersey_1.webp", "/images/products/heritage-gold-jersey_2.webp"],
    category: "jerseys",
    brand: "Fooltball Archive",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    price: 109,
    rating: 4.9,
    featured: false,
    colorway: "from-amber-300 via-red-500 to-slate-950",
    badge: "Limited",
    imageUrl: "/images/products/heritage-gold-jersey.webp",
  },
   {
    id: "the_siujersey-red",
    title: "The Siu Jersey - Red",
    description:
      "The shield of Portugal and his iconic celebration, The Siu. His club history from Lisbon to Riyadh.",
    images: ["/images/products/the_siujersey-red.webp", "/images/products/the_siujersey-red_1.webp", "/images/products/the_siujersey-red_2.webp"],
    category: "jerseys",
    brand: "Fooltball Archive",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    price: 109,
    rating: 4.9,
    featured: false,
    colorway: "from-amber-300 via-red-500 to-slate-950",
    badge: "Limited",
    imageUrl: "/images/products/the_siujersey-red.webp",
  },
   {
    id: "mexico_heritage_jersey",
    title: "Mexico Heritage Jersey (2026WC Edition) - Black",
    description:
      "A pattern inspired by Mexico's iconic 1998 jersey and the Mexican coat of arms with the eagle representing strength, the snake representing wisdom and the prickly pear cactus representing the Aztec capital city, Tenochtitlan.",
    images: ["/images/products/mexico_heritage_jersey.webp", "/images/products/mexico_heritage_jersey_1.webp", "/images/products/mexico_heritage_jersey_2.webp"],
    category: "jerseys",
    brand: "Fooltball Archive",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    price: 109,
    rating: 4.9,
    featured: false,
    colorway: "from-amber-300 via-red-500 to-slate-950",
    badge: "Limited",
    imageUrl: "/images/products/mexico_heritage_jersey.webp",
  },
   {
    id: "the_parisians",
    title: "The Parisians (2025 European Champions) Away Jersey",
    description:
      "A bespoke jersey for PSG - your 2025 UCL champions.",
    images: ["/images/products/the_parisians.webp", "/images/products/the_parisians_1.webp", "/images/products/the_parisians_2.webp"],
    category: "jerseys",
    brand: "Fooltball Archive",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    price: 99,
    rating: 4.9,
    featured: false,
    colorway: "from-amber-300 via-red-500 to-slate-950",
    badge: "Limited",
    imageUrl: "/images/products/the_parisians.webp",
  },
  {
    id: "aero-phantom-fg",
    title: "Aero Phantom FG",
    description:
      "A featherweight firm-ground boot with aggressive traction and a streamlined speed silhouette.",
    images: ["/images/products/aero-phantom-fg.avif", "/images/products/aero-phantom-fg_1.avif", "/images/products/aero-phantom-fg_2.avif"],
    category: "boots",
    brand: "AeroLab",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    stock: 29,
    price: 219,
    rating: 4.8,
    featured: true,
    colorway: "from-cyan-300 via-lime-200 to-slate-950",
    badge: "Speed",
    imageUrl: "/images/products/aero-phantom-fg.avif",
  },
  {
    id: "control-matrix-elite",
    title: "Control Matrix Elite",
    description:
      "A grip-textured control boot for midfielders who want first touch, spin, and stability.",
    images: ["/images/products/control-matrix-elite.webp" ,"/images/products/control-matrix-elite_1.webp", "/images/products/control-matrix-elite_2.webp"],
    category: "boots",
    brand: "Matrix Football",
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 12"],
    stock: 24,
    price: 199,
    rating: 4.6,
    featured: false,
    colorway: "from-violet-300 via-white to-slate-950",
    badge: "Control",
    imageUrl: "/images/products/control-matrix-elite.webp",
  },
  {
    id: "predator-pulse-pro",
    title: "Predator Pulse Pro",
    description:
      "A power-focused boot with strike-zone texture, locked-in fit, and a plated sole for confident finishing.",
    images: ["/images/products/predator-pulse-pro.avif", "/images/products/predator-pulse-pro_1.avif", "/images/products/predator-pulse-pro_2.avif"],
    category: "boots",
    brand: "StrikeLab",
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    stock: 31,
    price: 229,
    rating: 4.7,
    featured: true,
    colorway: "from-red-400 via-orange-300 to-slate-950",
    badge: "Power",
    imageUrl: "/images/products/predator-pulse-pro.avif" ,
  },
    {
    id: "adidas_copag_gloro",
    title: "Adidas Copa Gloro II FG",
    description:
      "Updated with a lighter design and heritage details from adi’s classic boots, the Copa Gloro II provides old-school inspiration for today’s all-action players. The super-soft cow leather upper’s quilted forefoot provides the cushioned touch you expect from the Gloro, while perforations at the midfoot and heel aid breathability to keep you fresh.",
    images: ["/images/products/adidas_copag_gloro.webp", "/images/products/adidas_copag_gloro_1.webp", "/images/products/adidas_copag_gloro_2.webp"],
    category: "boots",
    brand: "StrikeLab",
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    stock: 31,
    price: 229,
    rating: 4.7,
    featured: true,
    colorway: "from-red-400 via-orange-300 to-slate-950",
    badge: "Power",
    imageUrl: "/images/products/adidas_copag_gloro.webp" ,
  },
    {
    id: "mizuno_morelia_neo",
    title: "Mizuno Morelia Neo IV Beta Elite FG",
    description:
      "A power-focused boot with strike-zone texture, locked-in fit, and a plated sole for confident finishing.",
    images: ["/images/products/mizuno_morelia_neo.webp", "/images/products/mizuno_morelia_neo_1.webp", "/images/products/mizuno_morelia_neo_2.webp"],
    category: "boots",
    brand: "StrikeLab",
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    stock: 31,
    price: 229,
    rating: 4.7,
    featured: true,
    colorway: "from-red-400 via-orange-300 to-slate-950",
    badge: "Power",
    imageUrl: "/images/products/mizuno_morelia_neo.webp" ,
  },
  {
    id: "rain-ready-training-layer",
    title: "Rain Ready Training Layer",
    description:
      "A lightweight weather layer with stretch panels, quiet finish, and matchday-ready zip storage.",
    images: ["/images/products/rain-ready-training-layer.webp"],
    category: "training",
    brand: "Fooltball Training",
    sizes: ["S", "M", "L", "XL"],
    stock: 51,
    price: 129,
    rating: 4.5,
    featured: false,
    colorway: "from-emerald-300 via-slate-200 to-slate-950",
    badge: "Training",
    imageUrl: "/images/products/rain-ready-training-layer.webp",
  },
  {
    id: "elite-grip-gloves",
    title: "Elite Grip Goalkeeper Gloves",
    description:
      "Premium latex goalkeeper gloves with a wrapped thumb, negative cut, and wet-weather contact grip.",
    images: ["/images/products/elite-grip-gloves.webp"],
    category: "training",
    brand: "Keeper Union",
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    price: 79,
    rating: 4.6,
    featured: true,
    colorway: "from-lime-300 via-white to-slate-950",
    badge: "Grip",
    imageUrl: "/images/products/elite-grip-gloves.webp",
  },
   {
    id: "adidas_predator_training_gloves",
    title: "Adidas Predator Training Gloves",
    description:
      "adidas Predator Training goalkeeper gloves mounted on a flat cut in White-Lucid lemon colourway.",
    images: ["/images/products/adidas_predator_training_gloves.webp", "/images/products/adidas_predator_training_gloves_1.webp", "/images/products/adidas_predator_training_gloves_2.webp"],
    category: "training",
    brand: "Keeper Union",
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    price: 79,
    rating: 4.6,
    featured: true,
    colorway: "from-lime-300 via-white to-slate-950",
    badge: "Grip",
    imageUrl: "/images/products/adidas_predator_training_gloves.webp",
  },
   {
    id: "adidas_copa_match_fingersave_gloves",
    title: "Adidas Copa Match Fingersave Gloves",
    description:
      "Premium latex goalkeeper gloves with a wrapped thumb, negative cut, and wet-weather contact grip.",
    images: ["/images/products/adidas_copa_match_fingersave_gloves.webp" ,"/images/products/adidas_copa_match_fingersave_gloves_1.webp", "/images/products/adidas_copa_match_fingersave_gloves_2.webp"],
    category: "training",
    brand: "Keeper Union",
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    price: 50,
    rating: 4.8,
    featured: true,
    colorway: "from-lime-300 via-white to-slate-950",
    badge: "Grip",
    imageUrl: "/images/products/adidas_copa_match_fingersave_gloves.webp",
  },
];

export const catalogReviews: CatalogReview[] = [
  {
    id: "review-1",
    productId: "volt-strike-jersey",
    userName: "Omar A.",
    rating: 5,
    comment: "Feels elite and the color pops under lights. The fit is sharp without being too tight.",
  },
  {
    id: "review-2",
    productId: "volt-strike-jersey",
    userName: "Daniel R.",
    rating: 4,
    comment: "Great material and premium look. I would size up if you like a looser street fit.",
  },
  {
    id: "review-3",
    productId: "aero-phantom-fg",
    userName: "Maya K.",
    rating: 5,
    comment: "Very light, responsive, and the soleplate feels fast on firm grass.",
  },
  {
    id: "review-4",
    productId: "predator-pulse-pro",
    userName: "Yousef M.",
    rating: 5,
    comment: "The strike texture is excellent. These feel made for shooting practice.",
  },
];

export function getCatalogProduct(productId: string) {
  return catalogProducts.find((product) => product.id === productId) ?? null;
}

export function getCatalogCategory(slug: string) {
  return catalogCategories.find((category) => category.slug === slug) ?? null;
}

export function getProductsByCatalogCategory(slug: string) {
  return catalogProducts.filter((product) => product.category === slug);
}

export function getRelatedCatalogProducts(product: CatalogProduct) {
  return catalogProducts
    .filter((item) => item.id !== product.id && (item.category === product.category || item.brand === product.brand))
    .slice(0, 4);
}

export function getCatalogReviews(productId: string) {
  return catalogReviews.filter((review) => review.productId === productId);
}
