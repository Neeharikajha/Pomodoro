import { jsx as _jsx } from "react/jsx-runtime";
import GameCanvas from "./components/GameCanvas";
export default function App() {
    const handleStateChange = () => {
        // No UI state is required yet for Step 3.
    };
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-neutral-900", children: _jsx(GameCanvas, { onStateChange: handleStateChange }) }));
}
