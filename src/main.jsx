import React from "react";
import { createRoot } from "react-dom/client";
import MealPlannerApp from "./MealPlanner.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MealPlannerApp />
  </React.StrictMode>
);
