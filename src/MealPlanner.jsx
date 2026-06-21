import React, { useState, useEffect } from "react";

/* ---------------------------------------------------------------------
   DATA LAYER — vegetable pool + dish pool with tags.
   Large and structured so the generator can do real rotation logic
   instead of picking from one fixed pre-made list.
--------------------------------------------------------------------- */

const VEGETABLES = [
  { id: "potato", name: "Potato", cat: "root" },
  { id: "carrot", name: "Carrot", cat: "root" },
  { id: "beetroot", name: "Beetroot", cat: "root" },
  { id: "sweet_potato", name: "Sweet potato", cat: "root" },
  { id: "onion", name: "Onion", cat: "allium" },
  { id: "garlic", name: "Garlic", cat: "allium" },
  { id: "ginger", name: "Ginger", cat: "allium" },
  { id: "tomato", name: "Tomato", cat: "fruitveg" },
  { id: "bell_pepper", name: "Bell pepper", cat: "fruitveg" },
  { id: "zucchini", name: "Zucchini", cat: "gourd" },
  { id: "bottle_gourd", name: "Bottle gourd (lauki)", cat: "gourd" },
  { id: "ridge_gourd", name: "Ridge gourd (turai)", cat: "gourd" },
  { id: "pumpkin", name: "Pumpkin", cat: "gourd" },
  { id: "cauliflower", name: "Cauliflower", cat: "crucifer" },
  { id: "cabbage", name: "Cabbage", cat: "crucifer" },
  { id: "broccoli", name: "Broccoli", cat: "crucifer" },
  { id: "spinach", name: "Spinach", cat: "leafy" },
  { id: "fenugreek_leaves", name: "Fenugreek leaves (methi)", cat: "leafy" },
  { id: "kale", name: "Kale", cat: "leafy" },
  { id: "green_beans", name: "Green beans", cat: "legume_pod" },
  { id: "peas", name: "Green peas", cat: "legume_pod" },
  { id: "okra", name: "Okra (bhindi)", cat: "pod" },
  { id: "eggplant", name: "Eggplant (brinjal)", cat: "fruitveg" },
  { id: "corn", name: "Sweet corn", cat: "kernel" },
  { id: "sweetcorn_baby", name: "Baby corn", cat: "kernel" },
  { id: "capsicum_red", name: "Red capsicum", cat: "fruitveg" },
];

const vegById = Object.fromEntries(VEGETABLES.map((v) => [v.id, v]));

const DEFAULT_HOUSEHOLD_SIZE = 3; // shown in Settings; cosmetic only, doesn't affect the grocery list

// Pantry / dairy items that recur — kept separate from rotation since
// they're restocked rather than "used up" the way produce is.
const PANTRY_STAPLES = [
  { id: "rice", name: "Rice", cat: "pantry" },
  { id: "atta", name: "Whole wheat flour (atta)", cat: "pantry" },
  { id: "toor_dal", name: "Toor dal", cat: "pantry" },
  { id: "moong_dal", name: "Moong dal", cat: "pantry" },
  { id: "chana_dal", name: "Chana dal", cat: "pantry" },
  { id: "masoor_dal", name: "Masoor dal (red lentils)", cat: "pantry" },
  { id: "besan", name: "Gram flour (besan)", cat: "pantry" },
  { id: "poha", name: "Poha (flattened rice)", cat: "pantry" },
  { id: "suji", name: "Semolina (suji/rava)", cat: "pantry" },
  { id: "oats", name: "Rolled oats", cat: "pantry" },
  { id: "bread", name: "Bread", cat: "pantry" },
  { id: "pasta", name: "Pasta", cat: "pantry" },
  { id: "chickpeas", name: "Chickpeas (chana)", cat: "pantry" },
  { id: "rajma", name: "Kidney beans (rajma)", cat: "pantry" },
  { id: "peanuts", name: "Peanuts", cat: "pantry" },
  { id: "idli_dosa_batter", name: "Idli / dosa batter", cat: "pantry" },
  { id: "protein_powder", name: "Protein powder", cat: "pantry" },
  { id: "banana", name: "Banana", cat: "pantry" },
];

const DAIRY = [
  { id: "milk", name: "Milk", cat: "dairy" },
  { id: "yogurt", name: "Yogurt / curd", cat: "dairy" },
  { id: "paneer", name: "Paneer", cat: "dairy" },
  { id: "butter", name: "Butter", cat: "dairy" },
  { id: "ghee", name: "Ghee", cat: "dairy" },
  { id: "cheese", name: "Cheese (mild)", cat: "dairy" },
];

/* ---------------------------------------------------------------------
   DISH POOL
   Each dish: id, name, slot, cuisine (indian/continental), style tag
   (used for day-pattern logic), vegIds, timeMins, pantryIds, dairyIds.
   `usesYogurt: true` marks dishes where yogurt is a primary component —
   these get a swap-friendly alternative shown alongside.
   No eggs, no mushroom anywhere in this pool.
   Minimums met: 15+ breakfasts, 20+ lunches, 10+ dinners.
--------------------------------------------------------------------- */

