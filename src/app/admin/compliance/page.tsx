import { redirect } from "next/navigation";

export const metadata = {
  title: "Compliance",
};

export default function AdminCompliancePage() {
  redirect("/admin/documents");
}
