import AuthGuard from "@/components/AuthGuard";
import SoloDashboard from "@/components/SoloDashboard";

export default function SoloModePage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-background text-foreground flex flex-col p-6 relative overflow-hidden pb-28 transition-colors duration-300">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-cyan-500/10 blur-[120px] pointer-events-none animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/8 dark:bg-purple-500/8 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full mb-6 z-10 flex items-center justify-center">
          <div className="glass-panel px-4 py-2 rounded-lg border-blue-500/30 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 text-sm font-medium tracking-wider uppercase">
            Solo Practice Mode
          </div>
        </div>

        <SoloDashboard />
      </main>
    </AuthGuard>
  );
}
