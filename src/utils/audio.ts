import { playSound, SoundType } from './sounds';

export const playNotification = (
  soundType: SoundType = 'chime',
  volume: number = 100
): void => {
  playSound(soundType, volume);
};
