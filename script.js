

        // Global audio management
        let currentMainAudio = null;
        let isMainRadioPlaying = false;

        // Enhanced station database with audio files
        const stations = [
            {
                freq: '88.5 FM',
                name: 'Salem - On Air',
                track: 'Leadership & Love',
                artist: 'Voices from Zayed’s Legacy',
                album: 'Salem - On Air • 2025',
                genre: 'Leadership',
                signal: 'strong',
                mode: 'STEREO',
                spectrumPattern: 'smooth',
                audioFile: 'audio/salem.mp3'
            },
            {
                freq: '92.3 FM',
                name: 'Verses Reimagined',
                track: 'Beyond the Self',
                artist: 'Verses Reimagined',
                album: 'Echoes of Iqbal • 2025',
                genre: 'Verses',
                signal: 'strong',
                mode: 'STEREO',
                spectrumPattern: 'wave',
                audioFile: 'audio/iqra.mp3'
            },
            {
                freq: '97.8 FM',
                name: 'Radio Cairo',
                track: "Waiting for Love",
                artist: 'Love Songs',
                album: 'Cairo Radio • 2025',
                genre: 'Classic Rock',
                signal: 'medium',
                mode: 'STEREO',
                spectrumPattern: 'aggressive',
                audioFile: 'audio/naz1.mp3'
            },
            {
                freq: '101.5 FM',
                name: 'Radio Istanbul Nights',
                track: 'Your Heart\'s Choice',
                artist: 'The Love Collective',
                album: 'Words of Mevlana • 2025',
                genre: 'Heartfelt',
                signal: 'strong',
                mode: 'HD STEREO',
                spectrumPattern: 'dynamic',
                audioFile: 'audio/naz1.mp3' // Default, will be changed based on choice
            }
        ];

        let userLoveChoice = null; // Store the user's choice

        let currentStationIndex = 0;// Start with preset 3 (index 2
        let isScanning = false;
        let scanInterval;
        let knobRotation = 0;
        let homeKnobRotation = 0; // Track home section knob rotation
        let stationOffset = 0; 

        // Audio management functions
        function stopAllAudio() {
            console.log('🔇 Stopping all audio...');
            
            // Stop main radio audio
            if (currentMainAudio) {
                currentMainAudio.pause();
                currentMainAudio.currentTime = 0;
                console.log('✅ Stopped main radio audio');
            }
            
            // Stop all station audio elements
            document.querySelectorAll('#home audio').forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            
            // Stop Love Radio audio elements
            document.querySelectorAll('#ideation audio').forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            
            // Stop team player audio
            document.querySelectorAll('#team audio').forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            
            isMainRadioPlaying = false;
            updatePlayButtonState(false);
        }

        function testAudioFile(filename) {
            console.log(`🧪 Testing audio file: ${filename}`);
            const testAudio = new Audio(filename);
            
            testAudio.addEventListener('loadstart', () => console.log(`📥 Started loading: ${filename}`));
            testAudio.addEventListener('canplay', () => console.log(`✅ Can play: ${filename}`));
            testAudio.addEventListener('error', (e) => {
                console.error(`❌ Error loading ${filename}:`, e);
                console.error('Error details:', testAudio.error);
            });
            
            testAudio.load();
            return testAudio;
        }

        function playStationAudio(stationIndex) {
            console.log(`🎵 Attempting to play station ${stationIndex}`);
            stopAllAudio(); // Stop any currently playing audio
            
            const station = stations[stationIndex];
            if (!station || !station.audioFile) {
                console.error(`❌ No station or audio file for index ${stationIndex}`);
                return;
            }
            
            console.log(`🎶 Playing: ${station.audioFile} for ${station.name}`);
            
            // Try to find an audio element with this source
            const audioElement = document.getElementById(`station-audio-${stationIndex}`);
            
            if (audioElement) {
                console.log(`📻 Using existing audio element: station-audio-${stationIndex}`);
                currentMainAudio = audioElement;
                currentMainAudio.volume = 0.7;
                
                // Add error handling
                currentMainAudio.addEventListener('error', (e) => {
                    console.error(`❌ Audio element error:`, e);
                    console.error('Error details:', currentMainAudio.error);
                });
                
                currentMainAudio.play().then(() => {
                    console.log('✅ Audio started playing successfully!');
                    isMainRadioPlaying = true;
                    updatePlayButtonState(true);
                }).catch(e => {
                    console.error('❌ Audio play failed:', e);
                    // Try alternative approach
                    playStationAudioDirect(station.audioFile);
                });
            } else {
                console.log('🔄 No existing element found, creating new audio');
                // Fallback: create new audio element
                playStationAudioDirect(station.audioFile);
            }
        }

        /* ───────── NEW ───────── */
