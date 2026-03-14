import AuthGuard from "@/components/AuthGuard";
import MultiplayerLobby from "@/components/MultiplayerLobby";

export default function MultiplayerPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-background text-foreground flex flex-col p-4 relative overflow-hidden transition-colors duration-300">
        {/* Background */}
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] pointer-events-none transition-colors" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-[120px] pointer-events-none transition-colors" />

        <div className="max-w-7xl mx-auto w-full mb-4 z-10 flex items-center justify-center">
          <div className="glass-panel px-4 py-2 rounded-lg border-purple-500/30 text-purple-400 text-sm font-medium tracking-wider uppercase">
            Multiplayer Arena
          </div>
        </div>

        <div className="flex-grow flex items-start justify-center z-10">
          <MultiplayerLobby />
        </div>
      </main>
    </AuthGuard>
  );
}
