
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import type { RemoteCommand } from '../types';

interface RemoteContextType {
    peerId: string | null;
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    connectToPeer: (remoteId: string) => void;
    sendCommand: (command: RemoteCommand) => void;
    lastCommand: RemoteCommand | null;
    isHost: boolean;
    authStatus: 'idle' | 'pending' | 'ok' | 'failed';
    pairingToken: string | null;
    resetConnection: () => void;
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [lastCommand, setLastCommand] = useState<RemoteCommand | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [authStatus, setAuthStatus] = useState<'idle' | 'pending' | 'ok' | 'failed'>('idle');
    const authStatusRef = useRef<'idle' | 'pending' | 'ok' | 'failed'>('idle');
    const authTokenRef = useRef<string | null>(null);
    
    // Refs to keep track of instances without triggering re-renders
    const peerRef = useRef<any>(null);
    const connRef = useRef<any>(null);
    const isInitialized = useRef(false);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const connectionAuth = useRef<WeakMap<any, boolean>>(new WeakMap());
    const authTimeouts = useRef<WeakMap<any, ReturnType<typeof setTimeout>>>(new WeakMap());

    // --- Heartbeat Logic ---
    const startHeartbeat = (connection: any) => {
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = setInterval(() => {
            if (connection && connection.open) {
                try {
                    connection.send({ type: 'PING', timestamp: Date.now() });
                } catch (e) {
                    // Suppress
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
    const initializePeer = useCallback((isHostMode: boolean, remoteTarget?: string, remoteToken?: string) => {
        if (typeof Peer === 'undefined') {
            console.error("PeerJS library not loaded");
            return;
        }

        // Prevent double initialization in React StrictMode
        if (peerRef.current && !peerRef.current.destroyed) {
            return;
        }

        let peer: any;
        const peerConfig = {
            debug: 0, // Disable debug logs to clean console
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
            
            // --- PERSISTENT ID LOGIC ---
            // 1. Try to get existing ID from localStorage
            let shortId = localStorage.getItem('waqti_host_id');
            
            // 2. If not found, generate new one and save it
            if (!shortId) {
                shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
                localStorage.setItem('waqti_host_id', shortId);
            }

            const fullId = `waqti-${shortId}`;
            peer = new Peer(fullId, peerConfig);
            
            peer.on('open', (id: string) => {
                // Extract short ID just in case PeerJS adds suffix
                const finalShortId = id.replace('waqti-', '').split('-')[0]; 
                setPeerId(finalShortId);
            });
            let token = localStorage.getItem('waqti_remote_token');
            if (!token) {
                token = Math.random().toString(36).substring(2, 10).toUpperCase();
                localStorage.setItem('waqti_remote_token', token);
            }
            setAuthToken(token);
            authTokenRef.current = token;
        } else {
            setIsHost(false);
            peer = new Peer(peerConfig); // Let server assign ID for remote
            if (remoteToken) {
                setAuthToken(remoteToken);
                authTokenRef.current = remoteToken;
            }
            
            peer.on('open', (id: string) => {
                setPeerId(id);
                if (remoteTarget) {
                    connectToHost(peer, remoteTarget, remoteToken);
                }
            });
        }

        // --- Connection Handlers ---
        peer.on('connection', (conn: any) => {
            conn.on('open', () => {
                connRef.current = conn;
                setConnectionStatus('connecting');
                if (isHostMode) {
                    setAuthStatus('idle');
                    authStatusRef.current = 'idle';
                }
                connectionAuth.current.set(conn, false);
                const timeout = setTimeout(() => {
                    const isAuthed = connectionAuth.current.get(conn);
                    if (!isAuthed) {
                        try { conn.close(); } catch (e) { /* ignore */ }
                    }
                }, 8000);
                authTimeouts.current.set(conn, timeout);
            });

            conn.on('data', (data: RemoteCommand) => {
                if (data.type === 'PING') return;
                if (data.type === 'AUTH') {
                    if (data.payload && data.payload.token && data.payload.token === authTokenRef.current) {
                        connectionAuth.current.set(conn, true);
                        const timeout = authTimeouts.current.get(conn);
                        if (timeout) clearTimeout(timeout);
                        setConnectionStatus('connected');
                        try {
                            conn.send({ type: 'AUTH_OK', timestamp: Date.now() });
                        } catch (e) {
                            // ignore
                        }
                    } else {
                        try {
                            conn.send({ type: 'AUTH_FAIL', timestamp: Date.now() });
                        } catch (e) {
                            // ignore
                        }
                        try { conn.close(); } catch (e) { /* ignore */ }
                    }
                    return;
                }
                if (data.type === 'AUTH_OK') {
                        setAuthStatus('ok');
                        authStatusRef.current = 'ok';
                        setConnectionStatus('connected');
                        return;
                    }
                    if (data.type === 'AUTH_FAIL') {
                    setAuthStatus('failed');
                    authStatusRef.current = 'failed';
                    setConnectionStatus('disconnected');
                    return;
                }
                if (!connectionAuth.current.get(conn)) return;
                setLastCommand(data);
            });

            conn.on('close', () => {
                setConnectionStatus('disconnected');
                connRef.current = null;
                connectionAuth.current.delete(conn);
                const timeout = authTimeouts.current.get(conn);
                if (timeout) clearTimeout(timeout);
                authTimeouts.current.delete(conn);
                if (isHostMode) {
                    setAuthStatus('idle');
                    authStatusRef.current = 'idle';
                }
            });
            
            conn.on('error', (err: any) => {});
        });

        // --- Peer Event Handlers ---
        peer.on('disconnected', () => {
            // Automatically try to reconnect to the signaling server if not destroyed
            if (peerRef.current && !peerRef.current.destroyed) {
                // Add a small delay to avoid rapid reconnection loops
                setTimeout(() => {
                    if (peerRef.current && !peerRef.current.destroyed && peerRef.current.disconnected) {
                        peerRef.current.reconnect();
                    }
                }, 3000);
            }
        });

        peer.on('close', () => {
            setConnectionStatus('disconnected');
            setPeerId(null);
        });

        peer.on('error', (err: any) => {
            // Suppress noisy network errors
            const ignoredErrors = ['network', 'peer-unavailable', 'socket-error', 'socket-closed', 'webrtc'];
            if (ignoredErrors.includes(err.type) || (err.message && (err.message.includes('Lost connection') || err.message.includes('Could not connect')))) {
                 return; 
            }
            
            console.error("Peer Error:", err.type, err);
            
            if (err.type === 'unavailable-id') {
                // Critical: If Host ID is taken (e.g. tab duplicate or zombie session),
                // we MUST regenerate a new ID to allow this instance to work.
                if (isHostMode) {
                    console.warn("Peer ID unavailable (collision). Generating new ID...");
                    const newShortId = Math.random().toString(36).substring(2, 8).toUpperCase();
                    localStorage.setItem('waqti_host_id', newShortId);
                    
                    // Destroy current peer and retry with new ID
                    peer.destroy();
                    setTimeout(() => initializePeer(true), 500);
                }
            } else if (err.type === 'peer-unavailable') {
                setConnectionStatus('disconnected');
            }
        });

        peerRef.current = peer;
    }, []);

    // --- Connect Logic (Remote Side) ---
    const connectToHost = (peer: any, targetShortId: string, token?: string) => {
        if (!peer || peer.destroyed) return;

        setConnectionStatus('connecting');
        if (!token) {
            setAuthStatus('failed');
            authStatusRef.current = 'failed';
            setConnectionStatus('disconnected');
            return;
        }
        const targetFullId = `waqti-${targetShortId.toUpperCase()}`;

        const conn = peer.connect(targetFullId, {
            reliable: true,
            serialization: 'json'
        });

        // Set a timeout to fail if connection takes too long
        const connectionTimeout = setTimeout(() => {
            if (conn && !conn.open) {
                if (connectionStatus === 'connecting') {
                     setConnectionStatus('disconnected');
                }
            }
        }, 10000);

        conn.on('open', () => {
            clearTimeout(connectionTimeout);
            setConnectionStatus('connecting');
            connRef.current = conn;
            startHeartbeat(conn);
            if (token) {
                try {
                    conn.send({ type: 'AUTH', payload: { token }, timestamp: Date.now() });
                    setAuthStatus('pending');
                    authStatusRef.current = 'pending';
                    setTimeout(() => {
                        if (authStatusRef.current === 'pending') {
                            setAuthStatus('failed');
                            authStatusRef.current = 'failed';
                            setConnectionStatus('disconnected');
                            try { conn.close(); } catch (e) { /* ignore */ }
                        }
                    }, 8000);
                } catch (e) {
                    // ignore
                }
            }
        });

        conn.on('close', () => {
            setConnectionStatus('disconnected');
            connRef.current = null;
            if (!isHost) {
                if (authStatusRef.current === 'pending') {
                    setAuthStatus('failed');
                    authStatusRef.current = 'failed';
                } else if (authStatusRef.current !== 'failed') {
                    setAuthStatus('idle');
                    authStatusRef.current = 'idle';
                }
            }
            stopHeartbeat();
            clearTimeout(connectionTimeout);
        });

        conn.on('error', (err: any) => {
            setConnectionStatus('disconnected');
            if (!isHost) {
                setAuthStatus('failed');
                authStatusRef.current = 'failed';
            }
            clearTimeout(connectionTimeout);
        });
    };

    // --- Main Effect ---
    useEffect(() => {
        if (isInitialized.current) return; // Guard against React StrictMode
        isInitialized.current = true;

        const params = new URLSearchParams(window.location.search);
        const remoteTarget = params.get('remote');
        const remoteToken = params.get('token') || undefined;
        
        initializePeer(!remoteTarget, remoteTarget || undefined, remoteToken);

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
            connectToHost(peerRef.current, remoteId, authTokenRef.current || undefined);
        }
    };

    const sendCommand = (command: RemoteCommand) => {
        if (connRef.current && connRef.current.open) {
            try {
                connRef.current.send(command);
            } catch (e) {
                setConnectionStatus('disconnected');
            }
        } else {
            setConnectionStatus('disconnected');
        }
    };

    const resetConnection = () => {
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
                connectToHost(peerRef.current, remoteTarget, authTokenRef.current || undefined);
            } else {
                // If peer is dead, restart everything
                if (peerRef.current) peerRef.current.destroy();
                peerRef.current = null;
                initializePeer(false, remoteTarget, authTokenRef.current || undefined);
            }
        }
    };

    return (
        <RemoteContext.Provider value={{ peerId, connectionStatus, connectToPeer, sendCommand, lastCommand, isHost, authStatus, pairingToken: authToken, resetConnection }}>
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
