import Header from './Header';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
  showFooter?: boolean;
  subHeader?: React.ReactNode;
}

export default function CustomerShell({ children, showFooter = false, subHeader }: Props) {
  return (
    <div className="min-h-screen app-shell pb-20">
      <div className="header-stack">
        <Header />
        {subHeader}
      </div>
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
