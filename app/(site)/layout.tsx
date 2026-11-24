import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignInDialog from "@/components/account/SignInDialog";
import { AccountProvider } from "@/lib/account";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <SignInDialog />
    </AccountProvider>
  );
}
