import React, { useState, useEffect } from "react";

/* ---------------------------------------------------------------------
   DATA LAYER — vegetable pool + dish pool with tags.
   This is intentionally large and structured so the generator can do
   real rotation logic instead of picking from one fixed pre-made list.
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
   Each dish: id, name, slot (breakfast/lunch/dinner), cuisine (indian/
   continental), vegIds used, timeMins, pantryIds, dairyIds, babyNote.
   No eggs, no mushroom anywhere in this pool.
--------------------------------------------------------------------- */

const DISHES = {
  breakfast: [
    { id: "poha", name: "Vegetable poha", cuisine: "indian", veg: ["onion", "peas", "carrot"], pantry: ["poha", "peanuts"], dairy: [], time: 25 },
    { id: "upma", name: "Vegetable upma", cuisine: "indian", veg: ["onion", "carrot", "peas"], pantry: ["suji"], dairy: [], time: 25 },
    { id: "idli_sambar", name: "Idli with sambar", cuisine: "indian", veg: ["onion", "tomato", "okra"], pantry: ["toor_dal", "rice"], dairy: [], time: 40 },
    { id: "paneer_paratha", name: "Paneer stuffed paratha", cuisine: "indian", veg: ["onion"], pantry: ["atta"], dairy: ["paneer", "yogurt"], time: 35 },
    { id: "aloo_paratha", name: "Aloo paratha", cuisine: "indian", veg: ["potato", "onion"], pantry: ["atta"], dairy: ["yogurt", "butter"], time: 35 },
    { id: "besan_chilla", name: "Besan chilla", cuisine: "indian", veg: ["onion", "tomato", "spinach"], pantry: ["besan"], dairy: [], time: 20 },
    { id: "veg_dalia", name: "Vegetable dalia (broken wheat)", cuisine: "indian", veg: ["carrot", "peas", "beetroot"], pantry: ["suji"], dairy: ["ghee"], time: 30 },
    { id: "oats_porridge", name: "Savoury vegetable oats", cuisine: "continental", veg: ["carrot", "bell_pepper", "peas"], pantry: ["oats"], dairy: ["milk"], time: 15 },
    { id: "veg_sandwich", name: "Grilled vegetable sandwich", cuisine: "continental", veg: ["tomato", "cabbage", "capsicum_red"], pantry: ["bread"], dairy: ["butter", "cheese"], time: 20 },
    { id: "pancakes", name: "Whole wheat pancakes", cuisine: "continental", veg: [], pantry: ["atta"], dairy: ["milk", "butter"], time: 25 },
    { id: "veg_uttapam", name: "Vegetable uttapam", cuisine: "indian", veg: ["onion", "tomato", "capsicum_red"], pantry: ["rice", "chana_dal"], dairy: [], time: 35 },
    { id: "muesli_bowl", name: "Yogurt and fruit muesli bowl", cuisine: "continental", veg: [], pantry: ["oats"], dairy: ["yogurt", "milk"], time: 10 },
    { id: "spinach_corn_toast", name: "Spinach and corn toast", cuisine: "continental", veg: ["spinach", "corn"], pantry: ["bread"], dairy: ["butter", "cheese"], time: 20 },
    { id: "moong_dosa", name: "Moong dal dosa", cuisine: "indian", veg: ["onion", "ginger"], pantry: ["moong_dal", "rice"], dairy: [], time: 30 },
    { id: "vermicelli_upma", name: "Vegetable vermicelli upma", cuisine: "indian", veg: ["carrot", "peas", "onion"], pantry: ["suji"], dairy: ["ghee"], time: 20 },
  ],
  lunch: [
    { id: "dal_rice_sabzi", name: "Dal, rice and seasonal sabzi", cuisine: "indian", veg: ["spinach", "potato"], pantry: ["toor_dal", "rice"], dairy: ["ghee"], time: 45 },
    { id: "chole_rice", name: "Chole with steamed rice", cuisine: "indian", veg: ["onion", "tomato", "ginger"], pantry: ["chickpeas", "rice"], dairy: [], time: 50 },
    { id: "rajma_rice", name: "Rajma with steamed rice", cuisine: "indian", veg: ["onion", "tomato", "ginger"], pantry: ["rajma", "rice"], dairy: [], time: 50 },
    { id: "bhindi_roti", name: "Bhindi masala with roti", cuisine: "indian", veg: ["okra", "onion", "tomato"], pantry: ["atta"], dairy: ["ghee"], time: 35 },
    { id: "lauki_dal_roti", name: "Lauki chana dal with roti", cuisine: "indian", veg: ["bottle_gourd", "onion"], pantry: ["chana_dal", "atta"], dairy: [], time: 40 },
    { id: "cabbage_sabzi_roti", name: "Cabbage sabzi with roti", cuisine: "indian", veg: ["cabbage", "carrot", "peas"], pantry: ["atta"], dairy: ["ghee"], time: 30 },
    { id: "paneer_curry_rice", name: "Paneer curry with rice", cuisine: "indian", veg: ["tomato", "onion", "bell_pepper"], pantry: ["rice"], dairy: ["paneer"], time: 40 },
    { id: "veg_pulao", name: "Mixed vegetable pulao", cuisine: "indian", veg: ["carrot", "peas", "green_beans", "potato"], pantry: ["rice"], dairy: ["ghee"], time: 40 },
    { id: "sambar_rice", name: "Sambar rice with vegetables", cuisine: "indian", veg: ["okra", "ridge_gourd", "tomato"], pantry: ["toor_dal", "rice"], dairy: [], time: 45 },
    { id: "kadhi_rice", name: "Kadhi with steamed rice", cuisine: "indian", veg: ["onion"], pantry: ["besan", "rice"], dairy: ["yogurt"], time: 40 },
    { id: "veg_khichdi", name: "Vegetable khichdi", cuisine: "indian", veg: ["carrot", "peas", "spinach"], pantry: ["rice", "moong_dal"], dairy: ["ghee"], time: 35 },
    { id: "methi_thepla_curd", name: "Methi thepla with curd", cuisine: "indian", veg: ["fenugreek_leaves"], pantry: ["atta"], dairy: ["yogurt"], time: 30 },
    { id: "pasta_primavera", name: "Vegetable pasta primavera", cuisine: "continental", veg: ["zucchini", "bell_pepper", "tomato", "broccoli"], pantry: ["pasta"], dairy: ["cheese", "butter"], time: 30 },
    { id: "veg_burrito_bowl", name: "Vegetable and bean burrito bowl", cuisine: "continental", veg: ["bell_pepper", "corn", "tomato"], pantry: ["rice", "rajma"], dairy: ["cheese"], time: 35 },
    { id: "stuffed_baked_potato", name: "Baked potato with vegetable filling", cuisine: "continental", veg: ["potato", "broccoli", "corn"], pantry: [], dairy: ["cheese", "butter"], time: 45 },
    { id: "veg_fried_rice", name: "Vegetable fried rice", cuisine: "continental", veg: ["carrot", "capsicum_red", "cabbage", "corn"], pantry: ["rice"], dairy: [], time: 30 },
    { id: "minestrone_bread", name: "Minestrone soup with bread", cuisine: "continental", veg: ["zucchini", "tomato", "cabbage", "carrot"], pantry: ["bread", "pasta"], dairy: ["cheese"], time: 35 },
    { id: "chana_salad_pita", name: "Chickpea salad in pita", cuisine: "continental", veg: ["tomato", "cabbage", "bell_pepper"], pantry: ["chickpeas", "bread"], dairy: ["yogurt"], time: 20 },
  ],
  dinner: [
    { id: "palak_paneer_roti", name: "Palak paneer with roti", cuisine: "indian", veg: ["spinach", "onion", "tomato"], pantry: ["atta"], dairy: ["paneer"], time: 45 },
    { id: "mixveg_roti", name: "Mixed vegetable curry with roti", cuisine: "indian", veg: ["carrot", "beetroot", "green_beans", "potato"], pantry: ["atta"], dairy: ["ghee"], time: 40 },
    { id: "dal_makhani_rice", name: "Dal makhani with rice", cuisine: "indian", veg: ["tomato", "onion", "ginger"], pantry: ["rajma", "rice"], dairy: ["butter", "ghee"], time: 50 },
    { id: "baingan_bharta_roti", name: "Baingan bharta with roti", cuisine: "indian", veg: ["eggplant", "onion", "tomato"], pantry: ["atta"], dairy: ["ghee"], time: 40 },
    { id: "kadhai_veg_roti", name: "Kadhai vegetables with roti", cuisine: "indian", veg: ["bell_pepper", "onion", "cauliflower"], pantry: ["atta"], dairy: [], time: 35 },
    { id: "gobi_masala_roti", name: "Cauliflower masala with roti", cuisine: "indian", veg: ["cauliflower", "tomato", "onion"], pantry: ["atta"], dairy: ["ghee"], time: 35 },
    { id: "pumpkin_sabzi_roti", name: "Pumpkin sabzi with roti", cuisine: "indian", veg: ["pumpkin", "onion"], pantry: ["atta"], dairy: ["ghee"], time: 30 },
    { id: "paneer_bhurji_roti", name: "Paneer bhurji with roti", cuisine: "indian", veg: ["onion", "tomato", "bell_pepper"], pantry: ["atta"], dairy: ["paneer"], time: 25 },
    { id: "veg_kofta_rice", name: "Vegetable kofta curry with rice", cuisine: "indian", veg: ["carrot", "cabbage", "potato"], pantry: ["rice", "besan"], dairy: [], time: 55 },
    { id: "lobia_rice", name: "Black-eyed peas curry with rice", cuisine: "indian", veg: ["onion", "tomato"], pantry: ["rice", "chickpeas"], dairy: [], time: 45 },
    { id: "methi_malai_roti", name: "Methi malai with roti", cuisine: "indian", veg: ["fenugreek_leaves", "onion"], pantry: ["atta"], dairy: ["paneer", "butter"], time: 35 },
    { id: "veg_lasagna", name: "Vegetable lasagna", cuisine: "continental", veg: ["zucchini", "spinach", "tomato"], pantry: ["pasta"], dairy: ["cheese", "butter"], time: 60 },
    { id: "stuffed_capsicum", name: "Stuffed bell peppers", cuisine: "continental", veg: ["bell_pepper", "corn", "tomato"], pantry: ["rice"], dairy: ["cheese"], time: 45 },
    { id: "veg_stirfry_noodles", name: "Vegetable stir-fry with noodles", cuisine: "continental", veg: ["broccoli", "carrot", "cabbage", "capsicum_red"], pantry: ["pasta"], dairy: [], time: 30 },
    { id: "shepherds_pie_veg", name: "Vegetable shepherd's pie", cuisine: "continental", veg: ["carrot", "peas", "potato"], pantry: [], dairy: ["milk", "butter", "cheese"], time: 55 },
    { id: "paneer_tikka_gravy", name: "Paneer tikka in gravy with roti", cuisine: "indian", veg: ["bell_pepper", "onion", "tomato"], pantry: ["atta"], dairy: ["paneer", "yogurt"], time: 40 },
  ],
};

