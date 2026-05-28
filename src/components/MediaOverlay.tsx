import { useEffect, useMemo, useRef } from "react";
import type { RemotePlayer } from "../net/client";
import type { CameraView } from "../game/types";

interface Props {
  remotePlayers: Map<string, RemotePlayer>;
  remoteStreams: Map<string, MediaStream>;
  localStream: MediaStream | null;
  micMuted: boolean;
  videoEnabled: boolean;
  videoSize: number;
  onVideoSizeChange: (size: number) => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  view: CameraView;
}

function RemoteVideoTile({
  player,
  stream,
  videoSize,
  view,
}: {
  player: RemotePlayer;
  stream?: MediaStream;
  videoSize: number;
  view: CameraView;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!stream || !player.videoEnabled) {
      ref.current.srcObject = null;
      return;
    }
    ref.current.srcObject = stream;
    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [stream]);

  const hasLiveVideoTrack =
    !!stream && stream.getVideoTracks().some((track) => track.readyState === "live");

  const left = (player.x - view.x) * view.zoom + 36 * view.zoom - videoSize / 2;
  const top = (player.y - view.y) * view.zoom - videoSize - 24;

  if (!player.videoEnabled || !hasLiveVideoTrack) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate(${left}px, ${top}px)`,
        width: videoSize,
      }}
    >
      <div className="rounded-lg overflow-hidden border border-stone-700 bg-black/80 shadow-lg">
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ height: videoSize * 0.75 }}
        />
      </div>
    </div>
  );
}

function RemoteAudioSink({ stream }: { stream?: MediaStream }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hasLiveAudioTrack =
      !!stream &&
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

  return <audio ref={ref} autoPlay playsInline />;
}

function LocalPreview({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current || !stream) return;
    ref.current.srcObject = stream;
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-44 rounded-lg overflow-hidden border border-stone-700 bg-black/80 shadow-xl">
      <video ref={ref} autoPlay playsInline muted className="w-full h-28 object-cover" />
      <div className="px-2 py-1 text-[10px] text-stone-300 font-mono">you</div>
    </div>
  );
}

export default function MediaOverlay({
  remotePlayers,
  remoteStreams,
  localStream,
  micMuted,
  videoEnabled,
  videoSize,
  onVideoSizeChange,
  onToggleMic,
  onToggleVideo,
  view,
}: Props) {
  const remoteList = useMemo(() => Array.from(remotePlayers.values()), [remotePlayers]);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 bg-neutral-900/90 border border-stone-700 rounded-xl p-3 flex items-center gap-3 font-mono text-xs">
        <button
          onClick={onToggleMic}
          className={`px-3 py-1.5 rounded-md border transition-colors ${micMuted
            ? "border-red-600/60 text-red-400 bg-red-950/30"
            : "border-green-700 text-green-400 bg-green-950/30"
            }`}
        >
          {micMuted ? "mic muted" : "mic on"}
        </button>
        <button
          onClick={onToggleVideo}
          className={`px-3 py-1.5 rounded-md border transition-colors ${videoEnabled
            ? "border-green-700 text-green-400 bg-green-950/30"
            : "border-stone-600 text-stone-300 bg-stone-800/70"
            }`}
        >
          {videoEnabled ? "camera on" : "camera off"}
        </button>
        <label className="flex items-center gap-2 text-stone-300">
          video size
          <input
            type="range"
            min={80}
            max={220}
            value={videoSize}
            onChange={(e) => onVideoSizeChange(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="absolute inset-0 pointer-events-none z-40">
        {remoteList.map((player) => (
          <RemoteVideoTile
            key={player.id}
            player={player}
            stream={remoteStreams.get(player.id)}
            videoSize={videoSize}
            view={view}
          />
        ))}
      </div>

      {remoteList.map((player) => (
        <RemoteAudioSink key={`audio-${player.id}`} stream={remoteStreams.get(player.id)} />
      ))}

      <LocalPreview stream={localStream} />
    </>
  );
}