const DISHES = {
  breakfast: [
    { id: "idli_sambar", name: "Idli with sambar", cuisine: "indian", style: "batter", veg: ["onion", "tomato", "okra"], pantry: ["idli_dosa_batter", "toor_dal"], dairy: [], time: 25 },
    { id: "plain_dosa_chutney", name: "Plain dosa with chutney", cuisine: "indian", style: "batter", veg: ["onion"], pantry: ["idli_dosa_batter"], dairy: [], time: 20 },
    { id: "veg_sandwich", name: "Grilled vegetable sandwich", cuisine: "continental", style: "sandwich", veg: ["tomato", "cabbage", "capsicum_red"], pantry: ["bread"], dairy: ["butter", "cheese"], time: 20 },
    { id: "paneer_sandwich", name: "Paneer and tomato sandwich", cuisine: "continental", style: "sandwich", veg: ["tomato", "onion"], pantry: ["bread"], dairy: ["paneer", "butter"], time: 20 },
    { id: "spinach_corn_toast", name: "Spinach and corn toast", cuisine: "continental", style: "sandwich", veg: ["spinach", "corn"], pantry: ["bread"], dairy: ["butter", "cheese"], time: 20 },
    { id: "ganji_rice_porridge", name: "Rice ganji (rice porridge)", cuisine: "indian", style: "porridge", veg: [], pantry: ["rice"], dairy: ["milk"], time: 30, usesYogurt: false },
    { id: "ragi_smoothie", name: "Ragi and banana smoothie", cuisine: "indian", style: "smoothie", veg: [], pantry: ["banana", "protein_powder"], dairy: ["milk"], time: 10, usesYogurt: false },
    { id: "fruit_yogurt_smoothie", name: "Fruit and yogurt smoothie", cuisine: "continental", style: "smoothie", veg: [], pantry: ["banana"], dairy: ["yogurt"], time: 10, usesYogurt: true },
    { id: "poha", name: "Vegetable poha", cuisine: "indian", style: "tiffin", veg: ["onion", "peas", "carrot"], pantry: ["poha", "peanuts"], dairy: [], time: 25 },
    { id: "upma", name: "Vegetable upma", cuisine: "indian", style: "tiffin", veg: ["onion", "carrot", "peas"], pantry: ["suji"], dairy: [], time: 25 },
    { id: "vermicelli_upma", name: "Vegetable vermicelli upma", cuisine: "indian", style: "tiffin", veg: ["carrot", "peas", "onion"], pantry: ["suji"], dairy: ["ghee"], time: 20 },
    { id: "aloo_paratha", name: "Aloo paratha", cuisine: "indian", style: "paratha", veg: ["potato", "onion"], pantry: ["atta"], dairy: ["yogurt", "butter"], time: 35, usesYogurt: true },
    { id: "paneer_paratha", name: "Paneer stuffed paratha", cuisine: "indian", style: "paratha", veg: ["onion"], pantry: ["atta"], dairy: ["paneer", "yogurt"], time: 35, usesYogurt: true },
    { id: "besan_chilla", name: "Besan chilla", cuisine: "indian", style: "tiffin", veg: ["onion", "tomato", "spinach"], pantry: ["besan"], dairy: [], time: 20 },
    { id: "veg_dalia", name: "Vegetable dalia (broken wheat)", cuisine: "indian", style: "porridge", veg: ["carrot", "peas", "beetroot"], pantry: ["suji"], dairy: ["ghee"], time: 30 },
    { id: "oats_porridge", name: "Savoury vegetable oats", cuisine: "continental", style: "porridge", veg: ["carrot", "bell_pepper", "peas"], pantry: ["oats"], dairy: ["milk"], time: 15 },
    { id: "pancakes", name: "Whole wheat pancakes", cuisine: "continental", style: "sandwich", veg: [], pantry: ["atta"], dairy: ["milk", "butter"], time: 25 },
    { id: "veg_uttapam", name: "Vegetable uttapam", cuisine: "indian", style: "batter", veg: ["onion", "tomato", "capsicum_red"], pantry: ["idli_dosa_batter"], dairy: [], time: 25 },
    { id: "set_dosa_chutney", name: "Set dosa with chutney", cuisine: "indian", style: "batter", veg: ["onion"], pantry: ["idli_dosa_batter"], dairy: [], time: 20 },
    { id: "rava_idli", name: "Rava idli with chutney", cuisine: "indian", style: "tiffin", veg: ["carrot", "peas"], pantry: ["suji"], dairy: ["ghee"], time: 30 },
    { id: "muesli_bowl", name: "Yogurt and fruit muesli bowl", cuisine: "continental", style: "smoothie", veg: [], pantry: ["oats"], dairy: ["yogurt", "milk"], time: 10, usesYogurt: true },
    { id: "moong_dosa", name: "Moong dal dosa", cuisine: "indian", style: "batter", veg: ["onion", "ginger"], pantry: ["moong_dal"], dairy: [], time: 30 },
  ],
  lunch: [
    // Rice + gravy/sabzi days
    { id: "dal_rice_sabzi", name: "Dal, rice and seasonal sabzi", cuisine: "indian", style: "rice_gravy", veg: ["spinach", "potato"], pantry: ["toor_dal", "rice"], dairy: ["ghee"], time: 45 },
    { id: "chole_rice", name: "Chole with steamed rice", cuisine: "indian", style: "rice_gravy", veg: ["onion", "tomato", "ginger"], pantry: ["chickpeas", "rice"], dairy: [], time: 50 },
    { id: "rajma_rice", name: "Rajma with steamed rice", cuisine: "indian", style: "rice_gravy", veg: ["onion", "tomato", "ginger"], pantry: ["rajma", "rice"], dairy: [], time: 50 },
    { id: "paneer_curry_rice", name: "Paneer curry with rice", cuisine: "indian", style: "rice_gravy", veg: ["tomato", "onion", "bell_pepper"], pantry: ["rice"], dairy: ["paneer"], time: 40 },
    { id: "sambar_rice", name: "Sambar rice with vegetables", cuisine: "indian", style: "rice_gravy", veg: ["okra", "ridge_gourd", "tomato"], pantry: ["toor_dal", "rice"], dairy: [], time: 45 },
    { id: "kadhi_rice", name: "Kadhi with steamed rice", cuisine: "indian", style: "rice_gravy", veg: ["onion"], pantry: ["besan", "rice"], dairy: ["yogurt"], time: 40, usesYogurt: true },
    { id: "lobia_rice", name: "Black-eyed peas curry with rice", cuisine: "indian", style: "rice_gravy", veg: ["onion", "tomato"], pantry: ["rice", "chickpeas"], dairy: [], time: 45 },
    // Pulao / biryani days
    { id: "veg_pulao", name: "Mixed vegetable pulao", cuisine: "indian", style: "pulao_biryani", veg: ["carrot", "peas", "green_beans", "potato"], pantry: ["rice"], dairy: ["ghee"], time: 40 },
    { id: "paneer_biryani", name: "Paneer biryani", cuisine: "indian", style: "pulao_biryani", veg: ["onion", "tomato", "bell_pepper"], pantry: ["rice"], dairy: ["paneer", "yogurt"], time: 50, usesYogurt: true },
    { id: "veg_fried_rice", name: "Vegetable fried rice", cuisine: "continental", style: "pulao_biryani", veg: ["carrot", "capsicum_red", "cabbage", "corn"], pantry: ["rice"], dairy: [], time: 30 },
    { id: "lemon_rice", name: "Lemon rice with peanuts", cuisine: "indian", style: "pulao_biryani", veg: ["peas", "carrot"], pantry: ["rice", "peanuts"], dairy: [], time: 25 },
    // Roti + sabzi/dal days
    { id: "bhindi_roti", name: "Bhindi masala with roti", cuisine: "indian", style: "roti_sabzi", veg: ["okra", "onion", "tomato"], pantry: ["atta"], dairy: ["ghee"], time: 35 },
    { id: "lauki_dal_roti", name: "Lauki chana dal with roti", cuisine: "indian", style: "roti_sabzi", veg: ["bottle_gourd", "onion"], pantry: ["chana_dal", "atta"], dairy: [], time: 40 },
    { id: "cabbage_sabzi_roti", name: "Cabbage sabzi with roti", cuisine: "indian", style: "roti_sabzi", veg: ["cabbage", "carrot", "peas"], pantry: ["atta"], dairy: ["ghee"], time: 30 },
    { id: "gobi_masala_roti", name: "Cauliflower masala with roti", cuisine: "indian", style: "roti_sabzi", veg: ["cauliflower", "tomato", "onion"], pantry: ["atta"], dairy: ["ghee"], time: 35 },
    { id: "methi_thepla_curd", name: "Methi thepla with curd", cuisine: "indian", style: "roti_sabzi", veg: ["fenugreek_leaves"], pantry: ["atta"], dairy: ["yogurt"], time: 30, usesYogurt: true },
    { id: "mixveg_roti_lunch", name: "Mixed vegetable curry with roti", cuisine: "indian", style: "roti_sabzi", veg: ["carrot", "beetroot", "green_beans", "potato"], pantry: ["atta"], dairy: ["ghee"], time: 40 },
    { id: "pumpkin_sabzi_roti", name: "Pumpkin sabzi with roti", cuisine: "indian", style: "roti_sabzi", veg: ["pumpkin", "onion"], pantry: ["atta"], dairy: ["ghee"], time: 30 },
    // Continental days
    { id: "pasta_primavera", name: "Vegetable pasta primavera", cuisine: "continental", style: "continental_meal", veg: ["zucchini", "bell_pepper", "tomato", "broccoli"], pantry: ["pasta"], dairy: ["cheese", "butter"], time: 30 },
    { id: "minestrone_bread", name: "Minestrone soup with bread", cuisine: "continental", style: "continental_meal", veg: ["zucchini", "tomato", "cabbage", "carrot"], pantry: ["bread", "pasta"], dairy: ["cheese"], time: 35 },
    { id: "chana_salad_pita", name: "Chickpea salad in pita with soup", cuisine: "continental", style: "continental_meal", veg: ["tomato", "cabbage", "bell_pepper"], pantry: ["chickpeas", "bread"], dairy: ["yogurt"], time: 25, usesYogurt: true },
    { id: "stuffed_baked_potato", name: "Baked potato with vegetable filling", cuisine: "continental", style: "continental_meal", veg: ["potato", "broccoli", "corn"], pantry: [], dairy: ["cheese", "butter"], time: 45 },
    { id: "veg_burrito_bowl", name: "Vegetable and bean burrito bowl", cuisine: "continental", style: "continental_meal", veg: ["bell_pepper", "corn", "tomato"], pantry: ["rice", "rajma"], dairy: ["cheese"], time: 35 },
    { id: "caesar_salad_soup", name: "Garden salad with tomato soup", cuisine: "continental", style: "continental_meal", veg: ["cabbage", "carrot", "tomato", "bell_pepper"], pantry: ["bread"], dairy: ["cheese"], time: 25 },
  ],
  dinner: [
    // Quick batter-based — idli/dosa, the household staple, weighted in generator to hit 3-4x/week
    { id: "plain_dosa_chutney_dinner", name: "Plain dosa with chutney", cuisine: "indian", style: "batter_quick", veg: ["onion"], pantry: ["idli_dosa_batter"], dairy: [], time: 20 },
    { id: "idli_chutney_dinner", name: "Idli with chutney and sambar", cuisine: "indian", style: "batter_quick", veg: ["onion", "tomato"], pantry: ["idli_dosa_batter", "toor_dal"], dairy: [], time: 25 },
    { id: "masala_dosa_dinner", name: "Masala dosa", cuisine: "indian", style: "batter_quick", veg: ["potato", "onion"], pantry: ["idli_dosa_batter"], dairy: [], time: 25 },
    { id: "set_dosa_dinner", name: "Set dosa with chutney", cuisine: "indian", style: "batter_quick", veg: ["onion"], pantry: ["idli_dosa_batter"], dairy: [], time: 20 },
    { id: "rava_dosa_dinner", name: "Rava dosa with chutney", cuisine: "indian", style: "batter_quick", veg: ["onion"], pantry: ["idli_dosa_batter", "suji"], dairy: [], time: 25 },
    // Quick one-pot — khichdi etc
    { id: "veg_khichdi_dinner", name: "Vegetable khichdi", cuisine: "indian", style: "onepot_quick", veg: ["carrot", "peas", "spinach"], pantry: ["rice", "moong_dal"], dairy: ["ghee"], time: 35 },
    { id: "moong_dal_khichdi", name: "Moong dal khichdi", cuisine: "indian", style: "onepot_quick", veg: ["carrot", "peas"], pantry: ["rice", "moong_dal"], dairy: ["ghee"], time: 30 },
    { id: "veg_dalia_dinner", name: "Vegetable dalia (broken wheat)", cuisine: "indian", style: "onepot_quick", veg: ["carrot", "beetroot", "peas"], pantry: ["suji"], dairy: ["ghee"], time: 30 },
    // Roti/curry dinners
    { id: "palak_paneer_roti", name: "Palak paneer with roti", cuisine: "indian", style: "roti_curry", veg: ["spinach", "onion", "tomato"], pantry: ["atta"], dairy: ["paneer"], time: 45 },
    { id: "dal_makhani_rice", name: "Dal makhani with rice", cuisine: "indian", style: "roti_curry", veg: ["tomato", "onion", "ginger"], pantry: ["rajma", "rice"], dairy: ["butter", "ghee"], time: 50 },
    { id: "baingan_bharta_roti", name: "Baingan bharta with roti", cuisine: "indian", style: "roti_curry", veg: ["eggplant", "onion", "tomato"], pantry: ["atta"], dairy: ["ghee"], time: 40 },
    { id: "kadhai_veg_roti", name: "Kadhai vegetables with roti", cuisine: "indian", style: "roti_curry", veg: ["bell_pepper", "onion", "cauliflower"], pantry: ["atta"], dairy: [], time: 35 },
    { id: "paneer_bhurji_roti", name: "Paneer bhurji with roti", cuisine: "indian", style: "roti_curry", veg: ["onion", "tomato", "bell_pepper"], pantry: ["atta"], dairy: ["paneer"], time: 25 },
    { id: "methi_malai_roti", name: "Methi malai with roti", cuisine: "indian", style: "roti_curry", veg: ["fenugreek_leaves", "onion"], pantry: ["atta"], dairy: ["paneer", "butter"], time: 35 },
    { id: "paneer_tikka_gravy", name: "Paneer tikka in gravy with roti", cuisine: "indian", style: "roti_curry", veg: ["bell_pepper", "onion", "tomato"], pantry: ["atta"], dairy: ["paneer", "yogurt"], time: 40, usesYogurt: true },
    // Continental dinners (occasional, ~20%)
    { id: "veg_stirfry_noodles", name: "Vegetable stir-fry with noodles", cuisine: "continental", style: "continental_meal", veg: ["broccoli", "carrot", "cabbage", "capsicum_red"], pantry: ["pasta"], dairy: [], time: 30 },
    { id: "stuffed_capsicum", name: "Stuffed bell peppers", cuisine: "continental", style: "continental_meal", veg: ["bell_pepper", "corn", "tomato"], pantry: ["rice"], dairy: ["cheese"], time: 45 },
    { id: "shepherds_pie_veg", name: "Vegetable shepherd's pie", cuisine: "continental", style: "continental_meal", veg: ["carrot", "peas", "potato"], pantry: [], dairy: ["milk", "butter", "cheese"], time: 55 },
  ],
};

