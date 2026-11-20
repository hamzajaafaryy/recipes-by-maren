import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import RecipeEditor from "./editor";

export const metadata = { title: "Edit Recipe | Content Studio" };

export default async function EditRecipePage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <RecipeEditor />;
}
