import { registerPlugin } from '@capacitor/core';

export const BLUETOOTH_SERVICE_UUID = '8f3a7b10-8e3d-4f4f-8a63-2b1c9f1b8a01';
export const BLUETOOTH_CHAR_UUID = '8f3a7b11-8e3d-4f4f-8a63-2b1c9f1b8a01';

export interface BluetoothRemoteStatus {
  supported: boolean;
  started: boolean;
}

export interface BluetoothRemotePlugin {
  isSupported(): Promise<{ supported: boolean }>;
  startHost(): Promise<{ started: boolean }>;
  stopHost(): Promise<{ stopped: boolean }>;
  getStatus(): Promise<BluetoothRemoteStatus>;
  addListener(eventName: 'command', listenerFunc: (event: { payload: string }) => void): Promise<{ remove: () => void }>;
}

export const BluetoothRemote = registerPlugin<BluetoothRemotePlugin>('BluetoothRemote');
