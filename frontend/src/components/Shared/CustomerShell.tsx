import Header from './Header';
import Footer from './Footer';

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-shell pb-24">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
