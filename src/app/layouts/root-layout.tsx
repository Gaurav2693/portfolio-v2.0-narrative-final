import { useState, useCallback } from "react";
import { Outlet } from "react-router";
import { ThemeProvider } from "@/app/context/theme-context";
import { SoundProvider } from "@/app/context/sound-context";
import { CursorSystem } from "@/app/components/cursor-system";
import BootLoader from "@/app/components/boot-loader";
import GlobalInteractionSounds from "@/app/components/global-interaction-sounds";
import HeadMeta from "@/app/components/head-meta";

/**
 * Root layout — wraps all routes with ThemeProvider, SoundProvider,
 * and the boot sequence. Boot ALWAYS runs on every page load/reload.
 */
export default function RootLayout() {
  const [booting, setBooting] = useState(true);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
  }, []);

  return (
    <ThemeProvider>
      <SoundProvider>
        <HeadMeta />
        <CursorSystem />
        <GlobalInteractionSounds />
        {booting && <BootLoader onComplete={handleBootComplete} />}
        <Outlet />
      </SoundProvider>
    </ThemeProvider>
  );
}