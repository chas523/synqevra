import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@modern-js/runtime/router';

import medplum_logo from '../assets/images/medplum_logo.png';
import thingsboard_logo from '../assets/images/thingsboard_logo.png';

const AppSwitch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sprawdź aktualną ścieżkę i ustaw stan switcha
  const [isApp, setIsApp] = useState<boolean>(() => {
    return location.pathname.startsWith('/medplum');
  });

  // Aktualizuj stan gdy zmieni się URL
  useEffect(() => {
    setIsApp(location.pathname.startsWith('/medplum'));
  }, [location.pathname]);

  // Obsługa switcha z React Router navigation
  const handleSwitchChange = (checked: boolean) => {
    const newPath = checked ? '/medplum' : '/thingsboard';
    navigate(newPath);
  };

  return (
    <div className="fixed top-4 right-4 z-10 bg-white rounded-full shadow-lg px-4 py-2 border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <img
            src={thingsboard_logo}
            alt="ThingsBoard"
            className="w-6 h-6 object-contain"
          />
        </div>

        <Switch checked={isApp} onCheckedChange={handleSwitchChange} />

        <div className="flex items-center gap-1">
          <img
            src={medplum_logo}
            alt="Medplum"
            className="w-6 h-6 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AppSwitch;