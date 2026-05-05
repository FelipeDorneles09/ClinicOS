import { redirect } from "next/navigation";

// Root redirects to login — users are always redirected to their dashboard
// after login via the auth helper getDashboardPath()
export default function Home() {
  redirect("/login");
}
