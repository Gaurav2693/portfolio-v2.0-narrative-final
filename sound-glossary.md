# 🔊 SOUND ENGINE GLOSSARY

## Web Audio API - Procedural Sound Generation System

All sounds are generated in real-time using the Web Audio API - no audio files required. Every sound is synthesized using oscillators, noise generators, and filters.

---

## 📋 CURRENTLY IMPLEMENTED SOUNDS

### 1. **playClick()**
**Use Case:** UI button interactions, menu navigation  
**Duration:** 80ms  
**Character:** Crisp, premium, sharp click  

**Technical Specs:**
- **Generator:** White noise buffer
- **Filter:** High-pass @ 1800Hz (Q: 1.5)
- **Envelope:** Exponential decay
- **Volume Multiplier:** 0.75x
- **Frequency Range:** 1800Hz+
- **Texture:** Smooth with resonant character

**Sound Profile:** Premium UI feedback - like a mechanical keyboard switch or high-end camera shutter

---

### 2. **playLaserShot()**
**Use Case:** Shooting action (J key), weapon fire, projectile launch  
**Duration:** 150ms  
**Character:** Sci-fi laser zap, harsh synthetic sweep  

**Technical Specs:**
- **Generator:** Sawtooth oscillator + white noise
- **Filter:** Band-pass @ 1200Hz (Q: 3)
- **Frequency Sweep:** 2800Hz → 400Hz (exponential)
- **Volume Multiplier:** 1.2x (LOUD)
- **Texture:** Harsh, synthetic, sci-fi

**Sound Profile:** Classic "pew pew" laser - frequency drops from high to low creating that iconic energy weapon sound

---

### 3. **playGameAction()**
**Use Case:** Jump, slide, hurt states, restart, general game feedback  
**Duration:** 50ms  
**Character:** Sharp, crisp, snappy burst  

**Technical Specs:**
- **Generator:** White noise buffer
- **Filter:** High-pass @ 2200Hz (Q: 2)
- **Envelope:** Fast exponential decay
- **Volume Multiplier:** 1.0x
- **Attack:** Instant (0ms)

**Sound Profile:** Punchy game feedback - like a coin pickup or jump sound in classic platformers

---

### 4. **playThunder()**
**Use Case:** Lightning strikes, dramatic weather events  
**Duration:** 500ms  
**Character:** Deep rumble, low-frequency boom  

**Technical Specs:**
- **Generator:** White noise buffer
- **Filter:** Low-pass @ 1000Hz (Q: 1.5)
- **Envelope:** Smooth exponential decay (500ms)
- **Volume Multiplier:** 1.5x (VERY LOUD)
- **Frequency Range:** < 1000Hz

**Sound Profile:** Distant thunder rumble - deep, resonant, atmospheric. Perfect for weather systems.

---

### 5. **startRain()** / **stopRain()**
**Use Case:** Continuous ambient weather loop  
**Duration:** Infinite (until stopped)  
**Character:** Soft white noise, atmospheric  

**Technical Specs:**
- **Generator:** Sine oscillator + noise buffer
- **Filter:** Band-pass @ 1200Hz (Q: 3)
- **Frequency Sweep:** 200Hz → 400Hz
- **Volume Multiplier:** 0.5x
- **Fade Out:** 500ms smooth ramp when stopped

**Sound Profile:** Gentle rain ambience - creates atmospheric background texture without overwhelming gameplay

---

## 🎛️ WEB AUDIO API CAPABILITIES

Your sound engine can generate ANY of these sounds procedurally:

### **Oscillator Types** (Waveforms)
- **Sine Wave:** Pure tone, smooth, musical notes
- **Square Wave:** Retro 8-bit sounds, harsh beeps
- **Sawtooth Wave:** Aggressive, buzzy, synthetic (used in laser)
- **Triangle Wave:** Softer than square, warmer tone

### **Noise Generation**
- **White Noise:** Full frequency spectrum (used in most sounds)
- **Pink Noise:** More bass-heavy
- **Brown Noise:** Even deeper, rumbling

