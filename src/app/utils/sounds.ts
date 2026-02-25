/**
 * Global sound utility for mouse click interactions
 * Generates procedural audio that mimics physical mouse clicks
 */

/**
 * Mouse click sound - realistic physical mouse button press
 */
export const playSpaceClick = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create noise buffer for click sound
    const bufferSize = audioContext.sampleRate * 0.05; // 50ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise with exponential decay
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.15)); // Fast decay
      data[i] = (Math.random() * 2 - 1) * decay * 0.3;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    // High-pass filter to make it sound more "clicky"
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + 0.05);
    
    // Clean up after sound finishes
    setTimeout(() => {
      audioContext.close();
    }, 60);
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};

/**
 * Mouse hover sound - subtle tick
 */
export const playSpaceHover = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create very short noise burst
    const bufferSize = audioContext.sampleRate * 0.02; // 20ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.1));
      data[i] = (Math.random() * 2 - 1) * decay * 0.15;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + 0.02);
    
    setTimeout(() => {
      audioContext.close();
    }, 30);
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};

/**
 * Mouse double-click sound
 */
export const playSpaceConfirm = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create noise buffer
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.15));
      data[i] = (Math.random() * 2 - 1) * decay * 0.3;
    }
    
    // First click
    const noiseSource1 = audioContext.createBufferSource();
    noiseSource1.buffer = buffer;
    
    const filter1 = audioContext.createBiquadFilter();
    filter1.type = 'highpass';
    filter1.frequency.value = 2000;
    
    const gainNode1 = audioContext.createGain();
    gainNode1.gain.value = 0.25;
    
    noiseSource1.connect(filter1);
    filter1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    noiseSource1.start(audioContext.currentTime);
    noiseSource1.stop(audioContext.currentTime + 0.05);
    
    // Second click (delayed)
    const noiseSource2 = audioContext.createBufferSource();
    noiseSource2.buffer = buffer;
    
    const filter2 = audioContext.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 2000;
    
    const gainNode2 = audioContext.createGain();
    gainNode2.gain.value = 0.25;
    
    noiseSource2.connect(filter2);
    filter2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    noiseSource2.start(audioContext.currentTime + 0.1);
    noiseSource2.stop(audioContext.currentTime + 0.15);
    
    setTimeout(() => {
      audioContext.close();
    }, 160);
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};