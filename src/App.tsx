/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';

// Sample assets
import sampleCarpetIsfahan from './assets/images/carpet_isfahan_1790433637660.jpg';
import sampleCarpetTabriz from './assets/images/carpet_tabriz_1790433647909.jpg';
import sampleRoomLiving from './assets/images/room_living_1790433657944.jpg';
import sampleRoomClassic from './assets/images/room_classic_1790433667069.jpg';

export default function App() {
  const [screen, setScreen] = useState<'HOME' | 'EDITOR'>('HOME');

  const [carpetImage, setCarpetImage] = useState<HTMLImageElement | null>(null);
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);

  const [carpetName, setCarpetName] = useState<string>('فرش ابریشم اصفهان');
  const [roomName, setRoomName] = useState<string>('سالن پذیرایی کف پارکت');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);

  // Helper to load image element from URL or DataURI
  const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  // Pre-load default samples on mount
  useEffect(() => {
    loadImageElement(sampleCarpetIsfahan).then((img) => setCarpetImage(img));
    loadImageElement(sampleRoomLiving).then((img) => setRoomImage(img));
  }, []);

  const handlePickCarpetFile = (file: File) => {
    const url = URL.createObjectURL(file);
    loadImageElement(url).then((img) => {
      setCarpetImage(img);
      setCarpetName(file.name);
    });
  };

  const handlePickRoomFile = (file: File) => {
    const url = URL.createObjectURL(file);
    loadImageElement(url).then((img) => {
      setRoomImage(img);
      setRoomName(file.name);
    });
  };

  const handleSelectPresetCarpet = (id: string) => {
    const src = id === 'tabriz' ? sampleCarpetTabriz : sampleCarpetIsfahan;
    const name = id === 'tabriz' ? 'فرش سنتی تبریز' : 'فرش ابریشم اصفهان';
    loadImageElement(src).then((img) => {
      setCarpetImage(img);
      setCarpetName(name);
    });
  };

  const handleSelectPresetRoom = (id: string) => {
    const src = id === 'classic' ? sampleRoomClassic : sampleRoomLiving;
    const name = id === 'classic' ? 'نشیمن کف سنگ مرمر' : 'سالن پذیرایی کف پارکت';
    loadImageElement(src).then((img) => {
      setRoomImage(img);
      setRoomName(name);
    });
  };

  const handleCameraCapture = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    loadImageElement(url).then((img) => {
      setCarpetImage(img);
      setCarpetName('عکس گرفته‌شده با دوربین');
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans antialiased text-stone-100 select-none">
      {screen === 'HOME' ? (
        <HomeScreen
          carpetImage={carpetImage}
          roomImage={roomImage}
          carpetName={carpetName}
          roomName={roomName}
          onPickCarpetFile={handlePickCarpetFile}
          onOpenCarpetCamera={() => setIsCameraOpen(true)}
          onPickRoomFile={handlePickRoomFile}
          onSelectPresetCarpet={handleSelectPresetCarpet}
          onSelectPresetRoom={handleSelectPresetRoom}
          onStartStaging={() => setScreen('EDITOR')}
          onOpenAndroidProject={() => setIsAndroidProjectOpen(true)}
        />
      ) : (
        roomImage &&
        carpetImage && (
          <EditorScreen
            roomImage={roomImage}
            initialCarpetImage={carpetImage}
            onNavigateHome={() => setScreen('HOME')}
          />
        )
      )}

      {isCameraOpen && (
        <CameraCaptureModal
          title="عکاسی مستقیم از فرش با دوربین"
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {isAndroidProjectOpen && (
        <AndroidProjectModal onClose={() => setIsAndroidProjectOpen(false)} />
      )}
    </div>
  );
}
