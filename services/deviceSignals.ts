export type PermissionStateValue = PermissionState | 'unsupported' | 'unknown';

export interface DeviceSignalSnapshot {
  collectedAt: string;
  deviceClass: 'mobile' | 'desktop';
  online: boolean;
  geolocation: {
    supported: boolean;
    permission: PermissionStateValue;
  };
  microphone: {
    supported: boolean;
    permission: PermissionStateValue;
    deviceCount: number | null;
  };
  camera: {
    supported: boolean;
    permission: PermissionStateValue;
    deviceCount: number | null;
  };
  network: {
    effectiveType: string | null;
    downlinkMbps: number | null;
    rttMs: number | null;
    saveData: boolean | null;
  };
  battery: {
    supported: boolean;
    level: number | null;
    charging: boolean | null;
  };
}

export interface PreciseLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitudeMeters: number | null;
  headingDegrees: number | null;
  speedMps: number | null;
  capturedAt: string;
}

export interface AcousticScreeningResult {
  score: number;
  averageRms: number;
  highFrequencyRatio: number;
  samples: number;
  durationMs: number;
  processedLocally: true;
  audioStored: false;
}

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface BatteryManagerLike extends EventTarget {
  charging: boolean;
  level: number;
}

interface NavigatorWithDeviceSignals extends Navigator {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
  getBattery?: () => Promise<BatteryManagerLike>;
  userAgentData?: {
    mobile?: boolean;
  };
}

const getPermission = async (name: PermissionName): Promise<PermissionStateValue> => {
  if (!navigator.permissions?.query) return 'unsupported';

  try {
    const result = await navigator.permissions.query({ name });
    return result.state;
  } catch {
    return 'unknown';
  }
};

export const collectDeviceSignals = async (): Promise<DeviceSignalSnapshot> => {
  const deviceNavigator = navigator as NavigatorWithDeviceSignals;
  const connection =
    deviceNavigator.connection ??
    deviceNavigator.mozConnection ??
    deviceNavigator.webkitConnection;

  const mediaSupported = Boolean(navigator.mediaDevices?.getUserMedia);
  const [geoPermission, microphonePermission, cameraPermission] = await Promise.all([
    getPermission('geolocation'),
    getPermission('microphone'),
    getPermission('camera'),
  ]);

  let microphoneCount: number | null = null;
  let cameraCount: number | null = null;
  if (navigator.mediaDevices?.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      microphoneCount = devices.filter((device) => device.kind === 'audioinput').length;
      cameraCount = devices.filter((device) => device.kind === 'videoinput').length;
    } catch {
      // Device labels and counts can remain unavailable until the user grants permission.
    }
  }

  let batteryLevel: number | null = null;
  let charging: boolean | null = null;
  if (deviceNavigator.getBattery) {
    try {
      const battery = await deviceNavigator.getBattery();
      batteryLevel = Math.round(battery.level * 100);
      charging = battery.charging;
    } catch {
      // Battery Status API is intentionally optional and unsupported in many browsers.
    }
  }

  const looksMobile =
    deviceNavigator.userAgentData?.mobile ??
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  return {
    collectedAt: new Date().toISOString(),
    deviceClass: looksMobile ? 'mobile' : 'desktop',
    online: navigator.onLine,
    geolocation: {
      supported: 'geolocation' in navigator,
      permission: geoPermission,
    },
    microphone: {
      supported: mediaSupported,
      permission: microphonePermission,
      deviceCount: microphoneCount,
    },
    camera: {
      supported: mediaSupported,
      permission: cameraPermission,
      deviceCount: cameraCount,
    },
    network: {
      effectiveType: connection?.effectiveType ?? null,
      downlinkMbps: connection?.downlink ?? null,
      rttMs: connection?.rtt ?? null,
      saveData: connection?.saveData ?? null,
    },
    battery: {
      supported: Boolean(deviceNavigator.getBattery),
      level: batteryLevel,
      charging,
    },
  };
};

export const requestPreciseLocation = (): Promise<PreciseLocation> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: Math.round(coords.accuracy),
          altitudeMeters: coords.altitude,
          headingDegrees: coords.heading,
          speedMps: coords.speed,
          capturedAt: new Date(timestamp).toISOString(),
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied.',
          2: 'The device could not determine its location.',
          3: 'Location acquisition timed out.',
        };
        reject(new Error(messages[error.code] ?? 'Location acquisition failed.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      },
    );
  });

export const scanPipeAcoustics = async (
  durationMs = 5_000,
): Promise<AcousticScreeningResult> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is not supported by this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
      channelCount: 1,
    },
    video: false,
  });

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error('Local audio analysis is not supported by this browser.');
  }

  const context = new AudioContextClass();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.65;
  source.connect(analyser);

  const timeData = new Float32Array(analyser.fftSize);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  const rmsSamples: number[] = [];
  const frequencyRatios: number[] = [];
  const startedAt = performance.now();

  try {
    while (performance.now() - startedAt < durationMs) {
      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(frequencyData);

      let squaredTotal = 0;
      for (const sample of timeData) squaredTotal += sample * sample;
      rmsSamples.push(Math.sqrt(squaredTotal / timeData.length));

      const binHz = context.sampleRate / analyser.fftSize;
      const lowerBin = Math.max(1, Math.floor(1_000 / binHz));
      const upperBin = Math.min(frequencyData.length - 1, Math.ceil(8_000 / binHz));
      let totalEnergy = 0;
      let highFrequencyEnergy = 0;
      for (let index = 1; index < frequencyData.length; index += 1) {
        const energy = frequencyData[index] * frequencyData[index];
        totalEnergy += energy;
        if (index >= lowerBin && index <= upperBin) highFrequencyEnergy += energy;
      }
      frequencyRatios.push(totalEnergy > 0 ? highFrequencyEnergy / totalEnergy : 0);

      await new Promise((resolve) => window.setTimeout(resolve, 80));
    }
  } finally {
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
  }

  const averageRms =
    rmsSamples.reduce((total, sample) => total + sample, 0) / Math.max(rmsSamples.length, 1);
  const highFrequencyRatio =
    frequencyRatios.reduce((total, sample) => total + sample, 0) /
    Math.max(frequencyRatios.length, 1);

  const rmsComponent = Math.min(100, Math.max(0, ((averageRms - 0.01) / 0.08) * 100));
  const frequencyComponent = Math.min(100, Math.max(0, highFrequencyRatio * 130));
  const score = Math.round(rmsComponent * 0.55 + frequencyComponent * 0.45);

  return {
    score,
    averageRms,
    highFrequencyRatio,
    samples: rmsSamples.length,
    durationMs: Math.round(performance.now() - startedAt),
    processedLocally: true,
    audioStored: false,
  };
};