/* Baby-adaptation note generator — derived from the actual dish each
   time, not hardcoded, so it never goes stale if dishes are swapped. */
function babyNoteFor(dish) {
  const vegNames = dish.veg.map((id) => vegById[id]?.name.toLowerCase()).filter(Boolean);
  const vegPhrase = vegNames.length
    ? `the ${vegNames.slice(0, 2).join(" and ")}`
    : "the main ingredients";
  if (dish.dairy.includes("paneer") || dish.pantry.includes("rajma") || dish.pantry.includes("chickpeas") || dish.pantry.includes("chana_dal")) {
    return `Mash a small portion well, skip whole spices and chilli, and soften ${vegPhrase} extra. Add a few drops of ghee.`;
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

/* ---------------------------------------------------------------------
   GENERATOR — real rotation logic.
   Each week, pick a small set of "hero" vegetables to feature heavily
   (so they get used up), then greedily prefer dishes containing them
   before reaching for dishes that introduce fresh vegetables.
--------------------------------------------------------------------- */

function pickHeroVegetables(rng, count = 7) {
  const shuffled = [...VEGETABLES].sort(() => rng() - 0.5);
  return shuffled.slice(0, count).map((v) => v.id);
}

function scoreDish(dish, heroSet, usedCount) {
  let score = 0;
  dish.veg.forEach((v) => {
    if (heroSet.has(v)) score += 3;
    score -= (usedCount[v] || 0) * 0.4; // diminishing returns to avoid identical repeats
  });
  return score + Math.random() * 1.5; // jitter so it's not deterministic
}

function pickDish(slot, heroSet, usedCount, recentIds, cuisineBias) {
  const pool = DISHES[slot].filter((d) => !recentIds.has(d.id));
  const candidates = pool.length ? pool : DISHES[slot];
  const wantIndian = Math.random() < cuisineBias;
  const filtered = candidates.filter((d) => (wantIndian ? d.cuisine === "indian" : d.cuisine === "continental"));
  const finalPool = filtered.length ? filtered : candidates;

  let best = null;
  let bestScore = -Infinity;
  finalPool.forEach((d) => {
    const s = scoreDish(d, heroSet, usedCount);
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  });
  return best;
}

function generateMealPlan(previousPlan) {
  const heroVegIds = pickHeroVegetables(Math.random, 7);
  const heroSet = new Set(heroVegIds);
  const usedCount = {};
  const recentByDish = { breakfast: new Set(), lunch: new Set(), dinner: new Set() };

  const days = DAY_NAMES.map((dayName, idx) => {
    const meals = {};
    ["breakfast", "lunch", "dinner"].forEach((slot) => {
      const dish = pickDish(slot, heroSet, usedCount, recentByDish[slot], 0.8);
      dish.veg.forEach((v) => (usedCount[v] = (usedCount[v] || 0) + 1));
      recentByDish[slot].add(dish.id);
      // allow repeats after 3 days so variety stays high across the week
      if (recentByDish[slot].size > 3) {
        const first = recentByDish[slot].values().next().value;
        recentByDish[slot].delete(first);
      }
      meals[slot] = {
        ...dish,
        babyNote: babyNoteFor(dish),
      };
    });
    return {
      id: `day-${idx}`,
      day: dayName,
      date: null,
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
  const newDays = plan.days.map((d) => {
    if (d.id !== dayId) return d;
    const meals = {};
    ["breakfast", "lunch", "dinner"].forEach((slot) => {
      const avoid = new Set([d.meals[slot].id]);
      const dish = pickDish(slot, heroSet, usedCount, avoid, 0.8);
      meals[slot] = { ...dish, babyNote: babyNoteFor(dish) };
    });
    return { ...d, meals };
  });
  return { ...plan, days: newDays };
}

/* ---------------------------------------------------------------------
   GROCERY LIST BUILDER
--------------------------------------------------------------------- */

function buildGroceryList(plan) {
  if (!plan) return { vegetables: [], dairy: [], pantry: [] };
  const vegMap = {};
  const dairyMap = {};
  const pantryMap = {};

  plan.days.forEach((day) => {
    ["breakfast", "lunch", "dinner"].forEach((slot) => {
      const dish = day.meals[slot];
      dish.veg.forEach((id) => {
        vegMap[id] = (vegMap[id] || 0) + 1;
      });
      dish.dairy.forEach((id) => {
        dairyMap[id] = (dairyMap[id] || 0) + 1;
      });
      dish.pantry.forEach((id) => {
        pantryMap[id] = (pantryMap[id] || 0) + 1;
      });
    });
  });

  const toItems = (map, lookup) =>
    Object.entries(map)
      .map(([id, count]) => ({ id, name: lookup[id]?.name || id, count }))
      .sort((a, b) => b.count - a.count);

  return {
    vegetables: toItems(vegMap, vegById),
    dairy: toItems(dairyMap, Object.fromEntries(DAIRY.map((d) => [d.id, d]))),
    pantry: toItems(pantryMap, Object.fromEntries(PANTRY_STAPLES.map((p) => [p.id, p]))),
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

function GroceryGroup({ title, items, checked, onToggle }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amber, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
        {title}
      </div>
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
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                borderTop: i === 0 ? "none" : `0.5px solid ${COLORS.border}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                    color: isChecked ? COLORS.textMuted : COLORS.text,
                    textDecoration: isChecked ? "line-through" : "none",
                  }}
                >
                  {item.name}
                </span>
              </div>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>×{item.count}</span>
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

  useEffect(() => {
    setPlan(generateMealPlan(null));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

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
    setPlan(generateMealPlan(plan));
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
                <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 6, fontSize: 14 }}>Household</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  3 adults, vegetarian · 1 baby (11 months), soft and lightly salted meals
                </div>
              </div>
              <div style={{ background: COLORS.cardBg, border: `0.5px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 6, fontSize: 14 }}>Meal mix</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  Roughly 80% Indian vegetarian, 20% continental · no eggs, no mushroom · cook time under 60 minutes
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