/* Quick easy-swap suggestion shown whenever a dish's primary dairy is
   yogurt — for the household member who doesn't eat yogurt. */
function yogurtAlternativeFor(dish) {
  if (!dish.usesYogurt) return null;
  if (dish.style === "smoothie") {
    return "Swap the yogurt for a scoop of protein powder blended with milk and banana, or use a plant-based milk smoothie instead.";
  }
  if (dish.style === "paratha" || dish.style === "roti_sabzi") {
    return "Skip the side of curd — serve with a quick protein shake or a glass of spiced buttermilk-free lassi alternative (milk + fruit) on the side instead.";
  }
  return "Leave the yogurt out of the dish and serve a protein shake or fruit smoothie alongside for the person who skips curd.";
}

/* Baby-adaptation note generator — derived from the actual dish each
   time, not hardcoded, so it never goes stale if dishes are swapped. */
function babyNoteFor(dish) {
  const vegNames = dish.veg.map((id) => vegById[id]?.name.toLowerCase()).filter(Boolean);
  const vegPhrase = vegNames.length
    ? `the ${vegNames.slice(0, 2).join(" and ")}`
    : "the main ingredients";
  if (dish.style === "batter" || dish.style === "batter_quick") {
    return `Steam a small idli soft and plain, or tear soft dosa into small pieces. Skip chutney's chilli and serve with a little ghee or mild dal instead.`;
  }
  if (dish.dairy.includes("paneer") || dish.pantry.includes("rajma") || dish.pantry.includes("chickpeas") || dish.pantry.includes("chana_dal")) {
    return `Mash a small portion well, skip whole spices and chilli, and soften ${vegPhrase} extra. Add a few drops of ghee.`;
  }
  if (dish.style === "smoothie" || dish.style === "porridge") {
    return `Offer a small unsweetened portion without any added sugar, thinned with a little extra milk to a spoonable consistency.`;
  }
  if (dish.cuisine === "continental" && dish.pantry.includes("pasta")) {
    return `Chop pasta into small pieces, skip any chilli flakes, and mash ${vegPhrase} soft. Keep cheese light.`;
  }
  if (dish.id.includes("roti") || dish.pantry.includes("atta")) {
    return `Tear roti into small soft pieces, mix with a spoon of the curry without whole spices, and mash ${vegPhrase}.`;
  }
  return `Blend or mash a small portion, leave out chilli and whole spices, and soften ${vegPhrase} until easy to mash with a spoon.`;
}

