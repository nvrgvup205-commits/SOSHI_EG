import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function SettingsPage() {
  const { lang } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then((r) => setSettings(r.settings as Record<string, string>)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fields = [
    { key: 'whatsapp_number', label: 'WhatsApp Number' },
    { key: 'telegram_username', label: 'Telegram Username' },
    { key: 'site_name_ar', label: 'Site Name (AR)' },
    { key: 'site_name_en', label: 'Site Name (EN)' },
    { key: 'primary_color', label: 'Primary Color' },
    { key: 'accent_color', label: 'Accent Color' },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="label-luxury mb-1">Configuration</p>
        <h1 className="font-display text-3xl text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-accent" />
          {t('admin.settings', lang)}
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : (
        <form onSubmit={handleSave} className="card p-6 max-w-2xl">
          <div className="space-y-4">
            <label className="flex items-center justify-between card p-4">
              <span className="text-white">{settings.restaurant_open === 'false' ? t('admin.closed', lang) : t('admin.open', lang)}</span>
              <input
                type="checkbox"
                checked={settings.restaurant_open !== 'false'}
                onChange={(e) => setSettings({ ...settings, restaurant_open: e.target.checked ? 'true' : 'false' })}
              />
            </label>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{f.label}</label>
                <input className="input-field" dir="ltr"
                  value={settings[f.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button type="submit" disabled={saving} className="btn-luxury-filled text-xs">
              {saving ? '...' : 'Save Settings'}
            </button>
            {saved && <span className="text-success text-sm">Saved!</span>}
          </div>
        </form>
      )}
    </div>
  );
}
