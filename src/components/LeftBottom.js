import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import RedSofa from "../assets/components/layerTwo/RedSofa.svg";
import GreenPlants from "../assets/components/layerTwo/GreenPlants.svg";
import GreenPlantBig from "../assets/components/layerTwo/GreenPlantBig.svg";
import RedTable from "../assets/components/layerTwo/RedTable.svg";
import VendingMachine from "../assets/components/layerTwo/VendingMachine.svg";
import Chair from "../assets/components/layerTwo/Chair.svg";
import Table from "../assets/components/layerTwo/Table.svg";
import CommonSide from "../assets/components/layerOne/CommonSide.svg";
export default function LeftBottom() {
    useEffect(() => {
        console.log("🛋️ LeftBottom component mounted");
    }, []);
    return (_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("img", { src: RedSofa, alt: "Left Red Sofa", className: "absolute", style: {
                    left: "80px",
                    bottom: "70px",
                    transform: "scale(1.5)" // 🔥 increase size (try 1.2 → 1.8)
                }, onLoad: () => console.log("✅ Left Red Sofa loaded") }), _jsx("img", { src: GreenPlants, alt: "Green Plant 1", className: "absolute", style: { left: "75px", bottom: "2px", transform: "scale(1.2)" }, onLoad: () => console.log("✅ Green Plant 1 loaded") }), _jsx("img", { src: RedSofa, alt: "Bottom Red Sofa 1", className: "absolute", style: {
                    left: "150px",
                    bottom: "1px",
                    transform: "rotate(-90deg) scale(1.5)" // 🔥 ADD THIS
                } }), _jsx("img", { src: RedSofa, alt: "Bottom Red Sofa 2", className: "absolute", style: {
                    left: "240px",
                    bottom: "1px",
                    transform: "rotate(-90deg) scale(1.5)" // 🔥 ADD THIS
                } }), _jsx("img", { src: GreenPlants, alt: "Green Plant 2", className: "absolute", style: { left: "300px", bottom: "1px", transform: "scale(1.2)" }, onLoad: () => console.log("✅ Green Plant 2 loaded") }), _jsx("img", { src: CommonSide, alt: "Common Side", className: "absolute", style: { left: "340px", bottom: "25px", transform: "scale(1.4)" } }), _jsx("img", { src: RedTable, alt: "Red Table", className: "absolute", style: { left: "170px", bottom: "80px", transform: "scale(1.5)" } }), _jsx("img", { src: VendingMachine, alt: "Vending Machine", className: "absolute", style: { left: "100px", bottom: "200px", transform: "scale(1.5)" } }), _jsx("img", { src: GreenPlantBig, alt: "Green Plant Big 1", className: "absolute", style: { left: "220px", bottom: "260px", transform: "scale(1.3)" } }), _jsx("img", { src: GreenPlantBig, alt: "Green Plant Big 2", className: "absolute", style: { left: "240px", bottom: "260px", transform: "scale(1.3)" }, onLoad: () => console.log("✅ Green Plant Big 2 loaded") }), _jsx("img", { src: CommonSide, alt: "Common Side 2", className: "absolute", style: { left: "280px", bottom: "280px", transform: "scale(1.3)" } }), _jsx("img", { src: Chair, alt: "Chair 1", className: "absolute", style: { left: "80px", bottom: "380px", transform: "scale(1.4)" } }), _jsx("img", { src: Table, alt: "Table", className: "absolute", style: { left: "130px", bottom: "375px", transform: "scale(1.3)" } }), _jsx("img", { src: Chair, alt: "Chair 2", className: "absolute", style: { left: "200px", bottom: "380px", transform: "scaleX(-1) scale(1.4)" } })] }));
}
