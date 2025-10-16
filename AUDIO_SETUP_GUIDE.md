# 🎵 Ambient Sounds Audio Setup Guide

## ⚡ Quick Status

**Current Status**: ✅ **Fully working with high-quality synthesized sounds!**

The app is production-ready and sounds great using Web Audio API synthesis. This guide is for users who want to optionally upgrade to recorded audio files.

---

## 🎯 Do You Need This?

### ✅ Synthesized Sounds (Current - Default)
- ✅ **Works out of the box**
- ✅ **No files needed**
- ✅ **Professional quality**
- ✅ **Perfect for white/pink/brown noise**
- ✅ **Small bundle size**
- ⚠️ Nature sounds are simulated (but still good!)

### 🎵 Real Audio Files (Optional Upgrade)
- ✅ **Authentic recorded sounds**
- ✅ **Better for nature/ambient**
- ⚠️ Requires downloading files (~10-15MB)
- ⚠️ Requires file hosting
- ✅ Automatic fallback to synthesis if files unavailable

**Recommendation**: The default synthesized sounds are excellent for most users. Only upgrade if you want authentic nature recordings.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Directory
```bash
mkdir -p public/sounds
```

### Step 2: Download Some Sounds

Go to **Pixabay** (no account needed, free license):

1. **Rain**: https://pixabay.com/sound-effects/search/rain%20loop/
   - Download any "rain loop" MP3
   - Save as `public/sounds/rain.mp3`

2. **Ocean**: https://pixabay.com/sound-effects/search/ocean%20waves%20loop/
   - Download any "ocean waves" MP3
   - Save as `public/sounds/ocean.mp3`

3. **Forest**: https://pixabay.com/sound-effects/search/forest%20birds%20loop/
   - Download any "forest" MP3
   - Save as `public/sounds/forest.mp3`

### Step 3: Enable in Code

Edit `src/data/audioFiles.ts`:

```typescript
rain: {
  url: '/sounds/rain.mp3', // <-- Uncomment this line
  duration: 30
},
ocean: {
  url: '/sounds/ocean.mp3', // <-- Uncomment this line
  duration: 30
},
```

That's it! Rebuild and test:
```bash
npm run build
npm run dev
```

---

## 📚 Free Sound Sources

