import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import RoomLobby from "./components/RoomLobby";
import MediaOverlay from "./components/MediaOverlay";
import { createNetClient, } from "./net/client";
import { useRoomMedia } from "./net/media";
export default function App() {
    const [timerDisplay, setTimerDisplay] = useState("00:00");
    const [playerState, setPlayerState] = useState("walking");
    const [lobby, setLobby] = useState({
        phase: "lobby",
        localPlayer: null,
        roomId: null,
        mode: null,
    });
    const [remotePlayers, setRemotePlayers] = useState(new Map());
    const [resolvedRoomId, setResolvedRoomId] = useState(null);
    const [netClient, setNetClient] = useState(null);
    const [videoSize, setVideoSize] = useState(120);
    const mediaSignalHandlerRef = useRef(null);
    const handleStateChange = useCallback((state, display) => {
        setPlayerState(state);
        setTimerDisplay(display);
    }, []);
    const media = useRoomMedia(lobby.localPlayer?.id ?? "", netClient, remotePlayers);
    useEffect(() => {
        mediaSignalHandlerRef.current = media.handleSignal;
    }, [media.handleSignal]);
    function handleEnter(player, roomId, mode) {
        const client = createNetClient(player, roomId, mode, (players) => setRemotePlayers(new Map(players)), {
            onWebRTCSignal: (signal) => {
                void mediaSignalHandlerRef.current?.(signal);
            },
        });
        setNetClient(client);
        setLobby({ phase: "game", localPlayer: player, roomId, mode });
    }
    useEffect(() => {
        if (!netClient)
            return;
        const interval = setInterval(() => {
            const id = netClient.getRoomId();
            if (id !== "__random__") {
                setResolvedRoomId(id);
                clearInterval(interval);
            }
        }, 200);
        return () => {
            clearInterval(interval);
        };
    }, [netClient]);
    function handleLeave() {
        netClient?.disconnect();
        setLobby({ phase: "lobby", localPlayer: null, roomId: null, mode: null });
        setRemotePlayers(new Map());
        setResolvedRoomId(null);
        setNetClient(null);
    }
    if (lobby.phase === "lobby") {
        return _jsx(RoomLobby, { onEnter: handleEnter });
    }
    const { localPlayer } = lobby;
    const displayRoomId = resolvedRoomId ?? lobby.roomId ?? "...";
    const totalPlayers = remotePlayers.size + 1;
    return (_jsxs("div", { className: "relative w-screen h-screen bg-neutral-950", children: [_jsxs("div", { className: "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 text-xs font-mono text-stone-500 bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-lg", children: [_jsxs("span", { children: [localPlayer.avatar, " ", localPlayer.name] }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { children: ["room", " ", _jsx("span", { className: "text-yellow-400 tracking-widest font-bold", children: displayRoomId })] }), _jsx("button", { onClick: () => navigator.clipboard.writeText(displayRoomId), className: "text-stone-600 hover:text-yellow-400 transition-colors", title: "copy room code", children: "\uD83D\uDCCB" }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { className: "text-stone-600", children: [totalPlayers, "/8"] }), _jsx("span", { children: "\u00B7" }), _jsx("button", { onClick: handleLeave, className: "text-stone-600 hover:text-stone-400 underline", children: "leave" })] }), _jsxs("div", { className: "fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 flex-wrap justify-center max-w-4xl", children: [_jsxs("span", { className: "text-xs font-mono bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-full px-3 py-1", children: [localPlayer.avatar, " ", localPlayer.name, " (you)"] }), Array.from(remotePlayers.values()).map((p) => (_jsxs("span", { className: "text-xs font-mono bg-green-900/30 text-green-400 border border-green-800 rounded-full px-3 py-1", children: [p.avatar, " ", p.name] }, p.id)))] }), _jsx("div", { className: "fixed top-4 right-4 z-50", children: _jsx(HUD, { time: timerDisplay, status: playerState }) }), _jsx(MediaOverlay, { remotePlayers: remotePlayers, remoteStreams: media.remoteStreams, localStream: media.localStream, micMuted: media.micMuted, videoEnabled: media.videoEnabled, videoSize: videoSize, onVideoSizeChange: setVideoSize, onToggleMic: () => {
                    void media.toggleMic();
                }, onToggleVideo: () => {
                    void media.toggleVideo();
                } }), _jsx(GameCanvas, { onStateChange: handleStateChange, netClient: netClient ?? undefined, remotePlayers: remotePlayers, character: localPlayer.character }), _jsx("p", { className: "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-stone-600 text-xs font-mono bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-lg", children: "WASD / arrow keys to move \u00A0\u00B7\u00A0 E to sit / stand" })] }));
}
