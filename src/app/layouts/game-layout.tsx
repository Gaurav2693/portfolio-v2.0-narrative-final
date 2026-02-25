import { Outlet } from 'react-router';
import { GameNavigation } from '@/app/components/game/game-navigation';
import { SoundProvider } from '@/app/context/sound-context';

export default function GameLayout() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-[#0A0A0A]">
        <GameNavigation />
        <div className="pt-14">
          <Outlet />
        </div>
      </div>
    </SoundProvider>
  );
}