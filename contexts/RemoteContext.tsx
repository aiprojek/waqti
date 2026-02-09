
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { RemoteCommand } from '../types';

declare const Peer: any;

interface RemoteContextType {
    peerId: string | null;
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    connectToPeer: (remoteId: string) => void;
    sendCommand: (command: RemoteCommand) => void;
    lastCommand: RemoteCommand | null;
    isHost: boolean;
    resetConnection: () => void; // New function to force retry
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [lastCommand, setLastCommand] = useState<RemoteCommand | null>(null);
    const [isHost, setIsHost] = useState(false);
    
    const peerRef = useRef<any>(null);
    const connRef = useRef<any>(null);
    const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Function to clear heartbeat
    const stopHeartbeat = () => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }
    };

    // Function to start heartbeat (Remote side only)
    const startHeartbeat = (connection: any) => {
        stopHeartbeat();
        // Send a PING every 2 seconds to keep the NAT hole open and prevent mobile throttling
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

    const initializePeer = (isHostMode: boolean, remoteTarget?: string) => {
        if (typeof Peer === 'undefined') {
            console.error("PeerJS library not loaded");
            return;
        }

        // Clean up existing peer if any
        if (peerRef.current) {
            peerRef.current.destroy();
        }

        if (!isHostMode) {
            // REMOTE MODE (Phone)
            setIsHost(false);
            const peer = new Peer({
                debug: 1, // Reduced debug level
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            }); 
            
            peer.on('open', (id: string) => {
                setPeerId(id);
                if (remoteTarget) {
                    connectToHost(peer, remoteTarget);
                }
            });

            peer.on('error', (err: any) => {
                console.error("Peer Error:", err);
                setConnectionStatus('disconnected');
                // Retry initialization on fatal error after delay
                if (!isHostMode && remoteTarget) {
                     clearTimeout(reconnectTimeout.current!);
                     reconnectTimeout.current = setTimeout(() => initializePeer(false, remoteTarget), 3000);
                }
            });
            
            peerRef.current = peer;

        } else {
            // HOST MODE (TV/Display)
            setIsHost(true);
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const fullId = `waqti-${shortId}`;
            
            const peer = new Peer(fullId, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            peer.on('open', () => {
                setPeerId(shortId); 
            });

            peer.on('connection', (conn: any) => {
                console.log("Incoming connection from", conn.peer);
                connRef.current = conn;
                setConnectionStatus('connected');

                conn.on('data', (data: RemoteCommand) => {
                    // Ignore Heartbeat PINGs
                    if (data.type === 'PING') return;
                    
                    console.log("Received command:", data);
                    setLastCommand(data);
                });

                conn.on('close', () => setConnectionStatus('disconnected'));
                conn.on('error', (err: any) => console.error("Conn error:", err));
            });

            peer.on('error', (err: any) => {
                console.error("Peer Error:", err);
                // Retry generation if ID taken (rare)
                if (err.type === 'unavailable-id') {
                    setTimeout(() => initializePeer(true), 1000);
                }
            });

            peerRef.current = peer;
        }
    };

    // Initial Setup
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        initializePeer(!remoteTarget, remoteTarget || undefined);

        return () => {
            stopHeartbeat();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (peerRef.current) peerRef.current.destroy();
        };
    }, []);

    const connectToHost = (peer: any, targetShortId: string) => {
        setConnectionStatus('connecting');
        const targetFullId = `waqti-${targetShortId.toUpperCase()}`;
        
        // Add reliable: true to ensure delivery and better connection handling
        const conn = peer.connect(targetFullId, {
            reliable: true,
            serialization: 'json'
        });

        conn.on('open', () => {
            console.log("Connected to host:", targetFullId);
            setConnectionStatus('connected');
            connRef.current = conn;
            // Start Pinging the Host
            startHeartbeat(conn);
        });

        conn.on('close', () => {
            console.log("Connection closed. Retrying...");
            setConnectionStatus('disconnected');
            connRef.current = null;
            stopHeartbeat();
            
            // Auto Reconnect Logic
            clearTimeout(reconnectTimeout.current!);
            reconnectTimeout.current = setTimeout(() => {
                if (peer && !peer.destroyed) {
                    connectToHost(peer, targetShortId);
                } else {
                    // If peer is destroyed, re-init everything
                    initializePeer(false, targetShortId);
                }
            }, 1000); // Try to reconnect quickly
        });

        conn.on('error', (err: any) => {
            console.error("Connection error:", err);
            // Don't set status to disconnected here immediately, let the close event handle it
            // or let the retry logic handle it.
        });
    };

    const connectToPeer = (remoteId: string) => {
        if (peerRef.current && !isHost) {
            connectToHost(peerRef.current, remoteId);
        }
    };

    const sendCommand = (command: RemoteCommand) => {
        if (connRef.current && connectionStatus === 'connected') {
            connRef.current.send(command);
        } else {
            console.warn("Not connected, cannot send command");
            // If we try to send and fail, trigger a reset
            setConnectionStatus('disconnected');
            resetConnection();
        }
    };

    const resetConnection = () => {
        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        setConnectionStatus('disconnected');
        stopHeartbeat();
        
        if (remoteTarget && !isHost) {
            if (peerRef.current && !peerRef.current.destroyed) {
                connectToHost(peerRef.current, remoteTarget);
            } else {
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