### **Filter Types** (Shape the sound)
- **Low-pass:** Removes high frequencies (muffled, warm)
- **High-pass:** Removes low frequencies (thin, crisp)
- **Band-pass:** Only allows middle frequencies (telephone effect)
- **Notch:** Removes specific frequency band
- **All-pass:** Phase manipulation
- **Low-shelf / High-shelf:** Boost/cut specific ranges

### **Effects & Modulation**
- **Frequency Sweeps:** Pitch changes over time (lasers, sirens)
- **Amplitude Envelopes:** ADSR (Attack, Decay, Sustain, Release)
- **LFO Modulation:** Vibrato, tremolo effects
- **Distortion:** Overdrive, clipping
- **Delay/Echo:** Time-based repetition
- **Reverb:** Spatial depth (requires convolution)

---

## 🎮 POTENTIAL GAME SOUNDS

Here are sound types you could request:

### **Player Actions**
- **Footsteps:** Short noise bursts with low-pass filter
- **Landing Impact:** Deep thump (low sine + noise)
- **Wall Slide:** Continuous mid-frequency scrape
- **Dash/Boost:** Rising frequency sweep
- **Double Jump:** Higher-pitched jump variant

### **Hazards & Environment**
- **Laser Barrier Hum:** Continuous sine wave @ 200-400Hz
- **Machinery:** Low-frequency oscillating drone
- **Steam Vent:** Band-passed white noise
- **Electrical Spark:** High-frequency crackle burst
- **Metal Collision:** Complex noise with ring-out

### **UI & Feedback**
- **Menu Navigate:** Subtle tick (shorter than click)
- **Level Complete:** Ascending arpeggio (3-4 notes)
- **Failure/Death:** Descending pitch sweep
- **Countdown Beep:** Pure sine tone bursts
- **Warning Alert:** Alternating two-tone

### **Ambient Loops**
- **Wind:** Low-passed white noise with slow LFO
- **Industrial Hum:** Multiple sine waves @ 60/120/180Hz
- **Distant Machinery:** Rhythmic low-frequency pulses
- **Ventilation:** Mid-frequency filtered noise

### **Retro/Arcade**
- **Coin Pickup:** Fast ascending arpeggios
- **Power-Up:** Major chord sweep upward
- **Extra Life:** Jingle-like tone sequence
- **High Score:** Celebration melody

---

## 🔧 SOUND PARAMETERS YOU CAN CUSTOMIZE

For any sound, you can specify:

1. **Duration:** 10ms to infinite
2. **Frequency Range:** 20Hz to 20,000Hz
3. **Filter Type & Cutoff:** Any of the 7 filter types
4. **Volume Envelope:** Attack/Decay/Sustain/Release curves
5. **Waveform:** Sine/Square/Sawtooth/Triangle
6. **Pitch Modulation:** Sweeps, vibrato, glides
7. **Texture:** Pure tones vs. noisy vs. mixed

---

## 💡 USAGE NOTES

**Performance:** All sounds are lightweight and generated on-the-fly. No asset loading required.

**Browser Compatibility:** Web Audio API is supported in all modern browsers.

**Volume Control:** All sounds respect global `volume` setting (0.0 to 1.0) and can be toggled off via `soundEnabled`.

**Memory:** Each sound creates a new AudioContext that auto-closes after playback.

---

## 🎨 SOUND DESIGN PHILOSOPHY

Your current sound palette follows these principles:

1. **Industrial/Mechanical:** High-pass filters, sharp attacks
2. **Minimal/Functional:** No music, only essential feedback
3. **Sci-fi Character:** Synthetic waveforms, frequency sweeps
4. **Clarity:** Crisp transients, no reverb/echo
5. **Premium Feel:** Smooth envelopes, resonant filters

---

## 📝 REQUESTING NEW SOUNDS

To add a new sound, specify:

- **Purpose:** What triggers it?
- **Duration:** How long should it last?
- **Character:** Soft/harsh, low/high, smooth/crunchy?
- **Reference:** "Like a [X]" or describe the feeling
- **Integration:** One-shot or looping?

Example: *"I need a power-up sound - something ascending, bright, celebratory, about 300ms long"*

---

**Sound Engine Version:** Web Audio API (Procedural Synthesis)  
**Total Implemented Sounds:** 5 (Click, Laser, Action, Thunder, Rain)  
**Potential Sounds:** Infinite (limited only by creativity)
