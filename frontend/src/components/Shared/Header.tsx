import LanguageSwitcher from './LanguageSwitcher';
import SiteLogo from './SiteLogo';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-4 py-2 z-50" dir="ltr">
        <div className="shrink-0">
          <ThemeToggle compact />
        </div>
        <div className="flex-1 flex justify-center min-w-0 px-2">
          <SiteLogo to="/" size="sm" showName />
        </div>
        <div className="shrink-0">
          <LanguageSwitcher dark />
        </div>
      </div>
    </header>
  );
}