function playStationAudioDirect(audioFile) {
    console.log(`🎵 Playing directly: ${audioFile}`);
    const audio = new Audio(audioFile);
    audio.volume = 0.7;

    audio.addEventListener('error', e => {
        console.error(`❌ Direct audio error for ${audioFile}:`, e);
    });

    audio.play()
         .then(() => {
             console.log(`✅ Direct audio playing: ${audioFile}`);
             currentMainAudio   = audio;
             isMainRadioPlaying = true;
             updatePlayButtonState(true);
         })
         .catch(e => {
             // -- most common reason: autoplay blocked before user gesture
             console.warn('🔈 play() was blocked by the browser – waiting for user click.', e);
             updatePlayButtonState(false);
         });
}


        function toggleMainRadioPlayback() {
            console.log('🎛️ Toggling main radio playback...');
            console.log('Currently playing:', isMainRadioPlaying);
            console.log('Current station:', currentStationIndex, stations[currentStationIndex]?.name);
            
            if (isMainRadioPlaying) {
                console.log('⏸️ Pausing radio...');
                stopAllAudio();
                updatePlayButtonState(false);
            } else {
                console.log('▶️ Starting radio...');
                // Special handling for Love Radio (station 4)
                if (currentStationIndex === 3 && userLoveChoice) {
                    console.log('💕 Playing Love Radio with user choice:', userLoveChoice);
                    playLoveRadioAudio();
                } else {
                    console.log('📻 Playing regular station...');
                    playStationAudio(currentStationIndex);
                }
            }
        }

        function updatePlayButtonState(playing) {
            const playButton = document.querySelector('.play-button');
            const radioDisplay = document.querySelector('.radio-display');
            
            if (playing) {
                playButton.textContent = '⏸';
                playButton.classList.add('playing');
                radioDisplay.classList.add('playing');
            } else {
                playButton.textContent = '▶';
                playButton.classList.remove('playing');
                radioDisplay.classList.remove('playing');
            }
        }

        // Generate enhanced spectrum bars
        function generateSpectrum() {
            const spectrumBars = document.querySelector('.spectrum-bars');
            if (!spectrumBars) return;
            
            const numBars = 80;
            
            // Clear existing bars
            spectrumBars.innerHTML = '';
            
            for (let i = 0; i < numBars; i++) {
                const bar = document.createElement('div');
                bar.className = 'spectrum-bar';
                bar.style.flex = '1';
                spectrumBars.appendChild(bar);
            }
        }

        function buildBaseSpectrum(seed) {
          const rand  = RNG(seed);
          const bars  = document.querySelectorAll('.spectrum-bar').length;
          let profile = [];
          let h       = 40 + rand()*20;

          // 1) random-walk to get jagged yet continuous line
          for (let i = 0; i < bars; i++) {
            h += (rand() - 0.5) * 18;
            h  = Math.max(10, Math.min(90, h));
            profile.push(h);
          }

          // 2) one-pass blur → removes "walls" of equal height
          profile = profile.map((v, i) => {
            const prev = profile[i-1 < 0 ? 0 : i-1];
            const next = profile[i+1 >= bars ? bars-1 : i+1];
            return (prev + v*2 + next) / 4;
          });

          return profile;
        }

        function animateSpectrum() {
          const bars = document.querySelectorAll('.spectrum-bar');
          bars.forEach((bar, i) => {
            // static base + live jitter + rare spike
            let h = baseHeights[i]
                  + (Math.random() - 0.5) * 14
                  + (Math.random() < 0.015 ? 40 : 0);
            h = Math.max(8, Math.min(92, h));
            bar.style.height  = h + '%';
            bar.style.opacity = 0.45 + Math.random() * 0.55;
          });
        }

        // Function to play the correct audio for Love Radio based on user's choice
            function playLoveRadioAudio () {
        console.log('💕 Playing Love Radio audio…');
        console.log('User choice:', userLoveChoice);

        stopAllAudio();                                  // mute anything else first

        // select the correct Naz track
        let audioFile;
        if (userLoveChoice === 'beingLoved') {
            audioFile = 'audio/naz1.mp3';
            console.log('🎵 Playing “being loved” audio: naz1.mp3');
        } else if (userLoveChoice === 'loving') {
            audioFile = 'audio/naz2.mp3';
            console.log('🎵 Playing “loving” audio: naz2.mp3');
        } else {
            console.warn('⚠️ No user choice made yet for Love Radio');
            return;
        }

        const audio = new Audio(audioFile);
        audio.volume = 0.7;

        audio.addEventListener('error', (e) => {
            console.error(`❌ Love Radio audio error for ${audioFile}:`, e);
            alert(`Cannot load Love Radio audio: ${audioFile}`);
        });

        audio.play().then(() => {
            console.log(`✅ Love Radio playing: ${audioFile}`);
            currentMainAudio     = audio;
            isMainRadioPlaying   = true;
            updatePlayButtonState(true);
            document.querySelector('.radio-display')?.classList.add('playing');
        }).catch((e) => {
            console.error(`❌ Love Radio play failed for ${audioFile}:`, e);
            alert(`Cannot play Love Radio audio!\n\nFile: ${audioFile}\nError: ${e.message}`);
        });
        }


        // Enhanced station switching with animations and audio
       function switchToStation (index, withAnimation = true) {
  if (index < 0 || index >= stations.length) return;

  // pick the right station object
  const station = stations[index];

  /* adapt Love Radio’s metadata on the fly ------------- */
  if (index === 3 && userLoveChoice) {
    station.track  = 'Our Choice in Love';
    station.artist = 'Naz – Radio Istanbul Nights';
    station.audioFile =
        userLoveChoice === 'beingLoved' ? 'audio/naz1.mp3'
                                         : 'audio/naz2.mp3';
  }

  /* helper that actually draws UI + starts playback ----- */
  const render = () => {
    updateStationDisplay(station, index);
    baseHeights = buildBaseSpectrum(index + 1);
    animateSpectrum();

    /* ALWAYS play the new station ---------------------- */
    stopAllAudio();                    // ensure silence first
    if (index === 3 && userLoveChoice) playLoveRadioAudio();
    else                               playStationAudio(index);
  };

  /* animated or instant? ------------------------------- */
  if (withAnimation) {
    const radioInfo   = document.querySelector('.radio-info');
    const stationInfo = document.querySelector('.station-info');
    radioInfo.classList.add('station-changing');
    stationInfo.classList.add('station-changing');
    setTimeout(() => {
      render();
      radioInfo.classList.remove('station-changing');
      stationInfo.classList.remove('station-changing');
    }, 250);
  } else {
    render();
  }
}

        function updateStationDisplay(station, index) {
            // Update frequency and station info
            document.querySelector('.frequency').textContent = station.freq;
            document.querySelector('.station-name').textContent = station.name;
            document.querySelector('.now-playing').textContent = `♪ Now Playing: ${station.track} ♪`;
            
            // Update track info
            document.querySelector('.track-title').textContent = station.track;
            document.querySelector('.artist-name').textContent = station.artist;
            document.querySelector('.album-name').textContent = station.album;
            
            // Update radio stats
            document.querySelector('.radio-stats .stat-line:nth-child(1) .stat-value').textContent = station.freq.replace(' FM', ' MHz');
            document.querySelector('.radio-stats .stat-line:nth-child(2) .stat-value').textContent = station.mode;
            
            // Update signal strength
            updateSignalStrength(station.signal);
            
            // Update current station index
            currentStationIndex = index;
            
            // Update knob position and spectrum indicator
            knobRotation = (index / (stations.length - 1)) * 270;
            updateKnobRotation(knobRotation);
            
            // Ensure spectrum indicator is updated with small delay for proper layout calculation
            setTimeout(() => {
                updateSpectrumIndicator();
            }, 50);
            updateActivePreset(index);
        }

        function updateSignalStrength(strength) {
            const bars = document.querySelectorAll('.signal-bar');
            bars.forEach((bar, index) => {
                bar.classList.remove('weak', 'medium', 'strong');
                
                if (strength === 'strong') {
                    bar.classList.add('strong');
                } else if (strength === 'medium' && index < 3) {
                    bar.classList.add('medium');
                } else if (strength === 'weak' && index < 2) {
                    bar.classList.add('weak');
                }
            });
        }

        // Enhanced tuning knob functionality
        function updateKnobRotation(angle) {
            const knobIndicator = document.querySelector('.knob-indicator');
            if (knobIndicator) {
                knobIndicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            }
            
            // Update spectrum tuning indicator position based on current frequency
            updateSpectrumIndicator();
        }

        // Separate function for home tuning knob rotation
        function updateHomeTuningKnob() {
            const homeTuningKnob = document.getElementById('homeTuningKnob');
            if (homeTuningKnob) {
                homeKnobRotation += 45; // Rotate 45 degrees each station change
                homeTuningKnob.style.transform = `rotate(${homeKnobRotation}deg)`;
                
                // Add a subtle animation effect
                homeTuningKnob.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    homeTuningKnob.style.transition = '';
                }, 300);
            }
        }

        // Update spectrum indicator position based on current frequency
        function updateSpectrumIndicator() {
            const currentStation = stations[currentStationIndex];
            const currentFreq = parseFloat(currentStation.freq.replace(' FM', ''));
            
            // Frequency range exactly matching the spectrum header markers
            const minFreq = 88.1;   // Leftmost marker
            const maxFreq = 107.9;  // Rightmost marker
            
            // Calculate position accounting for the spectrum container's padding
            const basePosition = ((currentFreq - minFreq) / (maxFreq - minFreq)) * 100;
            
            // Account for spectrum padding (10px on each side) and the actual usable width
            const spectrumContainer = document.querySelector('.spectrum');
            if (spectrumContainer) {
                const containerWidth = spectrumContainer.offsetWidth;
                const paddingWidth = 20; // 10px left + 10px right padding from spectrum-bars
                const usableWidth = containerWidth - paddingWidth;
                const paddingOffset = (10 / containerWidth) * 100; // Convert left padding to percentage
                
                // Calculate final position within the padded area
                const adjustedPosition = paddingOffset + (basePosition * (usableWidth / containerWidth));
                
                console.log(`=== TUNING UPDATE ===`);
                console.log(`Current Station: ${currentStation.name}`);
                console.log(`Frequency: ${currentFreq} MHz`);
                console.log(`Base Position: ${basePosition.toFixed(2)}%`);
                console.log(`Adjusted Position: ${adjustedPosition.toFixed(2)}%`);
                console.log(`Container Width: ${containerWidth}px, Usable Width: ${usableWidth}px`);
                
                const tuningIndicator = document.querySelector('.tuning-indicator');
                if (tuningIndicator) {
                    tuningIndicator.style.left = `${adjustedPosition}%`;
                    
                    // Force a visual update
                    tuningIndicator.style.opacity = '0.8';
                    setTimeout(() => {
                        tuningIndicator.style.opacity = '1';
                    }, 100);
                } else {
                    console.log('ERROR: Tuning indicator element not found!');
                }
            }
        }

        function updateActivePreset(index) {
            document.querySelectorAll('.preset-btn').forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
        }

        // Enhanced scanning functionality
        function startScanning() {
            if (isScanning) return;
            
            isScanning = true;
            const scanBtn = document.querySelector('.scan-btn');
            if (scanBtn) {
                scanBtn.textContent = '⏹ STOP';
                scanBtn.classList.add('active');
            }
            
            let scanIndex = 0;
            scanInterval = setInterval(() => {
                switchToStation(scanIndex, true);
                updateActivePreset(scanIndex);
                scanIndex = (scanIndex + 1) % stations.length;
            }, 2000); // Switch every 2 seconds
        }

        function stopScanning() {
            if (!isScanning) return;
            
            isScanning = false;
            clearInterval(scanInterval);
            
            const scanBtn = document.querySelector('.scan-btn');
            if (scanBtn) {
                scanBtn.textContent = '🔍 SCAN';
                scanBtn.classList.remove('active');
            }
        }

        // Initialize radio
        function initializeRadio() {
            console.log('🎛️ Initializing radio...');
            
            // Test audio files first
            console.log('🧪 Testing audio file accessibility...');
            const audioFiles = ['naz1.mp3', 'naz2.mp3', 'salem.mp3', 'iqra.mp3', 'abdelrahman.mp3'];
            audioFiles.forEach(file => testAudioFile(file));
            
            generateSpectrum();
            baseHeights = buildBaseSpectrum(currentStationIndex + 1);
            switchToStation(currentStationIndex, false);
            updateActivePreset(currentStationIndex);
            
            // Initialize home knob rotation
            homeKnobRotation = currentStationIndex * 45;
            const homeTuningKnob = document.getElementById('homeTuningKnob');
            if (homeTuningKnob) {
                homeTuningKnob.style.transform = `rotate(${homeKnobRotation}deg)`;
            }
            
            // add this back for continuous flicker:
            setInterval(animateSpectrum, 100);
            
            // Initialize spectrum indicator
            setTimeout(() => {
                updateSpectrumIndicator();
            }, 100);

            console.log('✅ Radio initialization complete!');
        }

        // JavaScript for the Ideation Section (Love Radio)
        const tuningKnob = document.getElementById('tuningKnob');
        const volumeKnob = document.getElementById('volumeKnob');
        const introText = document.getElementById('introText');
        const cardsContainer = document.getElementById('cardsContainer');
        const radioWaves = document.getElementById('radioWaves');
        const infoDisplay = document.getElementById('infoDisplay');
        const volumeIndicator = document.getElementById('volumeIndicator');
        const storyCards = document.querySelectorAll('.card[data-frequency]');
        const signalBars = document.querySelectorAll('.signal-bar');
        const volumeBars = document.querySelectorAll('.volume-bar');

        let currentFreq = 88.7;
        let currentRotation = 0;
        let volumeRotation = 0;
        let volumeLevel = 3;
        let isActive = false;
        let currentAudio = null;
        let isPlaying = false;
        let stationBase  = 0;
        let stationScale = 1;

        // Spectrum "engine" globals
        let baseHeights = [];

        // tiny, reproducible PRNG (LCG)
        function RNG(seed) {
          let s = seed * 16807 % 2147483647;
          return function() {
            s = s * 16807 % 2147483647;
            return (s & 0x7fffffff) / 2147483647;
          };
        }

        // build one jagged profile for "seed"
        function buildBaseSpectrum(seed) {
          const rand = RNG(seed);
          const bars = document.querySelectorAll('.spectrum-bar').length;
          let h     = 40 + rand() * 20;
          const prof = [];

          // 1) random walk
          for (let i = 0; i < bars; i++) {
            h += (rand() - 0.5) * 18;
            h  = Math.max(10, Math.min(90, h));
            prof.push(h);
          }

          // 2) one simple blur pass
          return prof.map((v,i) => {
            const p = prof[i-1] || v;
            const n = prof[i+1] || v;
            return (p + v*2 + n) / 4;
          });
        }

        const frequencies = [88.1, 88.3, 88.5, 88.7, 88.9, 89.1];
        const storyData = {
            88.1: { title: "Romantic Love", subtitle: '"Two hearts, one rhythm"' },
            88.3: { title: "Divine Love", subtitle: '"Faith that moves mountains"' },
            88.5: { title: "Love in Leadership", subtitle: '"Leading with the heart"' },
            88.7: { title: "Family Bonds", subtitle: '"Love that roots us"' },
            88.9: { title: "Self-Love", subtitle: '"The journey within"' },
            89.1: { title: "Universal Love", subtitle: '"Love without boundaries"' }
        };

        // Update display function with radio effects
        function updateDisplay(freq) {
            const story = storyData[freq];
            infoDisplay.innerHTML = `
                <div class="frequency-header">
                    <span class="frequency-badge-display">FM ${freq}</span>
                    <span class="now-playing">NOW PLAYING</span>
                </div>
                <div class="story-title">${story.title}</div>
                <div class="story-subtitle">${story.subtitle}</div>
            `;

            // Update signal strength based on frequency
            updateSignalStrength(freq);
            
            // Switch audio source
            switchAudioSource(freq);
            
            // Update spectrum indicator for Love Radio section
            updateLoveRadioSpectrum(freq);
        }

        // Update Love Radio spectrum with proper positioning  
        function updateLoveRadioSpectrum(freq) {
            // Update the main radio spectrum indicator to show where we are
            const mainTuningIndicator = document.querySelector('.tuning-indicator');
            if (mainTuningIndicator) {
                // Use exact frequency positioning for all frequencies
                const minFreq = 88.1;
                const maxFreq = 107.9;
                const basePosition = ((freq - minFreq) / (maxFreq - minFreq)) * 100;
                
                // Account for spectrum padding (same as main function)
                const spectrumContainer = document.querySelector('.spectrum');
                if (spectrumContainer) {
                    const containerWidth = spectrumContainer.offsetWidth;
                    const paddingWidth = 20; // 10px left + 10px right padding
                    const usableWidth = containerWidth - paddingWidth;
                    const paddingOffset = (10 / containerWidth) * 100;
                    
                    const adjustedPosition = paddingOffset + (basePosition * (usableWidth / containerWidth));
                    
                    console.log(`Love Radio: Setting frequency ${freq} MHz to position ${adjustedPosition.toFixed(1)}%`);
                    
                    mainTuningIndicator.style.left = `${adjustedPosition}%`;
                } else {
                    // Fallback to basic positioning if container measurement fails
                    mainTuningIndicator.style.left = `${basePosition}%`;
                }
            }
        }

        // Add audio switching function
        function switchAudioSource(freq) {
            // Stop current audio if playing
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            
            // Get new audio element
            const audioId = `radioAudio${freq}`;
            currentAudio = document.getElementById(audioId);
            
            if (currentAudio) {
                // Set volume based on current volume level
                currentAudio.volume = volumeLevel / 5;
                
                // Auto-play if radio was already playing
                if (isPlaying) {
                    currentAudio.play().catch(e => console.log('Audio play failed:', e));
                }
            }
        }

        // Add play/pause functionality
        function togglePlayback() {
            if (!currentAudio) return;
            
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play().catch(e => console.log('Audio play failed:', e));
                isPlaying = true;
            }
            
            // Update visual indicators
            updatePlayingState();
        }

        function updatePlayingState() {
            const radio = document.getElementById('radio');
            const nowPlayingElement = document.querySelector('.now-playing');
            
            if (isPlaying) {
                radio.classList.add('playing');
                nowPlayingElement.textContent = 'NOW PLAYING';
                radioWaves.style.opacity = '1';
            } else {
                radio.classList.remove('playing');
                nowPlayingElement.textContent = 'PAUSED';
                radioWaves.style.opacity = '0.3';
            }
        }

        // Update signal strength indicator
        function updateSignalStrength(freq) {
            const strength = Math.floor(Math.random() * 2) + 3; // 3-4 bars for good reception
            signalBars.forEach((bar, index) => {
                if (index < strength) {
                    bar.classList.add('active');
                } else {
                    bar.classList.remove('active');
                }
            });
        }

        // Update volume indicator
        function updateVolumeIndicator() {
            volumeBars.forEach((bar, index) => {
                if (index < volumeLevel) {
                    bar.classList.add('active');
                } else {
                    bar.classList.remove('active');
                }
            });

            // Show volume indicator temporarily
            volumeIndicator.style.opacity = '1';
            setTimeout(() => {
                volumeIndicator.style.opacity = '0';
            }, 2000);
        }

        function startRadio() {
            isActive = true;

            // Fade transitions with radio startup effect
            introText.style.opacity = '0';
            cardsContainer.style.opacity = '1';

            setTimeout(() => {
                introText.style.display = 'none';
            }, 1000);

            radioWaves.style.opacity = '1';

            // Initialize display and highlight
            updateDisplay(currentFreq);
            highlightStory(currentFreq);
            updateVolumeIndicator();

            // Initialize audio
            switchAudioSource(currentFreq);

            // Simulate radio warmup
            setTimeout(() => {
                updateSignalStrength(currentFreq);
            }, 500);
        }

        // Enhanced tuning knob interaction
        tuningKnob.addEventListener('click', function() {
            if (!isActive) startRadio();

            const currentIndex = frequencies.indexOf(currentFreq);
            const nextIndex = (currentIndex + 1) % frequencies.length;
            currentFreq = frequencies[nextIndex];

            currentRotation += 60;
            this.style.transform = `rotate(${currentRotation}deg)`;

            // Brief static before new station
            setTimeout(() => {
                updateDisplay(currentFreq);
                highlightStory(currentFreq);
            }, 150);
        });

        // Add double-click for play/pause
        tuningKnob.addEventListener('dblclick', function() {
            if (!isActive) return;
            togglePlayback();
        });

        // Enhanced volume knob interaction
        volumeKnob.addEventListener('click', function() {
            volumeRotation += 45;
            this.style.transform = `rotate(${volumeRotation}deg)`;

            // First click starts playback, subsequent clicks adjust volume
            if (!isActive) {
                startRadio();
                togglePlayback();
            } else {
                // Cycle volume level (0-5)
                volumeLevel = (volumeLevel + 1) % 6;
                
                // Update audio volume if audio is available
                if (currentAudio) {
                    currentAudio.volume = volumeLevel / 5;
                }
            }

            // Update visual indicators
            updateVolumeIndicator();

            // Adjust radio waves opacity based on volume
            const waveOpacity = volumeLevel * 0.2;
            radioWaves.style.opacity = Math.max(waveOpacity, 0.1);

            // Visual feedback
            this.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.8)';
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 200);
        });

        function highlightStory(freq) {
            storyCards.forEach(card => {
                const cardFreq = parseFloat(card.dataset.frequency);
                if (cardFreq === freq) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        // Enhanced story card interactions
        storyCards.forEach(card => {
            card.addEventListener('click', function() {
                if (!isActive) startRadio();

                const freq = parseFloat(this.dataset.frequency);
                if (freq !== currentFreq) {
                    currentFreq = freq;
                    const index = frequencies.indexOf(freq);
                    currentRotation = index * 60;
                    tuningKnob.style.transform = `rotate(${currentRotation}deg)`;

                    // Simulate tuning delay
                    setTimeout(() => {
                        updateDisplay(currentFreq);
                        highlightStory(currentFreq);
                    }, 150);
                } else {
                    // If clicking the same frequency, toggle play/pause
                    togglePlayback();
                }
            });

            // Add hover effect for cards
            card.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateY(-4px) scale(1.01)';
                }
            });

            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = '';
                }
            });
        });

        // Simulate occasional signal fluctuation
        setInterval(() => {
            if (isActive && Math.random() < 0.1) {
                updateSignalStrength(currentFreq);
            }
        }, 3000);

        // Add keyboard controls for radio
        document.addEventListener('keydown', function(e) {
            if (!isActive) return;

            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowRight':
                    tuningKnob.click();
                    break;
                case 'ArrowDown':
                case 'ArrowLeft':
                    // Tune backwards
                    const currentIndex = frequencies.indexOf(currentFreq);
                    const prevIndex = currentIndex === 0 ? frequencies.length - 1 : currentIndex - 1;
                    currentFreq = frequencies[prevIndex];
                    currentRotation -= 60;
                    tuningKnob.style.transform = `rotate(${currentRotation}deg)`;
                    setTimeout(() => {
                        updateDisplay(currentFreq);
                        highlightStory(currentFreq);
                    }, 150);
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    volumeKnob.click();
                    break;
            }
        });

        // Team Section Player Management
        const teamPlayers = new Map();

        // Initialize team players
        document.querySelectorAll('#team .music-player').forEach(playerEl => {
            const playerId = playerEl.dataset.player;
            
            const player = {
                element: playerEl,
                isPlaying: false,
                audio: playerEl.querySelector('audio'),
                currentTime: 0,
                duration: 0,
                
                // Elements
                playBtn: playerEl.querySelector('.play-btn'),
                playIcon: playerEl.querySelector('.play-icon'),
                pauseIcon: playerEl.querySelector('.pause-icon'),
                progressBar: playerEl.querySelector('.progress-bar'),
                progressFill: playerEl.querySelector('.progress-fill'),
                currentTimeEl: playerEl.querySelector('.current-time'),
                totalTimeEl: playerEl.querySelector('.total-time'),
                prevBtn: playerEl.querySelector('.prev-btn'),
                nextBtn: playerEl.querySelector('.next-btn')
            };

            // Listen for loadedmetadata to get actual duration
            player.audio.addEventListener('loadedmetadata', () => {
                player.duration = player.audio.duration;
                updateTimeDisplay(player);
                console.log(`Player ${playerId}: Loaded metadata. Duration: ${player.duration}`);
            });

            // Listen for timeupdate to update progress bar
            player.audio.addEventListener('timeupdate', () => {
                player.currentTime = player.audio.currentTime;
                console.log(`Player ${playerId}: timeupdate - currentTime: ${player.currentTime}, duration: ${player.duration}`);
                updateProgressBar(player);
                updateTimeDisplay(player);
            });

            // Listen for audio ending
            player.audio.addEventListener('ended', () => {
                pauseTeamPlayer(player);
                player.currentTime = 0;
                updateProgressBar(player);
                updateTimeDisplay(player);
                console.log(`Player ${playerId}: Audio ended.`);
            });

            // Add error listener for audio element
            player.audio.addEventListener('error', (e) => {
                console.error(`Player ${playerId}: Audio error!`, e);
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        console.error(`Player ${playerId}: You aborted the audio playback.`);
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        console.error(`Player ${playerId}: A network error caused the audio download to fail.`);
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        console.error(`Player ${playerId}: The audio playback was aborted due to a corruption problem or because the media used features your browser does not support.`);
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.error(`Player ${playerId}: The audio could not be loaded, either because the server or network failed or because the format is not supported.`);
                        break;
                    default:
                        console.error(`Player ${playerId}: An unknown audio error occurred.`);
                        break;
                }
            });

            // Add play listener for audio element
            player.audio.addEventListener('play', () => {
                console.log(`Player ${playerId}: Audio started playing.`);
            });

            teamPlayers.set(playerId, player);
            setupTeamPlayerEvents(player, playerId);
            updateTimeDisplay(player);
        });

        function setupTeamPlayerEvents(player, playerId) {
            // Play/Pause
            player.playBtn.addEventListener('click', () => {
                // Stop main radio first
                stopAllAudio();
                
                // Pause all other team players
                teamPlayers.forEach((otherPlayer, otherId) => {
                    if (otherId !== playerId && otherPlayer.isPlaying) {
                        pauseTeamPlayer(otherPlayer);
                    }
                });

                if (player.isPlaying) {
                    pauseTeamPlayer(player);
                } else {
                    playTeamPlayer(player);
                }
            });

            // Previous
            player.prevBtn.addEventListener('click', () => {
                console.log(`Player ${playerId}: Previous button clicked`);
                // Stop current player
                if (player.isPlaying) {
                    pauseTeamPlayer(player);
                }

                // Find and start previous player
                const currentId = parseInt(playerId);
                const prevIndex = (currentId - 1 - 1 + teamPlayers.size) % teamPlayers.size; // 0-based index
                const prevId = (prevIndex + 1).toString(); // 1-based ID
                console.log(`Player ${playerId}: Calculated previous player ID: ${prevId}`);
                const prevPlayer = teamPlayers.get(prevId);
                
                if (prevPlayer) {
                    console.log(`Player ${playerId}: Found previous player: ${prevId}`);
                    // Add pop animation
                    prevPlayer.element.classList.add('pop-animation');
                    
                    // Remove animation after it completes
                    setTimeout(() => {
                        prevPlayer.element.classList.remove('pop-animation');
                    }, 600);
                    
                    // Start playing the previous player after a short delay
                    setTimeout(() => {
                        prevPlayer.currentTime = 0; // Reset current time for the new track
                        playTeamPlayer(prevPlayer);
                    }, 200);
                } else {
                    console.log(`Player ${playerId}: Previous player ${prevId} not found.`);
                }
            });

            // Next
            player.nextBtn.addEventListener('click', () => {
                console.log(`Player ${playerId}: Next button clicked`);
                // Stop current player
                if (player.isPlaying) {
                    pauseTeamPlayer(player);
                }

                // Find and start next player
                const currentId = parseInt(playerId);
                const nextId = ((currentId % teamPlayers.size) + 1).toString(); // Corrected logic for cycling through players
                console.log(`Player ${playerId}: Calculated next player ID: ${nextId}`);
                const nextPlayer = teamPlayers.get(nextId);
                
                if (nextPlayer) {
                    console.log(`Player ${playerId}: Found next player: ${nextId}`);
                    // Add pop animation
                    nextPlayer.element.classList.add('pop-animation');
                    
                    // Remove animation after it completes
                    setTimeout(() => {
                        nextPlayer.element.classList.remove('pop-animation');
                    }, 600);
                    
                    // Start playing the next player after a short delay
                    setTimeout(() => {
                        nextPlayer.currentTime = 0; // Reset current time for the new track
                        playTeamPlayer(nextPlayer);
                    }, 200);
                } else {
                    console.log(`Player ${playerId}: Next player ${nextId} not found.`);
                }
            });

            // Progress bar
            player.progressBar.addEventListener('click', (e) => {
                const rect = player.progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = (clickX / rect.width) * player.duration;
                
                // Smoothly update the progress bar
                player.progressFill.style.transition = 'width 0.1s linear';
                player.currentTime = newTime;
                player.audio.currentTime = newTime;
                updateProgressBar(player);
                updateTimeDisplay(player);
            });

            // Add touch support for mobile devices
            player.progressBar.addEventListener('touchstart', handleTouch);
            player.progressBar.addEventListener('touchmove', handleTouch);
            
            function handleTouch(e) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = player.progressBar.getBoundingClientRect();
                const clickX = touch.clientX - rect.left;
                const newTime = (clickX / rect.width) * player.duration;
                
                player.progressFill.style.transition = 'width 0.1s linear';
                player.currentTime = newTime;
                player.audio.currentTime = newTime;
                updateProgressBar(player);
                updateTimeDisplay(player);
            }
        }

        function playTeamPlayer(player) {
            player.isPlaying = true;
            player.element.classList.add('playing');
            console.log(`Player ${player.element.dataset.player}: playTeamPlayer called, isPlaying: ${player.isPlaying}`);
            updatePlayButton(player);
            player.audio.play();
        }

        function pauseTeamPlayer(player) {
            player.isPlaying = false;
            player.element.classList.remove('playing');
            console.log(`Player ${player.element.dataset.player}: pauseTeamPlayer called, isPlaying: ${player.isPlaying}`);
            updatePlayButton(player);
            player.audio.pause();
        }

        function updatePlayButton(player) {
            console.log(`Player ${player.element.dataset.player}: updatePlayButton called, isPlaying: ${player.isPlaying}`);
            if (player.isPlaying) {
                player.playBtn.textContent = '⏸';
                console.log(`Player ${player.element.dataset.player}: Displaying pause icon`);
            } else {
                player.playBtn.textContent = '▶';
                console.log(`Player ${player.element.dataset.player}: Displaying play icon`);
            }
        }

        function updateProgressBar(player) {
            if (player.duration > 0) {
                const progress = (player.currentTime / player.duration) * 100;
                player.progressFill.style.width = `${Math.min(progress, 100)}%`;
                console.log(`Player ${player.element.dataset.player}: Progress bar width set to ${player.progressFill.style.width}`);
            }
        }

        function updateTimeDisplay(player) {
            player.currentTimeEl.textContent = formatTime(player.currentTime);
            if (player.duration > 0) {
                const remaining = Math.max(0, player.duration - player.currentTime);
                player.totalTimeEl.textContent = '-' + formatTime(remaining);
            }
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 DOM loaded, initializing...');
            initializeRadio();
            
            // Audio Test Button
const testBtn = document.getElementById('audioTestBtn');
if (testBtn) {
  testBtn.addEventListener('click', () => {
    const statusEl = document.getElementById('audioStatus');
    statusEl.textContent = '🧪 Testing…';

    // ✎ the rest of your testing code stays the same
    const testAudio = new Audio('salem.mp3');
    testAudio.volume = 0.5;

    testAudio.addEventListener('canplay', () => {
      statusEl.textContent = '✅ Audio files OK!';
      statusEl.style.color = 'green';
    });

    testAudio.addEventListener('error', () => {
      statusEl.textContent = '❌ Audio files not found!';
      statusEl.style.color = 'red';
    });

    testAudio.play().then(() => setTimeout(() => testAudio.pause(), 1000));
  });
}            
            // Play button with enhanced audio functionality
            document.querySelector('.play-button').addEventListener('click', function () {
                // first human interaction boots the radio
                if (!isActive) startRadio();

                // tiny press animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => { this.style.transform = ''; }, 150);

                toggleMainRadioPlayback();
            });

            // Scan button
            const scanBtn = document.querySelector('.scan-btn');
            if (scanBtn) {
                scanBtn.addEventListener('click', function() {
                    if (isScanning) {
                        stopScanning();
                    } else {
                        startScanning();
                    }
                });
            }

            // Preset buttons
/* ───────── NEW ───────── */
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (!isActive) startRadio();     // ensure user gesture has started audio

        const presetIndex = parseInt(this.dataset.preset, 10);

        /* LOVE RADIO (button 4) opens the modal, nothing else */
        if (this.id === 'preset4') {
            stopAllAudio();                                // silence anything
            const loveModal = document.getElementById('loveModal');
            loveModal.classList.add('show');
            loveModal.querySelector('.modal-content').classList.add('pulse');
            return;
        }

        /* regular presets 1-3 */
        currentStationIndex = presetIndex;

        homeKnobRotation = presetIndex * 45;
        document.getElementById('homeTuningKnob').style.transform =
            `rotate(${homeKnobRotation}deg)`;

        switchToStation(presetIndex);
        stopScanning();
    });
});

            // Handle love modal choices
            document.querySelectorAll('.choice-btn').forEach(choiceBtn => {
                choiceBtn.addEventListener('click', function() {
                    const answer = this.dataset.answer;
                    const loveModal = document.getElementById('loveModal');
                    const modalContent = loveModal.querySelector('.modal-content');
                    
                    // Store the user's choice
                    userLoveChoice = answer;
                    
                    // Remove pulse animation
                    modalContent.classList.remove('pulse');
                    
                    // Add selection feedback
                    this.style.background = 'linear-gradient(135deg, #ff6b35, #ff8c42)';
                    this.style.color = 'white';
                    this.style.transform = 'scale(1.05)';
                    
                    setTimeout(() => {
                        // Hide the modal with animation
                        loveModal.classList.remove('show');
                        
                        // Now switch to station 4 (index 3) with all visual updates
                        setTimeout(() => {
                            // Make sure we're switching to station 4
                            currentStationIndex = 3;
                            
                            // Update knob rotation to position 4
                            homeKnobRotation = currentStationIndex * 45;
                            const homeTuningKnob = document.getElementById('homeTuningKnob');
                            if (homeTuningKnob) {
                                homeTuningKnob.style.transform = `rotate(${homeKnobRotation}deg)`;
                                homeTuningKnob.style.transition = 'transform 0.3s ease';
                                setTimeout(() => {
                                    homeTuningKnob.style.transition = '';
                                }, 300);
                            }
                            
                            // Update active preset to show button 4 as selected
                            updateActivePreset(currentStationIndex);
                            
                            // Switch to station 4 with animation and audio
                            switchToStation(currentStationIndex, true);
                            stopScanning();
                        }, 400);
                        
                        // Log the user's choice
                        console.log(`User chose: ${answer} - Switching to Station 4 with corresponding audio`);
                        
                    }, 800); // Wait for user to see their selection
                });
            });

            // Simple tuning knob click (no dragging)
            const homeTuningKnob = document.getElementById('homeTuningKnob');
            if (homeTuningKnob) {
                homeTuningKnob.addEventListener('click', function () {
    if (!isActive) startRadio();     // unlock autoplay on first twist
    stopAllAudio();                  // stop current track immediately

    const nextStationIndex = (currentStationIndex + 1) % stations.length;

    /* LOVE RADIO position → show modal instead of tuning */
    if (nextStationIndex === 3) {
        const loveModal = document.getElementById('loveModal');
        loveModal.classList.add('show');
        loveModal.querySelector('.modal-content').classList.add('pulse');

        currentStationIndex = nextStationIndex;
        updateHomeTuningKnob();
        updateActivePreset(currentStationIndex);
        return;
    }

    /* normal tuning */
    currentStationIndex = nextStationIndex;
    updateHomeTuningKnob();
    switchToStation(currentStationIndex);
    stopScanning();
});}
            // Navigation buttons
            const nextBtn = document.querySelector('.next-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    const nextStationIndex = (currentStationIndex + 1) % stations.length;
                    
                    // Special handling when reaching position 4 (index 3)
                    if (nextStationIndex === 3) {
                        // Show the love modal instead of switching station
                        const loveModal = document.getElementById('loveModal');
                        loveModal.classList.add('show');
                        
                        // Add pulse animation to draw attention
                        const modalContent = loveModal.querySelector('.modal-content');
                        modalContent.classList.add('pulse');
                        
                        // Still update the visual knob rotation and preset highlight
                        currentStationIndex = nextStationIndex;
                        updateHomeTuningKnob();
                        updateActivePreset(currentStationIndex);
                        
                        return; // Don't proceed with normal station switching
                    }
                    
                    // Normal behavior for other positions
                    currentStationIndex = nextStationIndex;
                    updateHomeTuningKnob();
                    switchToStation(currentStationIndex);
                    stopScanning();
                });
            }

            const prevBtn = document.querySelector('.prev-btn');
            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    const prevStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
                    
                    // Special handling when reaching position 4 (index 3)
                    if (prevStationIndex === 3) {
                        // Show the love modal instead of switching station
                        const loveModal = document.getElementById('loveModal');
                        loveModal.classList.add('show');
                        
                        // Add pulse animation to draw attention
                        const modalContent = loveModal.querySelector('.modal-content');
                        modalContent.classList.add('pulse');
                        
                        // Still update the visual knob rotation and preset highlight
                        currentStationIndex = prevStationIndex;
                        homeKnobRotation = prevStationIndex * 45;
                        const homeTuningKnob = document.getElementById('homeTuningKnob');
                        if (homeTuningKnob) {
                            homeTuningKnob.style.transform = `rotate(${homeKnobRotation}deg)`;
                            homeTuningKnob.style.transition = 'transform 0.3s ease';
                            setTimeout(() => {
                                homeTuningKnob.style.transition = '';
                            }, 300);
                        }
                        updateActivePreset(currentStationIndex);
                        
                        return; // Don't proceed with normal station switching
                    }
                    
                    // Normal behavior for other positions
                    currentStationIndex = prevStationIndex;
                    homeKnobRotation -= 45; // Rotate backwards
                    const homeTuningKnob = document.getElementById('homeTuningKnob');
                    if (homeTuningKnob) {
                        homeTuningKnob.style.transform = `rotate(${homeKnobRotation}deg)`;
                        homeTuningKnob.style.transition = 'transform 0.3s ease';
                        setTimeout(() => {
                            homeTuningKnob.style.transition = '';
                        }, 300);
                    }
                    switchToStation(currentStationIndex);
                    stopScanning();
                });
            }

            // Radio mode buttons
            document.querySelectorAll('.radio-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.textContent === 'FM' || this.textContent === 'AM') {
                        document.querySelectorAll('.radio-btn').forEach(b => {
                            if (b.textContent === 'FM' || b.textContent === 'AM') {
                                b.classList.remove('active');
                            }
                        });
                        this.classList.add('active');
                    }
                });
            });

            // Volume slider
            const homeVolumeSlider = document.getElementById('homeVolumeSlider');
            if (homeVolumeSlider) {
                homeVolumeSlider.addEventListener('input', function() {
                    console.log('Volume:', this.value);
                    
                    // Update audio volume
                    if (currentMainAudio) {
                        currentMainAudio.volume = this.value / 100;
                    }
                    
                    // Add visual feedback for volume changes
                    const volumeLabel = document.querySelector('.volume-label');
                    if (volumeLabel) {
                        volumeLabel.textContent = `VOLUME ${this.value}%`;
                        setTimeout(() => {
                            volumeLabel.textContent = 'VOLUME';
                        }, 1000);
                    }
                });
            }

            // Add smooth scrolling for navigation links
            document.querySelectorAll('.navbar-menu a').forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href.substring(1);
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                });
            });
        });

        // Add CSS transition when audio ends
        document.addEventListener('DOMContentLoaded', function() {
            // Listen for when main radio audio ends
            document.querySelectorAll('#home audio, #ideation audio').forEach(audio => {
                audio.addEventListener('ended', () => {
                    isMainRadioPlaying = false;
                    updatePlayButtonState(false);
                });
            });
        });