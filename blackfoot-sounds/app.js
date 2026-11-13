(() => {
  const SAMPLE_URL = "assets/aa-yes.mp3";

  const sampleAudio = document.getElementById("sample-audio");
  const playBtn = document.getElementById("play-sample");
  const recordBtn = document.getElementById("record-btn");
  const stopBtn = document.getElementById("stop-btn");
  const micStatus = document.getElementById("mic-status");
  const sampleHint = document.getElementById("sample-hint");
  const liveHint = document.getElementById("live-hint");
  const sampleCanvas = document.getElementById("sample-wave");
  const liveCanvas = document.getElementById("live-wave");
  const liveStage = document.getElementById("live-stage");
  const adviceSection = document.getElementById("advice");
  const adviceSummary = document.getElementById("advice-summary");
  const adviceList = document.getElementById("advice-list");
  const adviceMeta = document.getElementById("advice-meta");
  const sampleCtx = sampleCanvas.getContext("2d");
  const liveCtx = liveCanvas.getContext("2d");

  let audioCtx = null;
  let sampleBuffer = null;
  let samplePeaks = null;
  let sampleStats = null;
  let recordedPeaks = null;
  let mediaStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let analyser = null;
  let liveRaf = 0;
  let playbackRaf = 0;
  let isRecording = false;
  let isStartingRecord = false;

  function ensureAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Resume when possible; do not block waveform decode on autoplay policy.
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return Promise.resolve();
  }

  function setStatus(msg, kind = "") {
    micStatus.textContent = msg;
    micStatus.classList.remove("is-error", "is-ok");
    if (kind) micStatus.classList.add(kind);
  }

  function resizeCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function fillColor(stroke) {
    return stroke.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const p = inner.split(",").map((x) => x.trim());
      return `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.18)`;
    });
  }

  function drawWaveform(ctx, peaks, color, progress = 1) {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(242, 235, 224, 0.08)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (!peaks || !peaks.length) {
      ctx.fillStyle = "rgba(242, 235, 224, 0.3)";
      ctx.font = `${Math.round(height * 0.1)}px Sora, sans-serif`;
      ctx.fillText("No waveform yet", width * 0.04, height * 0.55);
      return;
    }

    const mid = height / 2;
    const usable = Math.max(1, Math.floor(peaks.length * Math.min(1, Math.max(0, progress))));
    const step = width / peaks.length;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, width / 500);
    ctx.lineJoin = "round";
    for (let i = 0; i < usable; i++) {
      const x = i * step;
      const amp = peaks[i] * height * 0.42;
      if (i === 0) ctx.moveTo(x, mid - amp);
      else ctx.lineTo(x, mid - amp);
    }
    for (let i = usable - 1; i >= 0; i--) {
      const x = i * step;
      const amp = peaks[i] * height * 0.42;
      ctx.lineTo(x, mid + amp);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor(color);
    ctx.fill();
    ctx.stroke();
  }

  function drawLiveBars(ctx, node) {
    const { width, height } = ctx.canvas;
    const data = new Uint8Array(node.frequencyBinCount);
    node.getByteTimeDomainData(data);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(242, 235, 224, 0.08)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(127, 212, 176, 0.95)";
    ctx.lineWidth = Math.max(1.5, width / 450);
    const slice = width / data.length;
    for (let i = 0; i < data.length; i++) {
      const y = (data[i] / 128) * (height / 2);
      const x = i * slice;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function peaksFromBuffer(buffer, buckets = 240) {
    const ch = buffer.getChannelData(0);
    const block = Math.max(1, Math.floor(ch.length / buckets));
    const peaks = new Array(buckets).fill(0);
    for (let i = 0; i < buckets; i++) {
      let max = 0;
      const start = i * block;
      const end = Math.min(ch.length, start + block);
      for (let j = start; j < end; j++) max = Math.max(max, Math.abs(ch[j]));
      peaks[i] = max;
    }
    const peak = Math.max(...peaks, 0.001);
    return peaks.map((p) => p / peak);
  }

  /** Simple envelope metrics for coaching (browser-side only). */
  function analyzeBuffer(buffer) {
    const ch = buffer.getChannelData(0);
    const sr = buffer.sampleRate || 44100;
    const n = ch.length;
    const duration = n / sr;

    let peak = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.abs(ch[i]);
      if (a > peak) peak = a;
      sumSq += ch[i] * ch[i];
    }
    const rms = Math.sqrt(sumSq / Math.max(1, n));
    const thresh = Math.max(peak * 0.12, 0.015);

    let onsetIdx = 0;
    for (let i = 0; i < n; i++) {
      if (Math.abs(ch[i]) >= thresh) {
        onsetIdx = i;
        break;
      }
    }
    let offsetIdx = n - 1;
    for (let i = n - 1; i >= 0; i--) {
      if (Math.abs(ch[i]) >= thresh) {
        offsetIdx = i;
        break;
      }
    }
    if (offsetIdx < onsetIdx) offsetIdx = onsetIdx;

    const speechStart = onsetIdx / sr;
    const speechEnd = offsetIdx / sr;
    const speechDur = Math.max(0.01, speechEnd - speechStart);
    const leadSilence = speechStart;
    const trailSilence = Math.max(0, duration - speechEnd);

    // Energy centroid within the speech region (0 = early energy, 1 = late).
    let energySum = 0;
    let weighted = 0;
    const speechLen = Math.max(1, offsetIdx - onsetIdx);
    for (let i = onsetIdx; i <= offsetIdx; i++) {
      const e = ch[i] * ch[i];
      energySum += e;
      weighted += e * ((i - onsetIdx) / speechLen);
    }
    const energyCentroid = energySum > 0 ? weighted / energySum : 0.5;

    // Mean absolute amplitude in speech region (loudness cue).
    let absSum = 0;
    for (let i = onsetIdx; i <= offsetIdx; i++) absSum += Math.abs(ch[i]);
    const speechMean = absSum / speechLen;

    return {
      duration,
      peak,
      rms,
      speechDur,
      leadSilence,
      trailSilence,
      energyCentroid,
      speechMean,
      hasSpeech: peak >= 0.02 && speechDur >= 0.08,
    };
  }

  function coachTips(sample, user) {
    const tips = [];

    if (!user.hasSpeech) {
      return {
        summary: "No clear speech caught — try again closer to the mic.",
        tips: [
          "Press Record, then say Aa once in a normal voice.",
          "Stay a bit closer to the microphone.",
          "Stop soon after you finish the word.",
        ],
        meta: "Cue: silence / very quiet capture",
      };
    }

    const durRatio = user.speechDur / sample.speechDur;
    if (durRatio > 1.4) {
      tips.push({
        score: Math.abs(durRatio - 1),
        text: "Keep Aa shorter — the sample is a quick yes, not a long hold.",
      });
    } else if (durRatio < 0.65) {
      tips.push({
        score: Math.abs(1 - durRatio),
        text: "Hold the vowel a little longer so it matches the sample length.",
      });
    }

    const leadDelta = user.leadSilence - sample.leadSilence;
    if (leadDelta > 0.35) {
      tips.push({
        score: leadDelta,
        text: "Start sooner after you press Record — less silence before Aa.",
      });
    } else if (leadDelta < -0.25 && user.leadSilence < 0.08) {
      tips.push({
        score: Math.abs(leadDelta),
        text: "Take a short breath first, then speak — you started very early.",
      });
    }

    if (user.trailSilence > sample.trailSilence + 0.6) {
      tips.push({
        score: user.trailSilence - sample.trailSilence,
        text: "Press Stop sooner after you finish — trim the silence at the end.",
      });
    }

    const loudRatio = user.speechMean / Math.max(sample.speechMean, 0.001);
    if (loudRatio < 0.45) {
      tips.push({
        score: 1 - loudRatio,
        text: "Speak a bit louder, or move closer to the mic.",
      });
    } else if (loudRatio > 2.2 || user.peak > 0.95) {
      tips.push({
        score: loudRatio / 2,
        text: "A little softer — stay clear without peaking the mic.",
      });
    }

    const centroidDelta = user.energyCentroid - sample.energyCentroid;
    if (centroidDelta > 0.18) {
      tips.push({
        score: Math.abs(centroidDelta),
        text: "Match the rhythm: put more energy at the start of Aa, then taper.",
      });
    } else if (centroidDelta < -0.18) {
      tips.push({
        score: Math.abs(centroidDelta),
        text: "Don’t cut off early — let the vowel ring a moment like the sample.",
      });
    }

    tips.sort((a, b) => b.score - a.score);
    const chosen = tips.slice(0, 3).map((t) => t.text);

    if (!chosen.length) {
      return {
        summary: "Close match — try once more for consistency.",
        tips: [
          "Play the sample again, then record one clean Aa.",
          "Keep the same length and volume as the gold wave.",
        ],
        meta: `Your speech ~${user.speechDur.toFixed(2)}s · sample ~${sample.speechDur.toFixed(2)}s`,
      };
    }

    const summary =
      chosen.length === 1
        ? "One clear tweak for the next take:"
        : "Focus on these for the next take:";

    return {
      summary,
      tips: chosen,
      meta: `Your speech ~${user.speechDur.toFixed(2)}s · sample ~${sample.speechDur.toFixed(2)}s · lead silence ${user.leadSilence.toFixed(2)}s`,
    };
  }

  function showAdvice(sample, user) {
    const result = coachTips(sample, user);
    adviceSummary.textContent = result.summary;
    adviceList.innerHTML = "";
    for (const tip of result.tips) {
      const li = document.createElement("li");
      li.textContent = tip;
      adviceList.appendChild(li);
    }
    adviceMeta.textContent = result.meta;
    adviceSection.hidden = false;
    adviceSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearAdvice() {
    adviceSection.hidden = true;
    adviceSummary.textContent = "";
    adviceList.innerHTML = "";
    adviceMeta.textContent = "";
  }

  async function loadSampleWaveform() {
    await ensureAudioCtx();
    const res = await fetch(SAMPLE_URL);
    const arr = await res.arrayBuffer();
    sampleBuffer = await audioCtx.decodeAudioData(arr.slice(0));
    samplePeaks = peaksFromBuffer(sampleBuffer);
    sampleStats = analyzeBuffer(sampleBuffer);
    resizeCanvas(sampleCanvas);
    drawWaveform(sampleCtx, samplePeaks, "rgba(230, 197, 122, 0.95)", 1);
    sampleHint.textContent = `Ready · ~${sampleStats.speechDur.toFixed(1)}s`;
  }

  function redrawStatic() {
    resizeCanvas(sampleCanvas);
    resizeCanvas(liveCanvas);
    drawWaveform(sampleCtx, samplePeaks, "rgba(230, 197, 122, 0.95)", 1);
    if (!isRecording) {
      drawWaveform(liveCtx, recordedPeaks, "rgba(127, 212, 176, 0.95)", recordedPeaks ? 1 : 0);
    }
  }

  function animatePlayback() {
    cancelAnimationFrame(playbackRaf);
    const tick = () => {
      if (sampleAudio.paused || sampleAudio.ended) {
        drawWaveform(sampleCtx, samplePeaks, "rgba(230, 197, 122, 0.95)", 1);
        playBtn.textContent = "Play sample";
        sampleHint.textContent = sampleStats
          ? `Ready · ~${sampleStats.speechDur.toFixed(1)}s`
          : "Ready · ~2s";
        return;
      }
      drawWaveform(
        sampleCtx,
        samplePeaks,
        "rgba(230, 197, 122, 0.95)",
        sampleAudio.currentTime / (sampleAudio.duration || 1)
      );
      sampleHint.textContent = `Playing · ${sampleAudio.currentTime.toFixed(1)}s`;
      playbackRaf = requestAnimationFrame(tick);
    };
    playbackRaf = requestAnimationFrame(tick);
  }

  playBtn.addEventListener("click", async () => {
    try {
      await ensureAudioCtx();
      if (!samplePeaks) await loadSampleWaveform();
      if (!sampleAudio.paused) {
        sampleAudio.pause();
        sampleAudio.currentTime = 0;
        playBtn.textContent = "Play sample";
        drawWaveform(sampleCtx, samplePeaks, "rgba(230, 197, 122, 0.95)", 1);
        sampleHint.textContent = sampleStats
          ? `Ready · ~${sampleStats.speechDur.toFixed(1)}s`
          : "Ready · ~2s";
        return;
      }
      sampleAudio.currentTime = 0;
      await sampleAudio.play();
      playBtn.textContent = "Stop sample";
      animatePlayback();
    } catch (err) {
      sampleHint.textContent = "Could not play";
      console.error(err);
    }
  });

  function stopLiveLoop() {
    cancelAnimationFrame(liveRaf);
    liveStage.classList.remove("is-live");
  }

  function startLiveLoop() {
    liveStage.classList.add("is-live");
    const tick = () => {
      if (!analyser) return;
      resizeCanvas(liveCanvas);
      drawLiveBars(liveCtx, analyser);
      liveRaf = requestAnimationFrame(tick);
    };
    liveRaf = requestAnimationFrame(tick);
  }

  async function startRecording() {
    if (isRecording || isStartingRecord) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("This browser cannot use the microphone.", "is-error");
      return;
    }
    if (!window.isSecureContext) {
      setStatus("Mic needs HTTPS or localhost. Serve this folder locally.", "is-error");
      return;
    }

    isStartingRecord = true;
    recordBtn.disabled = true;
    clearAdvice();
    setStatus("Requesting microphone…");

    try {
      await ensureAudioCtx();
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (err) {
      isStartingRecord = false;
      recordBtn.disabled = false;
      const denied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      setStatus(
        denied
          ? "Mic permission denied. Allow it in the browser, then try again."
          : "Could not access the microphone.",
        "is-error"
      );
      return;
    }

    const source = audioCtx.createMediaStreamSource(mediaStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    recordedChunks = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
    mediaRecorder = mime ? new MediaRecorder(mediaStream, { mimeType: mime }) : new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data?.size) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stopLiveLoop();
      isRecording = false;
      recordBtn.classList.remove("is-recording");
      recordBtn.textContent = "Record again";
      stopBtn.hidden = true;
      mediaStream?.getTracks().forEach((t) => t.stop());
      mediaStream = null;

      try {
        const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        const buffer = await audioCtx.decodeAudioData((await blob.arrayBuffer()).slice(0));
        recordedPeaks = peaksFromBuffer(buffer);
        resizeCanvas(liveCanvas);
        drawWaveform(liveCtx, recordedPeaks, "rgba(127, 212, 176, 0.95)", 1);
        liveHint.textContent = `Captured · ${buffer.duration.toFixed(1)}s`;

        if (!sampleStats && sampleBuffer) sampleStats = analyzeBuffer(sampleBuffer);
        if (!sampleStats) await loadSampleWaveform();
        const userStats = analyzeBuffer(buffer);
        showAdvice(sampleStats, userStats);
        setStatus("Compare the waves, then check the advice below.", "is-ok");
      } catch (err) {
        console.error(err);
        setStatus("Recorded, but could not draw the waveform.", "is-error");
        liveHint.textContent = "Capture failed";
        clearAdvice();
      }
    };

    mediaRecorder.start();
    isStartingRecord = false;
    isRecording = true;
    recordBtn.disabled = false;
    recordBtn.classList.add("is-recording");
    recordBtn.textContent = "Recording…";
    stopBtn.hidden = false;
    liveHint.textContent = "Listening…";
    setStatus("Say “Aa” now, then press Stop.", "is-ok");
    startLiveLoop();
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  }

  recordBtn.addEventListener("click", () => {
    if (isStartingRecord) return;
    if (isRecording) stopRecording();
    else startRecording();
  });
  stopBtn.addEventListener("click", stopRecording);
  window.addEventListener("resize", redrawStatic);

  resizeCanvas(liveCanvas);
  drawWaveform(liveCtx, null, "rgba(127, 212, 176, 0.95)", 0);
  loadSampleWaveform().catch((err) => {
    console.error(err);
    sampleHint.textContent = "Sample failed to load";
  });

  const swStatus = document.getElementById("sw-status");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .then((reg) => {
        if (swStatus) {
          swStatus.textContent = reg.active
            ? "PWA ready — shell and sample audio can cache for offline use."
            : "Installing PWA cache…";
        }
      })
      .catch((err) => {
        console.error(err);
        if (swStatus) swStatus.textContent = "Service worker not registered (page still works online).";
      });
  } else if (swStatus) {
    swStatus.textContent = "This browser does not support service workers.";
  }
})();
