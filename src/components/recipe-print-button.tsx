"use client";

import { Printer } from "lucide-react";

export default function RecipePrintButton() {
  return (
    <button className="recipe-print-button" type="button" onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" />
      <span>Print Recipe</span>
    </button>
  );
}
