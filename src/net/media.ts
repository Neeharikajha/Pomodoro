import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NetClient, RemotePlayer, WebRTCSignalMessage } from "./client";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export interface MediaController {
  micMuted: boolean;
  videoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  handleSignal: (signal: WebRTCSignalMessage) => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleVideo: () => Promise<void>;
}

export function useRoomMedia(
  localPlayerId: string,
  netClient: NetClient | null,
  remotePlayers: Map<string, RemotePlayer>,
): MediaController {
  const [micMuted, setMicMuted] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingSignalsRef = useRef<Map<string, unknown[]>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(
    new Map(),
  );
  const localStreamRef = useRef<MediaStream | null>(null);

  const syncLocalTracksToPeers = useCallback(() => {
    const local = localStreamRef.current;
    if (!local) return;

    for (const pc of peersRef.current.values()) {
      const senders = pc.getSenders();
      for (const track of local.getTracks()) {
        const hasKindSender = senders.some(
          (s) => s.track && s.track.kind === track.kind,
        );
        if (!hasKindSender) {
          pc.addTrack(track, local);
        }
      }
    }
  }, []);

  const removeTrackKindFromPeers = useCallback((kind: "audio" | "video") => {
    for (const pc of peersRef.current.values()) {
      const senders = pc.getSenders();
      for (const sender of senders) {
        if (sender.track?.kind === kind) {
          try {
            sender.replaceTrack(null);
          } catch {
            // Ignore sender replacement races.
          }
          try {
            pc.removeTrack(sender);
          } catch {
            // Ignore remove errors on already detached sender.
          }
        }
      }
    }
  }, []);

  const updateMediaState = useCallback(
    (nextMuted: boolean, nextVideo: boolean) => {
      netClient?.sendMediaState(nextMuted, nextVideo);
    },
    [netClient],
  );

  const ensureLocalAudio = useCallback(async () => {
    const stream = localStreamRef.current;
    if (stream && stream.getAudioTracks().length > 0) return stream;
    const next = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const merged = stream
      ? new MediaStream([...stream.getTracks(), ...next.getTracks()])
      : next;
    localStreamRef.current = merged;
    setLocalStream(merged);
    return merged;
  }, []);

  const ensureLocalVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (stream && stream.getVideoTracks().length > 0) return stream;
    const next = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    const merged = stream
      ? new MediaStream([...stream.getTracks(), ...next.getTracks()])
      : next;
    localStreamRef.current = merged;
    setLocalStream(merged);
    return merged;
  }, []);

  const getOrCreatePeer = useCallback(
    (remoteId: string) => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peersRef.current.set(remoteId, pc);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          netClient?.sendWebRTCSignal(remoteId, {
            kind: "candidate",
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const incomingTrack = event.track;
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          const existing = next.get(remoteId) ?? new MediaStream();
          const alreadyExists = existing
            .getTracks()
            .some((track) => track.id === incomingTrack.id);
          if (!alreadyExists) {
            existing.addTrack(incomingTrack);
          }
          next.set(remoteId, existing);
          return next;
        });
      };

      const local = localStreamRef.current;
      if (local) {
        for (const track of local.getTracks()) {
          pc.addTrack(track, local);
        }
      }

      return pc;
    },
    [netClient],
  );

  const applyPendingSignals = useCallback(
    async (remoteId: string) => {
      const pending = pendingSignalsRef.current.get(remoteId) ?? [];
      if (pending.length === 0) return;
      pendingSignalsRef.current.delete(remoteId);
      for (const payload of pending) {
        await handleIncomingSignal({
          fromId: remoteId,
          toId: localPlayerId,
          payload,
        });
      }
    },
    [localPlayerId],
  );

  const negotiate = useCallback(
    async (remoteId: string) => {
      // Avoid offer glare: only lexicographically smaller id creates offers.
      if (!localPlayerId || localPlayerId > remoteId) return;
      const pc = getOrCreatePeer(remoteId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      netClient?.sendWebRTCSignal(remoteId, {
        kind: "offer",
        sdp: offer,
      });
    },
    [getOrCreatePeer, localPlayerId, netClient],
  );

  const flushPendingCandidates = useCallback(async (remoteId: string) => {
    const pc = peersRef.current.get(remoteId);
    if (!pc || !pc.remoteDescription) return;
    const pending = pendingCandidatesRef.current.get(remoteId) ?? [];
    if (pending.length === 0) return;
    pendingCandidatesRef.current.delete(remoteId);
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore malformed/stale candidates.
      }
    }
  }, []);

  const handleIncomingSignal = useCallback(
    async (signal: WebRTCSignalMessage) => {
      if (signal.toId !== localPlayerId) return;
      const payload = signal.payload as any;
      const remoteId = signal.fromId;

      if (!payload || !payload.kind) return;
      const pc = getOrCreatePeer(remoteId);

      if (payload.kind === "offer") {
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.sdp),
        );
        await flushPendingCandidates(remoteId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        netClient?.sendWebRTCSignal(remoteId, {
          kind: "answer",
          sdp: answer,
        });
        return;
      }

      if (payload.kind === "answer") {
        if (!pc.localDescription) {
          const list = pendingSignalsRef.current.get(remoteId) ?? [];
          list.push(payload);
          pendingSignalsRef.current.set(remoteId, list);
          return;
        }
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.sdp),
        );
        await flushPendingCandidates(remoteId);
        return;
      }

      if (payload.kind === "candidate") {
        if (!pc.remoteDescription) {
          const list = pendingCandidatesRef.current.get(remoteId) ?? [];
          list.push(payload.candidate);
          pendingCandidatesRef.current.set(remoteId, list);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // Ignore transient ICE race conditions.
        }
      }
    },
    [flushPendingCandidates, getOrCreatePeer, localPlayerId, netClient],
  );

  useEffect(() => {
    if (netClient) return;
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams(new Map());
    setMicMuted(true);
    setVideoEnabled(false);
  }, [netClient]);

  useEffect(() => {
    const remoteIds = new Set(remotePlayers.keys());
    for (const [id, pc] of peersRef.current.entries()) {
      if (!remoteIds.has(id)) {
        pc.close();
        peersRef.current.delete(id);
        pendingCandidatesRef.current.delete(id);
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }, [remotePlayers]);

  useEffect(() => {
    if (!videoEnabled && micMuted) return;
    remotePlayers.forEach((_p, remoteId) => {
      void negotiate(remoteId);
      void applyPendingSignals(remoteId);
    });
  }, [remotePlayers, videoEnabled, micMuted, negotiate, applyPendingSignals]);

  const toggleMic = useCallback(async () => {
    if (micMuted) {
      const stream = await ensureLocalAudio();
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = true;
      syncLocalTracksToPeers();
      setMicMuted(false);
      updateMediaState(false, videoEnabled);
      remotePlayers.forEach((_p, remoteId) => {
        void negotiate(remoteId);
      });
      return;
    }
    const stream = localStreamRef.current;
    stream?.getAudioTracks().forEach((t) => {
      t.enabled = false;
    });
    removeTrackKindFromPeers("audio");
    setMicMuted(true);
    updateMediaState(true, videoEnabled);
    remotePlayers.forEach((_p, remoteId) => {
      void negotiate(remoteId);
    });
  }, [
    micMuted,
    ensureLocalAudio,
    syncLocalTracksToPeers,
    updateMediaState,
    videoEnabled,
    remotePlayers,
    negotiate,
    removeTrackKindFromPeers,
  ]);

  const toggleVideo = useCallback(async () => {
    if (!videoEnabled) {
      const stream = await ensureLocalVideo();
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = true;
      syncLocalTracksToPeers();
      setVideoEnabled(true);
      updateMediaState(micMuted, true);
      remotePlayers.forEach((_p, remoteId) => {
        void negotiate(remoteId);
      });
      return;
    }
    const stream = localStreamRef.current;
    stream?.getVideoTracks().forEach((t) => {
      t.enabled = false;
      t.stop();
      stream.removeTrack(t);
    });
    removeTrackKindFromPeers("video");
    setVideoEnabled(false);
    setLocalStream(stream ? new MediaStream(stream.getTracks()) : null);
    updateMediaState(micMuted, false);
    remotePlayers.forEach((_p, remoteId) => {
      void negotiate(remoteId);
    });
  }, [
    videoEnabled,
    ensureLocalVideo,
    syncLocalTracksToPeers,
    updateMediaState,
    micMuted,
    remotePlayers,
    negotiate,
    removeTrackKindFromPeers,
  ]);

  useEffect(
    () => () => {
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      pendingCandidatesRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      setRemoteStreams(new Map());
    },
    [],
  );

  return useMemo(
    () => ({
      micMuted,
      videoEnabled,
      localStream,
      remoteStreams,
      handleSignal: handleIncomingSignal,
      toggleMic,
      toggleVideo,
    }),
    [
      micMuted,
      videoEnabled,
      localStream,
      remoteStreams,
      handleIncomingSignal,
      toggleMic,
      toggleVideo,
    ],
  );
}
