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
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [lastCommand, setLastCommand] = useState<RemoteCommand | null>(null);
    const [isHost, setIsHost] = useState(false);
    
    const peerRef = useRef<any>(null);
    const connRef = useRef<any>(null);

    // Initial Setup
    useEffect(() => {
        // Determine if we are host or remote based on URL
        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');

        if (typeof Peer === 'undefined') {
            console.error("PeerJS library not loaded");
            return;
        }

        if (remoteTarget) {
            // REMOTE MODE (Phone)
            setIsHost(false);
            const peer = new Peer(); // Random ID for remote is fine
            
            peer.on('open', (id: string) => {
                setPeerId(id);
                connectToHost(peer, remoteTarget);
            });

            peer.on('error', (err: any) => console.error("Peer Error:", err));
            peerRef.current = peer;

        } else {
            // HOST MODE (TV/Display)
            setIsHost(true);
            // Generate a short 6-char ID
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
            // Prefix to avoid collisions on public server
            const fullId = `waqti-${shortId}`;
            
            const peer = new Peer(fullId);

            peer.on('open', () => {
                setPeerId(shortId); // Display only short ID to user
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
            });

            peer.on('error', (err: any) => {
                console.error("Peer Error:", err);
                // If ID taken (rare with prefix), retry? 
                // For simplicity, we just log.
            });

            peerRef.current = peer;
        }

        return () => {
            if (peerRef.current) peerRef.current.destroy();
        };
    }, []);

    const connectToHost = (peer: any, targetShortId: string) => {
        setConnectionStatus('connecting');
        const targetFullId = `waqti-${targetShortId.toUpperCase()}`;
        const conn = peer.connect(targetFullId);

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
        // Only used in Remote Mode if manual entry needed, but we handle via URL mostly
        if (peerRef.current && !isHost) {
            connectToHost(peerRef.current, remoteId);
        }
    };

    const sendCommand = (command: RemoteCommand) => {
        if (connRef.current && connectionStatus === 'connected') {
            connRef.current.send(command);
        } else {
            console.warn("Not connected, cannot send command");
        }
    };

    return (
        <RemoteContext.Provider value={{ peerId, connectionStatus, connectToPeer, sendCommand, lastCommand, isHost }}>
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