### 1. 🥇 Pixabay (Best for Quick Start)
- **URL**: https://pixabay.com/sound-effects/
- **License**: Free, no attribution, commercial use OK
- **Quality**: High (MP3, 128-320kbps)
- **Account**: Not required
- **Best for**: Everything
- **Direct Search**:
  - [Rain Loops](https://pixabay.com/sound-effects/search/rain%20loop/)
  - [Ocean Waves](https://pixabay.com/sound-effects/search/ocean%20waves%20loop/)
  - [Forest](https://pixabay.com/sound-effects/search/forest%20ambience/)
  - [Coffee Shop](https://pixabay.com/sound-effects/search/cafe%20ambience/)
  - [White Noise](https://pixabay.com/sound-effects/search/white%20noise/)

### 2. 🏆 Freesound
- **URL**: https://freesound.org/
- **License**: Various Creative Commons (check each sound)
- **Quality**: Very high (WAV, FLAC, MP3)
- **Account**: Free registration required
- **Best for**: High-quality nature sounds

### 3. 🎸 Mixkit
- **URL**: https://mixkit.co/free-sound-effects/
- **License**: Free license
- **Quality**: High
- **Account**: Not required
- **Best for**: Urban, workspace sounds

---

## 🎧 Recommended Sounds by Category

### Nature (Priority)
1. **Rain** - Search: "gentle rain loop" or "rain ambience"
2. **Ocean Waves** - Search: "ocean waves loop" or "sea ambience"
3. **Forest** - Search: "forest birds loop" or "nature ambience"

### Meditation (Synthesis Works Great!)
- ⭐ **White/Pink/Brown Noise**: Synthesis is perfect, no need for files!
- Tibetan Bowl: Optional upgrade
- Om Chant: Optional upgrade

### Workspace (Nice to Have)
- Coffee Shop: Search "cafe ambience loop"
- Keyboard Typing: Search "keyboard typing loop"
- Fan: Synthesis works well

---

## 💾 File Requirements

### Format
- **Type**: MP3 (best browser compatibility)
- **Bitrate**: 128kbps (good quality, ~480KB per 30s)
- **Bitrate**: 192kbps (better quality, ~720KB per 30s)
- **Sample Rate**: 44.1kHz
- **Channels**: Mono or Stereo

### Duration
- **Minimum**: 20 seconds
- **Recommended**: 30-60 seconds
- **Must**: Loop seamlessly (fade in/out recommended)

### File Sizes (30-second loop)
| Bitrate | File Size | Quality | Recommendation |
|---------|-----------|---------|----------------|
| 64kbps  | ~240KB   | Low     | ❌ Too compressed |
| 128kbps | ~480KB   | Good    | ✅ **Recommended** |
| 192kbps | ~720KB   | Better  | ✅ For key sounds |
| 320kbps | ~1.2MB   | Best    | ⚠️ Overkill |

**Total for all 27 sounds @ 128kbps**: ~10-13MB

---

## 🔧 Optional: Create Seamless Loops

If your downloaded sound has clicks or gaps at the loop point:

### Using Audacity (Free)
1. Open sound file
2. Select last 0.5 seconds
3. Effect → Fade Out
4. Select first 0.5 seconds
5. Effect → Fade In
6. File → Export → Export as MP3 (128kbps)

### Using FFmpeg (Command line)
```bash
# Add crossfade for seamless loop
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=0.5,afade=t=out:st=29.5:d=0.5" output.mp3
```

---

## 📂 File Organization

```
your-project/
  public/
    sounds/
      # Nature
      rain.mp3
      ocean.mp3
      forest.mp3
      river.mp3
      birds.mp3
      crickets.mp3
      wind.mp3
      
      # Weather
      thunderstorm.mp3
      heavyrain.mp3
      snow.mp3
      
      # Urban
      city.mp3
      traffic.mp3
      subway.mp3
      
      # Workspace
      coffeeshop.mp3
      keyboard.mp3
      library.mp3
      office.mp3
      fan.mp3
      
      # Travel
      airplane.mp3
      train.mp3
      boat.mp3
      
      # Meditation (optional - synthesis is great!)
      whitenoise.mp3
      pinknoise.mp3
      brownnoise.mp3
      tibetan.mp3
      om.mp3
      binaural.mp3
```

---

## 🎨 Partial Implementation (Recommended)

You don't need all 27 sounds! Start with the most important:

### Essential 5 (Top Priority)
1. ☔ Rain
2. 🌊 Ocean
3. 🌲 Forest
4. ☕ Coffee Shop
5. ⚪ White Noise (synthesis works great!)

### Nice to Have 5 (Medium Priority)
6. 🌧️ Heavy Rain
7. 🐦 Birds
8. ⌨️ Keyboard
9. ✈️ Airplane
10. 🟣 Pink Noise (synthesis works great!)

### Optional Rest (Low Priority)
- Everything else
- Synthesis fallback works perfectly for these

---

## 🔍 Search Tips

### Pixabay Search Terms
- "rain ambient loop"
- "ocean waves seamless"
- "forest birds loop"
- "cafe ambience background"
- "typing keyboard mechanical"
- "white noise pure"

### Freesound Search Terms
- "rain loop" + tag:loop
- "ocean loop" + tag:seamless
- "forest ambience" + tag:loop

### Quality Indicators
- ✅ "Loop" or "Seamless" in title
- ✅ Duration: 30s - 2min
- ✅ File size: 500KB - 2MB
- ✅ Comments mention "loops well"
- ❌ Avoid: "sound effect" (too short)
- ❌ Avoid: "one shot" (doesn't loop)

---

## 🐛 Troubleshooting

### Sound doesn't play
1. Check file exists: `public/sounds/rain.mp3`
2. Check filename matches code: `rain.mp3` (case-sensitive)
3. Check URL is uncommented in `audioFiles.ts`
4. Rebuild: `npm run build`
5. Clear browser cache
6. Check console for errors

### Sound clips/pops at loop
- Add fade in/out (0.5s each)
- Ensure file is constant bitrate (CBR)
- Try shorter loop duration

### Slow loading
- Reduce bitrate to 128kbps
- Compress files
- Enable preloading (already implemented)

### File not found 404
- Files must be in `public/` directory
- Path starts with `/sounds/` not `public/sounds/`
- Filename is case-sensitive

---

## 📝 Example: Complete Setup

```bash
# 1. Create directory
mkdir -p public/sounds

# 2. Download from Pixabay (example URLs)
# Go to Pixabay and download these searches:
# - "rain ambient loop" → save as rain.mp3
# - "ocean waves loop" → save as ocean.mp3
# - "forest birds" → save as forest.mp3

# 3. Move files
mv ~/Downloads/rain.mp3 public/sounds/
mv ~/Downloads/ocean.mp3 public/sounds/
mv ~/Downloads/forest.mp3 public/sounds/

# 4. Edit audioFiles.ts
# Uncomment the url lines for rain, ocean, forest

# 5. Test
npm run dev
```

---

## ✅ Verification Checklist

Before deploying:
- [ ] Downloaded desired sound files
- [ ] Converted to MP3 at 128kbps
- [ ] Tested loop seamlessly
- [ ] Files in `public/sounds/` directory
- [ ] URLs uncommented in `audioFiles.ts`
- [ ] Built project successfully
- [ ] Tested sounds in browser
- [ ] Verified fallback to synthesis for missing files
- [ ] Checked browser console for errors
- [ ] Tested on mobile (optional)

---

## 🎯 Summary

### Current Status (Out of Box)
✅ **27 synthesized sounds**  
✅ **Professional quality**  
✅ **Zero setup required**  
✅ **Production ready**

### After Adding Audio Files
✅ **Authentic recorded sounds**  
✅ **Better nature ambience**  
✅ **Automatic fallback**  
✅ **Professional experience**

### Time Investment
- **Minimal**: 3 files in 10 minutes (rain, ocean, forest)
- **Recommended**: 10 files in 30 minutes (add workspace sounds)
- **Complete**: 27 files in 1-2 hours (all categories)

---

## 💡 Pro Tips

1. **Start small**: Add just rain, ocean, forest first
2. **Synthesis is great**: White/pink/brown noise don't need files
3. **Use presets**: Focus on sounds used in presets (Deep Focus, Relaxation, etc.)
4. **Test loops**: Play for 2-3 minutes to ensure seamless looping
5. **Browser cache**: Clear cache when testing new files
6. **Mobile friendly**: Keep total under 15MB for mobile users

---

## 📞 Support

If you have issues:
1. Check browser console for error messages
2. Verify files are in correct location
3. The app ALWAYS works - it falls back to synthesis
4. See `src/utils/ambientAudioV2.ts` for audio engine code

---

## 🎉 Conclusion

**The app works perfectly right now with synthesized sounds!**

Adding real audio files is an **optional cosmetic upgrade** for users who want authentic nature recordings. The synthesis fallback ensures the app always works, even with missing files.

**Recommended approach**: Start with 3-5 key sounds, see if you like the difference, then expand if desired.

Happy focusing! 🍅
