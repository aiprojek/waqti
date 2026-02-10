
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import type { RemoteCommand } from '../types';

declare const Peer: any;

interface RemoteContextType {
    peerId: string | null;
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    connectToPeer: (remoteId: string) => void;
    sendCommand: (command: RemoteCommand) => void;
    lastCommand: RemoteCommand | null;
    isHost: boolean;
    resetConnection: () => void;
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [lastCommand, setLastCommand] = useState<RemoteCommand | null>(null);
    const [isHost, setIsHost] = useState(false);
    
    // Refs to keep track of instances without triggering re-renders
    const peerRef = useRef<any>(null);
    const connRef = useRef<any>(null);
    const isInitialized = useRef(false);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Heartbeat Logic ---
    const startHeartbeat = (connection: any) => {
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = setInterval(() => {
            if (connection && connection.open) {
                try {
                    connection.send({ type: 'PING', timestamp: Date.now() });
                } catch (e) {
                    console.warn("Heartbeat failed", e);
                }
            }
        }, 2000);
    };

    const stopHeartbeat = () => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }
    };

    // --- Peer Initialization ---
    const initializePeer = useCallback((isHostMode: boolean, remoteTarget?: string) => {
        if (typeof Peer === 'undefined') {
            console.error("PeerJS library not loaded");
            return;
        }

        // Prevent double initialization in React StrictMode
        if (peerRef.current && !peerRef.current.destroyed) {
            console.log("Peer already active, skipping init.");
            return;
        }

        console.log(`Initializing PeerJS... Mode: ${isHostMode ? 'HOST' : 'REMOTE'}`);

        let peer: any;
        const peerConfig = {
            debug: 1, // Reduced debug level
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            }
        };

        if (isHostMode) {
            setIsHost(true);
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const fullId = `waqti-${shortId}`;
            peer = new Peer(fullId, peerConfig);
            
            peer.on('open', (id: string) => {
                console.log("Host Peer Open:", id);
                // Extract short ID just in case PeerJS adds suffix
                const finalShortId = id.replace('waqti-', '').split('-')[0]; 
                setPeerId(finalShortId);
            });
        } else {
            setIsHost(false);
            peer = new Peer(peerConfig); // Let server assign ID for remote
            
            peer.on('open', (id: string) => {
                console.log("Remote Peer Open:", id);
                setPeerId(id);
                if (remoteTarget) {
                    connectToHost(peer, remoteTarget);
                }
            });
        }

        // --- Connection Handlers ---
        peer.on('connection', (conn: any) => {
            console.log("Incoming connection from", conn.peer);
            
            conn.on('open', () => {
                console.log("Connection Established!");
                connRef.current = conn;
                setConnectionStatus('connected');
            });

            conn.on('data', (data: RemoteCommand) => {
                if (data.type === 'PING') return;
                console.log("Received command:", data);
                setLastCommand(data);
            });

            conn.on('close', () => {
                console.log("Connection closed remotely");
                setConnectionStatus('disconnected');
                connRef.current = null;
            });
            
            conn.on('error', (err: any) => console.error("Conn error:", err));
        });

        // --- Peer Event Handlers ---
        peer.on('disconnected', () => {
            console.log("Peer disconnected from server.");
            // Automatically try to reconnect to the signaling server if not destroyed
            if (peerRef.current && !peerRef.current.destroyed) {
                // Add a small delay to avoid rapid reconnection loops
                setTimeout(() => {
                    if (peerRef.current && !peerRef.current.destroyed && peerRef.current.disconnected) {
                        console.log("Attempting to reconnect to server...");
                        peerRef.current.reconnect();
                    }
                }, 3000);
            }
        });

        peer.on('close', () => {
            console.log("Peer closed.");
            setConnectionStatus('disconnected');
            setPeerId(null);
        });

        peer.on('error', (err: any) => {
            console.error("Peer Error:", err.type, err);
            
            if (err.type === 'unavailable-id') {
                // If Host ID taken, retry with new ID
                if (isHostMode) {
                    peer.destroy();
                    setTimeout(() => initializePeer(true), 500);
                }
            } else if (err.type === 'peer-unavailable') {
                // Host not found
                setConnectionStatus('disconnected');
            } else if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'socket-closed') {
                // These errors indicate connection issues with the signaling server.
                // We rely on the 'disconnected' event to trigger reconnection.
                // Explicitly calling reconnect here can cause the "not disconnected" error
                // if the internal state hasn't updated yet.
                console.warn("Network issue detected. Waiting for auto-reconnect...");
            }
        });

        peerRef.current = peer;
    }, []);

    // --- Connect Logic (Remote Side) ---
    const connectToHost = (peer: any, targetShortId: string) => {
        if (!peer || peer.destroyed) return;

        setConnectionStatus('connecting');
        const targetFullId = `waqti-${targetShortId.toUpperCase()}`;
        console.log("Attempting to connect to:", targetFullId);

        const conn = peer.connect(targetFullId, {
            reliable: true,
            serialization: 'json'
        });

        // Set a timeout to fail if connection takes too long
        const connectionTimeout = setTimeout(() => {
            if (conn && !conn.open) {
                console.warn("Connection timed out.");
                // We don't close immediately here to allow late connections,
                // but we update UI. PeerJS has its own internal timeouts too.
                if (connectionStatus === 'connecting') {
                     setConnectionStatus('disconnected');
                }
            }
        }, 10000);

        conn.on('open', () => {
            clearTimeout(connectionTimeout);
            console.log("Connected to host successfully!");
            setConnectionStatus('connected');
            connRef.current = conn;
            startHeartbeat(conn);
        });

        conn.on('close', () => {
            console.log("Connection closed.");
            setConnectionStatus('disconnected');
            connRef.current = null;
            stopHeartbeat();
            clearTimeout(connectionTimeout);
        });

        conn.on('error', (err: any) => {
            console.error("Connection Error:", err);
            setConnectionStatus('disconnected');
            clearTimeout(connectionTimeout);
        });
    };

    // --- Main Effect ---
    useEffect(() => {
        if (isInitialized.current) return; // Guard against React StrictMode
        isInitialized.current = true;

        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        
        initializePeer(!remoteTarget, remoteTarget || undefined);

        return () => {
            stopHeartbeat();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            isInitialized.current = false;
        };
    }, [initializePeer]);

    const connectToPeer = (remoteId: string) => {
        if (peerRef.current && !isHost) {
            connectToHost(peerRef.current, remoteId);
        }
    };

    const sendCommand = (command: RemoteCommand) => {
        if (connRef.current && connRef.current.open) {
            try {
                connRef.current.send(command);
            } catch (e) {
                console.error("Send failed:", e);
                setConnectionStatus('disconnected');
            }
        } else {
            console.warn("Cannot send, not connected.");
            setConnectionStatus('disconnected');
        }
    };

    const resetConnection = () => {
        console.log("Resetting connection...");
        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        
        setConnectionStatus('disconnected');
        stopHeartbeat();
        
        if (connRef.current) {
            connRef.current.close();
            connRef.current = null;
        }

        if (remoteTarget && !isHost) {
            if (peerRef.current && !peerRef.current.destroyed) {
                // If peer is alive, just try to connect again
                connectToHost(peerRef.current, remoteTarget);
            } else {
                // If peer is dead, restart everything
                if (peerRef.current) peerRef.current.destroy();
                peerRef.current = null;
                initializePeer(false, remoteTarget);
            }
        }
    };

    return (
        <RemoteContext.Provider value={{ peerId, connectionStatus, connectToPeer, sendCommand, lastCommand, isHost, resetConnection }}>
            {children}
        </RemoteContext.Provider>
    );
};

export const useRemote = (): RemoteContextType => {
    const context = useContext(RemoteContext);
    if (context === undefined) {
        throw new Error('useRemote must be used within a RemoteProvider');
    }
    return context;
};
