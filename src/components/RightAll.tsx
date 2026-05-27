import Pond from "../assets/components/layerThree/pond.svg";
import WoodenTable from "../assets/components/layerThree/woodenTable.svg";
import VendingMachine from "../assets/components/layerTwo/VendingMachine.svg";
import GreenPlantBig from "../assets/components/layerTwo/GreenPlantBig.svg";
import Table from "../assets/components/layerTwo/Table.svg";
import Chair from "../assets/components/layerTwo/Chair.svg";
import CommonSide from "../assets/components/layerOne/CommonSide.svg";
import GreenPlants from "../assets/components/layerTwo/GreenPlants.svg";


// All items scaled 1.3x
// SVG base sizes (before scale):
//   Pond:          235x65  → 305x84
//   WoodenTable:   64x32   → 83x42
//   VendingMachine: ~80x100 → 104x130
//   GreenPlantBig: ~50x60  → 65x78
//   Table:         ~50x50  → 65x65
//   Chair:         37x37   → 48x48
//   CommonSide:    39x121  → 51x157

const S = 1.5; // global scale

// Right edge anchor (distance from right)
const RIGHT = 20;

export default function RightAll() {
    return (
        <div className="absolute inset-0 pointer-events-none">

            {/* ── TOP RIGHT: Pond ── */}
            <img
                src={Pond}
                alt="Pond"
                className="absolute"
                style={{
                    right: RIGHT + 80,
                    top: 10,
                    transform: 'scale(2)',
                    transformOrigin: "top right",
                }}
            />

            {/* ── 2 Wooden Tables side by side, 40px below pond ── */}
            {/* Pond scaled height = 65*1.3 = 84, so top = 10+84+40 = 134 */}
            <img
                src={WoodenTable}
                alt="Wooden Table 1"
                className="absolute"
                style={{
                    right: RIGHT + Math.round(83 * S) + 300, // second table to the left
                    top: 160,
                    transform: `scale(${S})`,
                    transformOrigin: "top right",
                }}
            />
            <img
                src={WoodenTable}
                alt="Wooden Table 2"
                className="absolute"
                style={{
                    right: RIGHT + 150,
                    top: 160,
                    transform: `scale(${S})`,
                    transformOrigin: "top right",
                }}
            />

            {/* ── Vending Machine, 80px below wooden tables ── */}
            {/* Tables top=134, scaled height=42, so top = 134+42+80 = 256 */}
            <img
                src={VendingMachine}
                alt="Vending Machine"
                className="absolute"
                style={{
                    right: RIGHT + 55,
                    top: 300,
                    transform: `scale(${S})`,
                    transformOrigin: "top right",
                }}
            />

            {/* ── 4 Green Plant Big to the left of vending machine ── */}
            {/* Plant 1 */}
            <img
                src={GreenPlantBig}
                alt="Green Plant Big 1"
                className="absolute"
                style={{
                    right: RIGHT + 50,
                    top: 190,
                    transform: `scale(${S})`,
                    transformOrigin: "top right",
                }}
            />

            {/* Plant 2 */}
            <img
                src={GreenPlantBig}
                alt="Green Plant Big 2"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 10 + 70,
                    top: 340, // 👈 change freely
                    transform: `scale(${S * 1.1})`, // 👈 different size if needed
                    transformOrigin: "top right",
                }}
            />

            {/* Plant 3 */}
            <img
                src={GreenPlants}
                alt="Green Plant Big 3"
                className="absolute"
                style={{
                    right: RIGHT + 215 + 320 + 140,
                    top: 270,
                    transform: `scale(${S})`,
                    transformOrigin: "top right",
                    zIndex: 50,
                }}
            />

            {/* Plant 4 */}
            <img
                src={GreenPlants}
                alt="Green Plant Big 4"
                className="absolute"
                style={{
                    right: RIGHT + 90 + 210,
                    top: 160,
                    transform: `scale(${S * 0.9})`,
                    transformOrigin: "top right",
                }}
            />

            {/* ── 2 Tables + 4 Chairs (2 per table, one above one below) ── */}
            {/* Positioned further left of the plants */}
            {/* Table 1 */}
            <img
                src={Table}
                alt="Table 1"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 280,
                    top: 280,
                    transform: `scale(${S * 1.2})`,
                    transformOrigin: "top right",
                }}
            />
            {/* Chair above Table 1 */}
            <img
                src={Chair}
                alt="Chair above Table 1"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 20 + 380,
                    top: 280,
                    transform: `scale(${S * 1.2})`,
                    transformOrigin: "top right",
                }}
            />
            {/* Chair below Table 1 */}
            <img
                src={Chair}
                alt="Chair below Table 1"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 20 + 220,
                    top: 280,
                    transform: `scale(${S * 1.2}) scaleX(-1)`,
                    transformOrigin: "top right",
                }}
            />

            {/* Table 2 */}
            <img
                src={Table}
                alt="Table 2"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 20 + 90,
                    top: 450,
                    transform: `scale(${S * 1.2})`,
                    transformOrigin: "top right",
                }}
            />
            {/* Chair above Table 2 */}
            <img
                src={Chair}
                alt="Chair above Table 2"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 20 + 90 + 98,
                    top: 440,
                    transform: `scale(${S * 1.2})`,
                    transformOrigin: "top right",
                }}
            />
            {/* Chair below Table 2 */}
            <img
                src={Chair}
                alt="Chair below Table 2"
                className="absolute"
                style={{
                    right: RIGHT + 104 + 8 + 4 * 68 + 20 + 68,
                    top: 440,
                    transform: `scale(${S * 1.2}) scaleX(-1)`,
                    transformOrigin: "top right",
                }}
            />

            {/* ── BOTTOM RIGHT: 2 Chairs + 1 Table ── */}
            <img
                src={Chair}
                alt="Bottom Chair 1"
                className="absolute"
                style={{
                    right: RIGHT + 110,
                    bottom: 60,
                    transform: `scale(${S}) scaleX(-1)`,
                    transformOrigin: "bottom right",
                }}
            />
            <img
                src={Table}
                alt="Bottom Table"
                className="absolute"
                style={{
                    right: RIGHT + 120,
                    bottom: 60,
                    transform: `scale(${S})`,
                    transformOrigin: "bottom right",
                }}
            />
            <img
                src={Chair}
                alt="Bottom Chair 2"
                className="absolute"
                style={{
                    right: RIGHT + 200,
                    bottom: 60,
                    transform: `scale(${S})`,
                    transformOrigin: "bottom right",
                }}
            />

            {/* ── CommonSide in front of bottom table (below it) ── */}
            <img
                src={CommonSide}
                alt="CommonSide Front"
                className="absolute"
                style={{
                    right: RIGHT + 280,
                    bottom: 40 - 157 - 10 + 120,  // just below the table group
                    transform: `scale(${S})`,
                    transformOrigin: "bottom right",
                }}
            />

            {/* ── CommonSide to the left of bottom table group ── */}
            <img
                src={CommonSide}
                alt="CommonSide Left"
                className="absolute"
                style={{
                    right: RIGHT + 240,
                    bottom: 220,
                    transform: `rotate(90deg) scale(${S})`,
                    transformOrigin: "bottom right",
                }}
            />

        </div>
    );
}