const DAY_NAMES = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Safe localStorage wrapper — falls back to in-memory only if storage
// is unavailable (e.g. private browsing, or this code running inside
// certain sandboxed previews). Never throws.
const memoryStore = {};
function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return key in memoryStore ? memoryStore[key] : fallback;
  }
}
function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    memoryStore[key] = value;
  }
}

/* ---------------------------------------------------------------------
   GENERATOR
   Two layers:
   1) A weekly day-pattern plan that mirrors the household's real
      rhythm: lunches alternate rice-gravy / pulao-biryani / roti-sabzi /
      continental; dinners lean on quick batter (idli/dosa) and one-pot
      meals, hitting the batter staple 3-4x/week, with roti-curry and
      occasional continental filling the rest.
   2) Vegetable rotation scoring on top of the pattern, same as before,
      so within whichever style is picked, vegetables still get used up
      before new ones are introduced.
--------------------------------------------------------------------- */

function pickHeroVegetables(count = 7) {
  const shuffled = [...VEGETABLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((v) => v.id);
}

function scoreDish(dish, heroSet, usedCount) {
  let score = 0;
  dish.veg.forEach((v) => {
    if (heroSet.has(v)) score += 3;
    score -= (usedCount[v] || 0) * 0.4;
  });
  return score + Math.random() * 1.5;
}

function pickFromPool(pool, heroSet, usedCount) {
  let best = null;
  let bestScore = -Infinity;
  pool.forEach((d) => {
    const s = scoreDish(d, heroSet, usedCount);
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  });
  return best;
}

// Build a 7-day lunch style sequence: ~2 rice-gravy, ~2 roti-sabzi,
// ~1-2 pulao/biryani, ~1 continental — shuffled across the week.
function buildLunchStylePattern() {
  const pattern = ["rice_gravy", "rice_gravy", "roti_sabzi", "roti_sabzi", "pulao_biryani", "continental_meal"];
  while (pattern.length < 7) pattern.push(Math.random() < 0.5 ? "roti_sabzi" : "rice_gravy");
  return pattern.sort(() => Math.random() - 0.5).slice(0, 7);
}

// Build a 7-day dinner style sequence: 3-4 batter_quick (the household
// staple), 1-2 onepot_quick, rest roti_curry / occasional continental.
function buildDinnerStylePattern() {
  const batterCount = 3 + (Math.random() < 0.5 ? 0 : 1); // 3 or 4
  const onepotCount = Math.random() < 0.6 ? 2 : 1;
  const continentalCount = Math.random() < 0.4 ? 1 : 0;
  const pattern = [];
  for (let i = 0; i < batterCount; i++) pattern.push("batter_quick");
  for (let i = 0; i < onepotCount; i++) pattern.push("onepot_quick");
  for (let i = 0; i < continentalCount; i++) pattern.push("continental_meal");
  while (pattern.length < 7) pattern.push("roti_curry");
  return pattern.sort(() => Math.random() - 0.5).slice(0, 7);
}

function buildDayMealsForStyles(slot, styleForDay, heroSet, usedCount, recentIds) {
  const stylePool = DISHES[slot].filter((d) => d.style === styleForDay && !recentIds.has(d.id));
  const fallbackStylePool = DISHES[slot].filter((d) => d.style === styleForDay);
  const pool = stylePool.length ? stylePool : fallbackStylePool.length ? fallbackStylePool : DISHES[slot];
  return pickFromPool(pool, heroSet, usedCount);
}

function pickBreakfast(heroSet, usedCount, recentIds) {
  // Breakfast follows the described mix: idli ~1x, sandwiches ~2x,
  // ganji/smoothie ~1x, upma/tiffin style filling the rest.
  const weighted = [];
  DISHES.breakfast.forEach((d) => {
    let weight = 1;
    if (d.style === "batter") weight = 1.4;
    if (d.style === "sandwich") weight = 1.8;
    if (d.style === "smoothie" || d.style === "porridge") weight = 1.2;
    if (d.style === "tiffin" || d.style === "paratha") weight = 1.3;
    for (let i = 0; i < Math.round(weight * 10); i++) weighted.push(d);
  });
  const fresh = weighted.filter((d) => !recentIds.has(d.id));
  const pool = fresh.length ? fresh : weighted;
  return pickFromPool(pool, heroSet, usedCount);
}

function generateMealPlan() {
  const heroVegIds = pickHeroVegetables(7);
  const heroSet = new Set(heroVegIds);
  const usedCount = {};
  const recentByDish = { breakfast: new Set(), lunch: new Set(), dinner: new Set() };

  const lunchStyles = buildLunchStylePattern();
  const dinnerStyles = buildDinnerStylePattern();

  const days = DAY_NAMES.map((dayName, idx) => {
    const meals = {};

    const breakfastDish = pickBreakfast(heroSet, usedCount, recentByDish.breakfast);
    const lunchDish = buildDayMealsForStyles("lunch", lunchStyles[idx], heroSet, usedCount, recentByDish.lunch);
    const dinnerDish = buildDayMealsForStyles("dinner", dinnerStyles[idx], heroSet, usedCount, recentByDish.dinner);

    [
      ["breakfast", breakfastDish],
      ["lunch", lunchDish],
      ["dinner", dinnerDish],
    ].forEach(([slot, dish]) => {
      dish.veg.forEach((v) => (usedCount[v] = (usedCount[v] || 0) + 1));
      recentByDish[slot].add(dish.id);
      if (recentByDish[slot].size > 3) {
        const first = recentByDish[slot].values().next().value;
        recentByDish[slot].delete(first);
      }
      meals[slot] = {
        ...dish,
        babyNote: babyNoteFor(dish),
        yogurtAlt: yogurtAlternativeFor(dish),
      };
    });

    return {
      id: `day-${idx}`,
      day: dayName,
      meals,
      expanded: idx === 0,
    };
  });

  return { id: Date.now(), heroVegIds, days };
}

function regenerateSingleDay(plan, dayId) {
  const heroSet = new Set(plan.heroVegIds);
  const usedCount = {};
  plan.days.forEach((d) => {
    if (d.id === dayId) return;
    ["breakfast", "lunch", "dinner"].forEach((slot) => {
      d.meals[slot].veg.forEach((v) => (usedCount[v] = (usedCount[v] || 0) + 1));
    });
  });

  const targetDay = plan.days.find((d) => d.id === dayId);

  const newDays = plan.days.map((d) => {
    if (d.id !== dayId) return d;
    const meals = {};

    const breakfastAvoid = new Set([d.meals.breakfast.id]);
    const breakfastDish = pickBreakfast(heroSet, usedCount, breakfastAvoid);

    const lunchStyle = d.meals.lunch.style;
    const lunchAvoid = new Set([d.meals.lunch.id]);
    const lunchDish = buildDayMealsForStyles("lunch", lunchStyle, heroSet, usedCount, lunchAvoid);

    const dinnerStyle = d.meals.dinner.style;
    const dinnerAvoid = new Set([d.meals.dinner.id]);
    const dinnerDish = buildDayMealsForStyles("dinner", dinnerStyle, heroSet, usedCount, dinnerAvoid);

    [
      ["breakfast", breakfastDish],
      ["lunch", lunchDish],
      ["dinner", dinnerDish],
    ].forEach(([slot, dish]) => {
      meals[slot] = { ...dish, babyNote: babyNoteFor(dish), yogurtAlt: yogurtAlternativeFor(dish) };
    });

    return { ...d, meals };
  });

  return { ...plan, days: newDays };
}

/* ---------------------------------------------------------------------
   GROCERY LIST BUILDER
   Plain checklist of ingredients used across the week's plan — no
   counts or quantities shown, since exact amounts vary by household
   and pantry stock more than a generic number could capture.
--------------------------------------------------------------------- */

function buildGroceryList(plan) {
  if (!plan) return { vegetables: [], dairy: [], pantry: [] };

  const vegSet = new Set();
  const dairySet = new Set();
  const pantrySet = new Set();

  plan.days.forEach((day) => {
    ["breakfast", "lunch", "dinner"].forEach((slot) => {
      const dish = day.meals[slot];
      dish.veg.forEach((id) => vegSet.add(id));
      dish.dairy.forEach((id) => dairySet.add(id));
      dish.pantry.forEach((id) => pantrySet.add(id));
    });
  });

  const toItems = (set, lookup) =>
    Array.from(set)
      .map((id) => ({ id, name: lookup[id]?.name || id }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return {
    vegetables: toItems(vegSet, vegById),
    dairy: toItems(dairySet, Object.fromEntries(DAIRY.map((d) => [d.id, d]))),
    pantry: toItems(pantrySet, Object.fromEntries(PANTRY_STAPLES.map((p) => [p.id, p]))),
  };
}

/* ---------------------------------------------------------------------
   UI COMPONENTS
--------------------------------------------------------------------- */

const COLORS = {
  bg: "#FAFAF7",
  primary: "#1D4D2F",
  amber: "#D97706",
  border: "#1D4D2F22",
  text: "#1F2A24",
  textMuted: "#5B6B62",
  cardBg: "#FFFFFF",
};

function Tag({ children, tone = "amber" }) {
  const bg = tone === "amber" ? "#FBF1E6" : "#EEF3EF";
  const color = tone === "amber" ? COLORS.amber : COLORS.primary;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 8,
        background: bg,
        color,
        fontWeight: 600,
        marginRight: 6,
        marginBottom: 4,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function MealRow({ slot, dish }) {
  const slotLabel = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" }[slot];
  return (
    <div
      style={{
        padding: "12px 0",
        borderTop: `0.5px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {slotLabel}
        </span>
        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{dish.time} min</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{dish.name}</div>
      <div style={{ marginTop: 6 }}>
        <Tag tone={dish.cuisine === "indian" ? "amber" : "green"}>
          {dish.cuisine === "indian" ? "Indian" : "Continental"}
        </Tag>
        {dish.style === "batter_quick" && <Tag tone="green">Idli/dosa batter</Tag>}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12.5,
          color: COLORS.textMuted,
          background: "#F4F6F4",
          borderRadius: 8,
          padding: "8px 10px",
          lineHeight: 1.4,
        }}
      >
        <strong style={{ color: COLORS.primary }}>Baby: </strong>
        {dish.babyNote}
      </div>
      {dish.yogurtAlt && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12.5,
            color: COLORS.textMuted,
            background: "#FBF1E6",
            borderRadius: 8,
            padding: "8px 10px",
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: COLORS.amber }}>No-yogurt swap: </strong>
          {dish.yogurtAlt}
        </div>
      )}
    </div>
  );
}

function DayCard({ day, isToday, onToggle, onRegenerate, regenerating }) {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        border: `0.5px solid ${COLORS.border}`,
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{day.day}</span>
          {isToday && <Tag>Today</Tag>}
        </div>
        <span style={{ fontSize: 18, color: COLORS.textMuted, transform: day.expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          ⌄
        </span>
      </button>
      {day.expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <MealRow slot="breakfast" dish={day.meals.breakfast} />
          <MealRow slot="lunch" dish={day.meals.lunch} />
          <MealRow slot="dinner" dish={day.meals.dinner} />
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "10px 0",
              borderRadius: 10,
              border: `0.5px solid ${COLORS.primary}`,
              background: "transparent",
              color: COLORS.primary,
              fontWeight: 600,
              fontSize: 13,
              cursor: regenerating ? "default" : "pointer",
              opacity: regenerating ? 0.5 : 1,
            }}
          >
            {regenerating ? "Regenerating…" : "Regenerate this day"}
          </button>
        </div>
      )}
    </div>
  );
}

function GroceryGroup({ title, items, checked, onToggle, subtitle = null }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amber, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
          {subtitle}
        </div>
      )}
      {!subtitle && <div style={{ marginBottom: 8 }} />}
      <div style={{ background: COLORS.cardBg, border: `0.5px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
        {items.map((item, i) => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                borderTop: i === 0 ? "none" : `0.5px solid ${COLORS.border}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: `1.5px solid ${isChecked ? COLORS.primary : COLORS.textMuted}`,
                  background: isChecked ? COLORS.primary : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isChecked && <span style={{ color: "white", fontSize: 11, lineHeight: 1 }}>✓</span>}
              </span>
              <span
                style={{
                  fontSize: 14,
                  marginLeft: 10,
                  color: isChecked ? COLORS.textMuted : COLORS.text,
                  textDecoration: isChecked ? "line-through" : "none",
                }}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------------- */

export default function MealPlannerApp() {
  const [plan, setPlan] = useState(null);
  const [tab, setTab] = useState("week");
  const [checkedItems, setCheckedItems] = useState({});
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [toast, setToast] = useState(null);
  const [householdSize, setHouseholdSize] = useState(() => safeGet("householdSize", DEFAULT_HOUSEHOLD_SIZE));

  useEffect(() => {
    setPlan(generateMealPlan());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    safeSet("householdSize", householdSize);
  }, [householdSize]);

  function changeHouseholdSize(delta) {
    setHouseholdSize((n) => Math.min(10, Math.max(1, n + delta)));
  }

  const groceries = plan ? buildGroceryList(plan) : { vegetables: [], dairy: [], pantry: [] };

  function toggleDay(dayId) {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d) => (d.id === dayId ? { ...d, expanded: !d.expanded } : d)),
    }));
  }

  function handleRegenerateDay(dayId) {
    setRegeneratingDay(dayId);
    setTimeout(() => {
      setPlan((p) => regenerateSingleDay(p, dayId));
      setRegeneratingDay(null);
      setToast("Day regenerated");
    }, 350);
  }

  function handleRegenerateWeek() {
    setToast("New week generated");
    setPlan(generateMealPlan());
    setCheckedItems({});
  }

  function toggleGroceryItem(id) {
    setCheckedItems((c) => ({ ...c, [id]: !c[id] }));
  }

  const totalGroceryItems = groceries.vegetables.length + groceries.dairy.length + groceries.pantry.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div
      style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: COLORS.bg,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "20px 16px 14px", background: COLORS.bg, position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary, letterSpacing: -0.3 }}>
                {tab === "week" && "This week"}
                {tab === "grocery" && "Grocery list"}
                {tab === "settings" && "Settings"}
              </div>
              {tab === "week" && (
                <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 }}>Saturday to Friday · 21 meals + baby</div>
              )}
              {tab === "grocery" && (
                <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 }}>
                  {checkedCount} of {totalGroceryItems} checked off
                </div>
              )}
            </div>
            {tab === "week" && (
              <button
                onClick={handleRegenerateWeek}
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "white",
                  background: COLORS.primary,
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 12px",
                  cursor: "pointer",
                }}
              >
                Regenerate plan
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "4px 16px 90px", overflowY: "auto" }}>
          {!plan && <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40 }}>Building this week's plan…</div>}

          {plan && tab === "week" && (
            <>
              {plan.days.map((day, idx) => (
                <DayCard
                  key={day.id}
                  day={day}
                  isToday={idx === 0}
                  onToggle={() => toggleDay(day.id)}
                  onRegenerate={() => handleRegenerateDay(day.id)}
                  regenerating={regeneratingDay === day.id}
                />
              ))}
              <div style={{ fontSize: 11.5, color: COLORS.textMuted, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                No eggs or mushroom anywhere in this plan. Every dish stays under an hour to cook.
              </div>
            </>
          )}

          {plan && tab === "grocery" && (
            <>
              <GroceryGroup title="Vegetables" items={groceries.vegetables} checked={checkedItems} onToggle={toggleGroceryItem} />
              <GroceryGroup title="Dairy" items={groceries.dairy} checked={checkedItems} onToggle={toggleGroceryItem} />
              <GroceryGroup title="Pantry & grains" items={groceries.pantry} checked={checkedItems} onToggle={toggleGroceryItem} />
            </>
          )}

          {tab === "settings" && (
            <div>
              <div style={{ background: COLORS.cardBg, border: `0.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 10, fontSize: 14 }}>Household size</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, maxWidth: 200 }}>
                    Adults eating from this plan.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => changeHouseholdSize(-1)}
                      aria-label="Decrease household size"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${COLORS.border}`,
                        background: "transparent", color: COLORS.primary, fontSize: 18, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, minWidth: 20, textAlign: "center" }}>
                      {householdSize}
                    </span>
                    <button
                      onClick={() => changeHouseholdSize(1)}
                      aria-label="Increase household size"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${COLORS.border}`,
                        background: "transparent", color: COLORS.primary, fontSize: 18, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                  Plus 1 baby (11 months) — soft, lightly salted meals · one adult skips yogurt
                </div>
              </div>
              <div style={{ background: COLORS.cardBg, border: `0.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 6, fontSize: 14 }}>Meal mix</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  Roughly 80% Indian vegetarian, 20% continental · idli/dosa batter featured 3-4 dinners a week · no eggs, no
                  mushroom · cook time under 60 minutes
                </div>
              </div>
              <div style={{ background: COLORS.cardBg, border: `0.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 6, fontSize: 14 }}>About this week's plan</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  Open this app on Friday mornings to review and regenerate the week ahead. Evening cooking covers that night's
                  dinner plus the next day's breakfast and lunch.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              background: COLORS.primary,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: 10,
              zIndex: 20,
            }}
          >
            {toast}
          </div>
        )}

        {/* Bottom tab nav */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: COLORS.cardBg,
            borderTop: `0.5px solid ${COLORS.border}`,
            display: "flex",
            padding: "10px 16px 16px",
            gap: 4,
          }}
        >
          {[
            { id: "week", label: "This week" },
            { id: "grocery", label: "Grocery list" },
            { id: "settings", label: "Settings" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px 0",
                fontSize: 12.5,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? COLORS.primary : COLORS.textMuted,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
