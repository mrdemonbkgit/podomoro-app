# 🎵 Ambient Sounds Audio Setup Guide

This guide explains how to set up high-quality audio files for the Pomodoro timer's ambient sounds feature.

## 📋 Overview

The app currently uses placeholder URLs for audio files. To get the best sound quality, you need to:
1. Download high-quality sounds from free sources
2. Convert them to web-optimized formats
3. Host them on your server or CDN
4. Update the URLs in the code

---

## 🌐 Free Sound Sources

### 1. **Pixabay** (Recommended)
- **URL**: https://pixabay.com/sound-effects/
- **License**: Free for commercial use, no attribution required
- **Quality**: High (MP3, 192kbps+)
- **Best for**: Nature sounds, ambient noise

### 2. **Freesound**
- **URL**: https://freesound.org/
- **License**: Creative Commons (check individual sounds)
- **Quality**: Very high (WAV, FLAC available)
- **Best for**: All categories

### 3. **Mixkit**
- **URL**: https://mixkit.co/free-sound-effects/
- **License**: Free license
- **Quality**: High (MP3)
- **Best for**: Urban sounds, workspace ambience

### 4. **Zapsplat**
- **URL**: https://www.zapsplat.com/
- **License**: Free with attribution
- **Quality**: Very high
- **Best for**: All categories

---

## 🎧 Sound Requirements by Category

### Nature (7 sounds)
- **Rain**: Gentle, continuous rain (30-60s loop)
- **Ocean Waves**: Rhythmic waves (30-60s loop)
- **Forest**: Birds + rustling leaves (60s+ loop)
- **River Stream**: Flowing water (30-60s loop)
- **Birds Chirping**: Morning birds (30s loop)
- **Crickets**: Night crickets (20-30s loop)
- **Wind**: Gentle breeze (30s loop)

### Weather (3 sounds)
- **Thunderstorm**: Rain + distant thunder (30-60s loop)
- **Heavy Rain**: Intense rainfall (30s loop)
- **Snowfall**: Soft ambience (30s loop)

### Urban (3 sounds)
- **City Ambience**: Distant traffic + people (60s loop)
- **Traffic**: Road traffic hum (30s loop)
- **Subway**: Underground train (30s loop)

### Workspace (5 sounds)
- **Coffee Shop**: Café ambience (60s+ loop)
- **Typing**: Mechanical keyboard (10-20s loop)
- **Library**: Quiet study space (60s loop)
- **Office**: Productive office buzz (60s loop)
- **Fan**: White noise fan (30s loop)

### Travel (3 sounds)
- **Airplane Cabin**: Jet engine white noise (30s loop)
- **Train**: Train journey ambience (30s loop)
- **Boat**: Sailing/water ambience (30s loop)

### Meditation (6 sounds)
- **White Noise**: Pure white noise (30s loop)
- **Pink Noise**: Calming pink noise (30s loop)
- **Brown Noise**: Deep brown noise (30s loop)
- **Tibetan Bowl**: Singing bowl resonance (10-15s)
- **Om Chant**: Sacred om sound (20-30s loop)
- **Binaural Beats**: Focus-enhancing beats (30s loop)

---

## 🔧 Audio Processing

### Recommended Specifications
- **Format**: MP3 (for broad browser support)
- **Bitrate**: 128kbps (good quality, small file size) or 192kbps (better quality)
- **Sample Rate**: 44.1kHz
- **Channels**: Stereo (for spatial sounds) or Mono (for white noise)
- **Duration**: 20-60 seconds (should loop seamlessly)

### Tools for Conversion

#### Audacity (Free, Cross-platform)
1. Download: https://www.audacityteam.org/
2. Open audio file
3. Trim to desired length
4. File → Export → Export as MP3
5. Set quality to 128 or 192 kbps

#### FFmpeg (Command line)
```bash
# Convert to MP3 (128kbps)
ffmpeg -i input.wav -b:a 128k output.mp3

# Create seamless loop (fade in/out)
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=1,afade=t=out:st=29:d=1" output-loop.mp3
```

#### Online Converter
- https://online-audio-converter.com/
- Select MP3, set bitrate to 128kbps
- Download converted file

---

## 📦 Hosting Options

### Option 1: Self-Hosted (Recommended)
1. Create `public/sounds/` directory in your project
2. Place all MP3 files there:
   ```
   public/
     sounds/
       rain.mp3
       ocean.mp3
       forest.mp3
       ...
   ```
3. Update URLs in `src/data/audioFiles.ts`:
   ```typescript
   rain: {
     url: '/sounds/rain.mp3',
     duration: 30
   }
   ```

### Option 2: CDN (For Production)
1. Upload files to:
   - **Cloudflare R2**: Free tier available
   - **AWS S3**: Pay as you go
   - **Vercel Blob**: Integrated with Vercel deployment
   - **GitHub Pages**: Free for public repos

