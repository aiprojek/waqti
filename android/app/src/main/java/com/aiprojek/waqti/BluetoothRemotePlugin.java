package com.aiprojek.waqti;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.ParcelUuid;

import com.getcapacitor.JSObject;
import com.getcapacitor.Permission;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PermissionCallback;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@CapacitorPlugin(
    name = "BluetoothRemote",
    permissions = {
        @Permission(strings = {
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_ADVERTISE
        }, alias = "bluetooth"),
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location")
    }
)
public class BluetoothRemotePlugin extends Plugin {

    private static final UUID SERVICE_UUID = UUID.fromString("8f3a7b10-8e3d-4f4f-8a63-2b1c9f1b8a01");
    private static final UUID CHAR_UUID = UUID.fromString("8f3a7b11-8e3d-4f4f-8a63-2b1c9f1b8a01");

    private BluetoothManager bluetoothManager;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothLeAdvertiser advertiser;
    private BluetoothGattServer gattServer;
    private AdvertiseCallback advertiseCallback;
    private boolean isStarted = false;

    @Override
    public void load() {
        Context context = getContext();
        bluetoothManager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
            if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
                advertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
            }
        }
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        boolean supported = bluetoothAdapter != null &&
            getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);
        JSObject ret = new JSObject();
        ret.put("supported", supported);
        call.resolve(ret);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("supported", bluetoothAdapter != null && getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE));
        ret.put("started", isStarted);
        call.resolve(ret);
    }

    @PluginMethod
    public void startHost(PluginCall call) {
        if (isStarted) {
            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
            return;
        }

        if (!hasBluetoothSupport()) {
            call.reject("Bluetooth LE not supported or adapter disabled");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth", call, "permissionsCallback");
                return;
            }
        } else {
            if (getPermissionState("location") != PermissionState.GRANTED) {
                requestPermissionForAlias("location", call, "permissionsCallback");
                return;
            }
        }

        startHostInternal(call);
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
                call.reject("Bluetooth permission denied");
                return;
            }
        } else {
            if (getPermissionState("location") != PermissionState.GRANTED) {
                call.reject("Location permission denied");
                return;
            }
        }

        startHostInternal(call);
    }

    private boolean hasBluetoothSupport() {
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled() &&
            getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);
    }

    private void startHostInternal(PluginCall call) {
        try {
            advertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
            if (advertiser == null) {
                call.reject("BLE advertising not supported on this device");
                return;
            }
            gattServer = bluetoothManager.openGattServer(getContext(), gattServerCallback);
            if (gattServer == null) {
                call.reject("Failed to open GATT server");
                return;
            }

            BluetoothGattService service = new BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY);
            BluetoothGattCharacteristic characteristic = new BluetoothGattCharacteristic(
                CHAR_UUID,
                BluetoothGattCharacteristic.PROPERTY_WRITE | BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
                BluetoothGattCharacteristic.PERMISSION_WRITE
            );
            service.addCharacteristic(characteristic);
            gattServer.addService(service);

            AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
                .setConnectable(true)
                .build();

            AdvertiseData data = new AdvertiseData.Builder()
                .setIncludeDeviceName(true)
                .addServiceUuid(new ParcelUuid(SERVICE_UUID))
                .build();

            advertiseCallback = new AdvertiseCallback() {};
            advertiser.startAdvertising(settings, data, advertiseCallback);

            isStarted = true;

            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start BLE host", e);
        }
    }

    @PluginMethod
    public void stopHost(PluginCall call) {
        try {
            if (advertiser != null && advertiseCallback != null) {
                advertiser.stopAdvertising(advertiseCallback);
            }
            if (gattServer != null) {
                gattServer.close();
                gattServer = null;
            }
            isStarted = false;
            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop BLE host", e);
        }
    }

    private final BluetoothGattServerCallback gattServerCallback = new BluetoothGattServerCallback() {
        @Override
        public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId, BluetoothGattCharacteristic characteristic,
                                                 boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
            if (CHAR_UUID.equals(characteristic.getUuid())) {
                String payload = new String(value, StandardCharsets.UTF_8);
                JSObject data = new JSObject();
                data.put("payload", payload);
                notifyListeners("command", data);
            }
            if (gattServer != null && responseNeeded) {
                gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value);
            }
        }

        @Override
        public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
            super.onConnectionStateChange(device, status, newState);
        }

        @Override
        public void onServiceAdded(int status, BluetoothGattService service) {
            super.onServiceAdded(status, service);
        }
    };
}
