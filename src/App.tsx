import GameCanvas from "./components/GameCanvas";

export default function App() {
  const handleStateChange = () => {
    // No UI state is required yet for Step 3.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <GameCanvas onStateChange={handleStateChange} />
    </div>
  );
}
