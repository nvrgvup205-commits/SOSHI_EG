import LanguageSwitcher from './LanguageSwitcher';
import SiteLogo from './SiteLogo';
import ThemeToggle from './ThemeToggle';
import TrackOrderButton from './TrackOrderButton';

export default function Header() {
  return (
    <header className="app-header">
      <div className="relative max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 z-10">
          <LanguageSwitcher dark />
          <ThemeToggle compact />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 z-10">
          <TrackOrderButton />
        </div>

        <div className="z-10">
          <SiteLogo to="/" size="sm" showName />
        </div>
      </div>
    </header>
  );
}
