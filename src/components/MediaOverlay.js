import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef } from "react";
function RemoteVideoTile({ player, stream, videoSize, view, }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        if (!stream || !player.videoEnabled) {
            ref.current.srcObject = null;
            return;
        }
        ref.current.srcObject = stream;
        return () => {
            if (ref.current)
                ref.current.srcObject = null;
        };
    }, [stream]);
    const hasLiveVideoTrack = !!stream && stream.getVideoTracks().some((track) => track.readyState === "live");
    const left = (player.x - view.x) * view.zoom + 36 * view.zoom - videoSize / 2;
    const top = (player.y - view.y) * view.zoom - videoSize - 24;
    if (!player.videoEnabled || !hasLiveVideoTrack)
        return null;
    return (_jsx("div", { className: "absolute pointer-events-none", style: {
            transform: `translate(${left}px, ${top}px)`,
            width: videoSize,
        }, children: _jsx("div", { className: "rounded-lg overflow-hidden border border-blue-400 shadow-lg", style: { backgroundColor: 'rgba(137, 207, 240, 0.8)' }, children: _jsx("video", { ref: ref, autoPlay: true, playsInline: true, className: "w-full h-full object-cover", style: { height: videoSize * 0.75 } }) }) }));
}
function RemoteAudioSink({ stream }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const hasLiveAudioTrack = !!stream &&
            stream.getAudioTracks().some((track) => track.readyState === "live");
        if (!hasLiveAudioTrack) {
            el.srcObject = null;
            return;
        }
        el.srcObject = stream;
        void el.play().catch(() => {
            // Browser autoplay policy may require user interaction first.
        });
        return () => {
            el.srcObject = null;
        };
    }, [stream]);
    return _jsx("audio", { ref: ref, autoPlay: true, playsInline: true });
}
function LocalPreview({ stream }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current || !stream)
            return;
        ref.current.srcObject = stream;
    }, [stream]);
    if (!stream)
        return null;
    return (_jsxs("div", { className: "fixed bottom-4 right-4 z-50 w-44 rounded-lg overflow-hidden border border-blue-400 shadow-xl", style: { backgroundColor: 'rgba(137, 207, 240, 0.8)' }, children: [_jsx("video", { ref: ref, autoPlay: true, playsInline: true, muted: true, className: "w-full h-28 object-cover" }), _jsx("div", { className: "px-2 py-1 text-[10px] text-stone-700 font-mono", children: "you" })] }));
}
export default function MediaOverlay({ remotePlayers, remoteStreams, localStream, micMuted, videoEnabled, videoSize, onVideoSizeChange, onToggleMic, onToggleVideo, view, }) {
    const remoteList = useMemo(() => Array.from(remotePlayers.values()), [remotePlayers]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "fixed top-4 left-4 z-50 bg-transparent backdrop-blur-sm border border-stone-700/40 shadow-lg rounded-xl px-6 py-3 flex items-center gap-6 font-mono text-xs select-none", children: [_jsx("button", { onClick: onToggleMic, className: `px-3 py-1.5 rounded-md border transition-colors ${micMuted
                            ? "border-red-600/60 text-red-700 bg-red-100/50"
                            : "border-green-700 text-green-700 bg-green-100/50"}`, children: micMuted ? "mic muted" : "mic on" }), _jsx("button", { onClick: onToggleVideo, className: `px-3 py-1.5 rounded-md border transition-colors ${videoEnabled
                            ? "border-green-700 text-green-700 bg-green-100/50"
                            : "border-stone-600 text-stone-700 bg-stone-200/70"}`, children: videoEnabled ? "camera on" : "camera off" }), _jsxs("label", { className: "flex items-center gap-2 text-black uppercase tracking-widest", children: ["video size", _jsx("input", { type: "range", min: 80, max: 220, value: videoSize, onChange: (e) => onVideoSizeChange(Number(e.target.value)) })] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none z-40", children: remoteList.map((player) => (_jsx(RemoteVideoTile, { player: player, stream: remoteStreams.get(player.id), videoSize: videoSize, view: view }, player.id))) }), remoteList.map((player) => (_jsx(RemoteAudioSink, { stream: remoteStreams.get(player.id) }, `audio-${player.id}`))), _jsx(LocalPreview, { stream: localStream })] }));
}
