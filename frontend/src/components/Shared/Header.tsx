import LanguageSwitcher from './LanguageSwitcher';
import SiteLogo from './SiteLogo';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-4 py-2 gap-3" dir="ltr">
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <ThemeToggle compact />
          <LanguageSwitcher dark />
        </div>
        <SiteLogo to="/" size="sm" showName />
      </div>
    </header>
  );
}
