import Header from './Header';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function CustomerShell({ children, showFooter = false }: Props) {
  return (
    <div className="min-h-screen app-shell pb-20">
      <Header />
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
