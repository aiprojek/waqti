
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
                debug: 2,
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
            });
            
            peerRef.current = peer;

        } else {
            // HOST MODE (TV/Display)
            setIsHost(true);
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const fullId = `waqti-${shortId}`;
            
            const peer = new Peer(fullId, {
                debug: 2,
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
        });

        conn.on('close', () => {
            setConnectionStatus('disconnected');
            connRef.current = null;
        });

        conn.on('error', (err: any) => {
            console.error("Connection error:", err);
            setConnectionStatus('disconnected');
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
            setConnectionStatus('disconnected'); // Reset status if send fails
        }
    };

    const resetConnection = () => {
        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        setConnectionStatus('disconnected');
        if (remoteTarget && !isHost) {
            if (peerRef.current) {
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