2. Update URLs with CDN path:
   ```typescript
   rain: {
     url: 'https://your-cdn.com/sounds/rain.mp3',
     duration: 30
   }
   ```

### Option 3: Pixabay Direct Links (Quick Start)
- Pixabay allows direct linking to their audio files
- No download/hosting needed
- May have rate limits
- Example in `audioFiles.ts` already provided

---

## 🚀 Quick Start Guide

### Step 1: Download Sounds
For each category, visit Pixabay or Freesound and search for:
- Search term: "rain ambient loop"
- Filter: Loop, Royalty-free
- Download MP3 format

### Step 2: Organize Files
```
your-project/
  public/
    sounds/
      nature/
        rain.mp3
        ocean.mp3
        ...
      workspace/
        coffeeshop.mp3
        keyboard.mp3
        ...
```

### Step 3: Update Configuration
Edit `src/data/audioFiles.ts`:
```typescript
export const AUDIO_FILES: Record<string, AudioFile> = {
  rain: {
    url: '/sounds/nature/rain.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  // ... update all 27 sounds
};
```

### Step 4: Test
```bash
npm run dev
```
Open ambient sounds panel and test each sound.

---

## 🎨 Creating Seamless Loops

For best user experience, sounds should loop without audible clicks or gaps.

### Using Audacity:
1. Open your sound file
2. Select a portion that loops well (usually after intro/outro)
3. Effect → Fade In (0.5s at start)
4. Effect → Fade Out (0.5s at end)
5. Generate → Silence (add 0.1s at end if needed)
6. Export as MP3

### Using Online Tool:
- https://www.lalal.ai/
- https://www.duckduckgo.com/?q=seamless+audio+loop+online

---

## 📊 File Size Reference

Example file sizes for 30-second loops:

| Bitrate | File Size | Quality | Recommendation |
|---------|-----------|---------|----------------|
| 64kbps  | ~240KB   | Low     | Not recommended |
| 128kbps | ~480KB   | Good    | ✅ Recommended |
| 192kbps | ~720KB   | Better  | For high-quality sounds |
| 320kbps | ~1.2MB   | Best    | Overkill for ambient |

**Total size for all 27 sounds @ 128kbps**: ~13MB

---

## 🔍 Recommended Sound Keywords

When searching on Pixabay/Freesound:

- **Rain**: "rain loop", "rainfall ambient", "gentle rain"
- **Ocean**: "ocean waves loop", "sea ambience", "beach waves"
- **Forest**: "forest ambience", "birds chirping", "nature sounds"
- **Coffee Shop**: "cafe ambience", "restaurant background", "chatter"
- **White Noise**: "white noise loop", "static noise"
- **Typing**: "keyboard typing", "mechanical keyboard", "typing sound"

---

## ⚙️ Advanced: Dynamic Loading

For better performance, implement lazy loading:

```typescript
// Only load sounds when needed
const preloadOnDemand = async (soundId: string) => {
  if (!isPreloaded(soundId)) {
    await ambientAudioEngineV2.preloadAudio(soundId);
  }
};
```

---

## 🐛 Troubleshooting

### Sound won't play
- Check browser console for errors
- Verify file URL is accessible
- Check file format (must be MP3)
- Test in incognito mode (cache issue)

### Sound clips/pops at loop point
- Add fade in/out (0.5s each)
- Ensure file is exported as constant bitrate (CBR)
- Check for silence at end of file

### Slow loading
- Reduce bitrate to 128kbps
- Implement preloading
- Use CDN for faster delivery

---

## 📝 License Compliance

Always check the license for each sound you download:

- **Pixabay License**: Free, no attribution required
- **CC0 (Public Domain)**: Free, no restrictions
- **CC-BY**: Free, attribution required
- **CC-BY-SA**: Free, attribution + share-alike required

Include attribution in your app if required:
```typescript
// In audioFiles.ts
license: 'Sound by Artist Name from Freesound.org (CC-BY)'
```

---

## ✅ Checklist

Before deploying:
- [ ] Downloaded all 27 sounds
- [ ] Converted to MP3 at 128kbps or 192kbps
- [ ] Tested seamless looping
- [ ] Hosted on server or CDN
- [ ] Updated URLs in `audioFiles.ts`
- [ ] Tested all sounds in browser
- [ ] Verified licenses and attribution
- [ ] Optimized file sizes
- [ ] Implemented preloading (optional)
- [ ] Added loading states (optional)

---

## 🎉 Result

After setup, you'll have:
- ✅ High-quality ambient sounds
- ✅ Seamless looping
- ✅ Fast loading with preloading
- ✅ Professional audio experience
- ✅ 27 unique sounds across 6 categories

Enjoy your premium Pomodoro timer! 🍅

