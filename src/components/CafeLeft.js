import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import BackGround from "../assets/components/layerOne/BackGround.svg";
import Fridge from "../assets/components/layerOne/Fridge.svg";
import FridgeSide from "../assets/components/layerOne/FridgeSide.svg";
import FridgeSideTwo from "../assets/components/layerOne/FridgeSideTwo.svg";
import Oven from "../assets/components/layerOne/Oven.svg";
import CommonSide from "../assets/components/layerOne/CommonSide.svg";
import Drawer from "../assets/components/layerOne/Drawer.svg";
import LeftBottom from "./LeftBottom";
import RightAll from "./RightAll";
export default function CafeLeft() {
    useEffect(() => {
        console.log("🏪 CafeLeft component mounted");
    }, []);
    return (_jsxs("div", { className: "fixed inset-0 w-screen h-screen overflow-hidden", children: [_jsx("img", { src: BackGround, alt: "Background", className: "absolute inset-0 w-full h-full object-cover" }), _jsxs("div", { className: "absolute inset-0 w-full h-full z-10", children: [_jsx("img", { src: Fridge, alt: "Fridge", className: "absolute", style: {
                            left: "50px",
                            top: "-50px",
                            width: "120px",
                            transform: "scale(0.6)"
                        } }), _jsx("img", { src: FridgeSide, alt: "Fridge Side", className: "absolute", style: {
                            left: "180px",
                            top: "15px",
                            width: "100px",
                            transform: "scale(1.6)"
                        } }), _jsx("img", { src: FridgeSideTwo, alt: "Fridge Side Two", className: "absolute", style: {
                            left: "290px",
                            top: "-2px",
                            width: "100px",
                            transform: "scale(0.9)"
                        } }), _jsx("img", { src: Oven, alt: "Oven", className: "absolute", style: {
                            left: "360px",
                            top: "-40px",
                            width: "100px",
                            transform: "scale(0.5)"
                        } }), _jsx("img", { src: CommonSide, alt: "Common Side", className: "absolute", style: {
                            left: "400px",
                            top: "-90px",
                            width: "100px",
                            transform: "scale(0.4)"
                        } })] }), _jsxs("div", { className: "absolute left-20 flex z-10", style: { top: "180px" }, children: [_jsx("img", { src: Drawer, alt: "Drawer 1", className: "block" }), _jsx("img", { src: Drawer, alt: "Drawer 2", className: "block" }), _jsx("img", { src: Drawer, alt: "Drawer 3", className: "block" })] }), _jsx(LeftBottom, {}), _jsx(RightAll, {})] }));
}
