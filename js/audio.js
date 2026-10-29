class StotraAudioPlayer {

    constructor() {
        this.activeAudio = null;
        this.activeContainer = null;
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remaining = Math.floor(seconds % 60);

        return `${minutes}:${String(remaining).padStart(2, "0")}`;
    }

    resetControls(container) {
        if (!container) return;

        const playBtn = container.querySelector(".play-btn");
        const progress = container.querySelector(".audio-progress");
        const currentTime = container.querySelector(".current-time");

        if (playBtn) {
            playBtn.textContent = "▶ Play";
        }

        if (progress) {
            progress.value = 0;
        }

        if (currentTime) {
            currentTime.textContent = "0:00";
        }
    }

    stopPreviousAudio() {
        if (!this.activeAudio) return;

        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;

        this.resetControls(this.activeContainer);

        this.activeAudio = null;
        this.activeContainer = null;
    }

    createPlayer(audioPath) {

        const container = document.createElement("div");
        container.className = "stotra-audio-player";

        const audio = new Audio(audioPath);
        audio.preload = "metadata";

        container.innerHTML = `
            <div class="player-main">

                <button class="play-btn" type="button">
                    ▶ Play
                </button>

                <div class="progress-container">

                    <input
                        type="range"
                        class="audio-progress"
                        min="0"
                        max="100"
                        value="0"
                        aria-label="Audio position"
                    >

                    <div class="audio-timestamps">
                        <span class="current-time">0:00</span>
                        <span class="total-time">0:00</span>
                    </div>

                </div>

            </div>

            <div class="player-options">

                <label class="speed-control">
                    Speed
                    <select class="speed-select">
                        <option value="0.5">0.5×</option>
                        <option value="0.75">0.75×</option>
                        <option value="1" selected>1×</option>
                        <option value="1.25">1.25×</option>
                    </select>
                </label>

                <button
                    class="loop-btn"
                    type="button"
                    aria-pressed="false"
                >
                    🔁 Loop Off
                </button>

            </div>

            <p class="audio-error" role="alert" hidden>
                Audio unavailable. Please check the recording.
            </p>
        `;

        const playBtn = container.querySelector(".play-btn");
        const loopBtn = container.querySelector(".loop-btn");
        const speedSelect = container.querySelector(".speed-select");
        const progress = container.querySelector(".audio-progress");

        const currentTimeDisplay =
            container.querySelector(".current-time");

        const totalTimeDisplay =
            container.querySelector(".total-time");

        const errorDisplay =
            container.querySelector(".audio-error");

        // Play / Pause
        playBtn.addEventListener("click", async () => {

            if (this.sequenceCancel) {
                this.stopSequence();
            }

            if (this.activeAudio && this.activeAudio !== audio) {
                this.stopPreviousAudio();
            }

            if (!audio.paused) {
                audio.pause();
                return;
            }

            try {
                errorDisplay.hidden = true;

                this.activeAudio = audio;
                this.activeContainer = container;

                await audio.play();

            } catch (error) {
                console.error("Audio playback failed:", error);

                errorDisplay.hidden = false;
                playBtn.textContent = "▶ Play";
            }
        });

        // Update button when playing
        audio.addEventListener("play", () => {
            playBtn.textContent = "⏸ Pause";
        });

        // Update button when paused
        audio.addEventListener("pause", () => {
            playBtn.textContent = "▶ Play";
        });

        // Audio metadata
        audio.addEventListener("loadedmetadata", () => {
            totalTimeDisplay.textContent =
                this.formatTime(audio.duration);
        });

        // Update progress
        audio.addEventListener("timeupdate", () => {

            currentTimeDisplay.textContent =
                this.formatTime(audio.currentTime);

            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                progress.value =
                    (audio.currentTime / audio.duration) * 100;
            }
        });

        // Seek audio
        progress.addEventListener("input", () => {

            if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
                return;
            }

            audio.currentTime =
                (Number(progress.value) / 100) * audio.duration;
        });

        // Playback speed
        speedSelect.addEventListener("change", () => {
            audio.playbackRate = Number(speedSelect.value);
        });

        // Loop
        loopBtn.addEventListener("click", () => {

            audio.loop = !audio.loop;

            loopBtn.textContent = audio.loop
                ? "🔁 Loop On"
                : "🔁 Loop Off";

            loopBtn.classList.toggle("active", audio.loop);
            loopBtn.setAttribute("aria-pressed", String(audio.loop));
        });

        // Reset after playback
        audio.addEventListener("ended", () => {

            this.resetControls(container);

            if (this.activeAudio === audio) {
                this.activeAudio = null;
                this.activeContainer = null;
            }
        });

        // Handle missing audio files
        audio.addEventListener("error", () => {

            errorDisplay.hidden = false;
            playBtn.textContent = "▶ Play";
        });

        return container;
    }

    async playSequence(paths) {

        this.stopSequence();

        if (!paths.length) {
            return;
        }

        this.sequenceStopped = false;

        const sequence = [...paths];

        for (const path of sequence) {

            if (this.sequenceStopped) break;

            this.stopPreviousAudio();

            const audio = new Audio(path);

            this.activeAudio = audio;
            this.activeContainer = null;

            try {

                await new Promise((resolve, reject) => {

                    audio.addEventListener(
                        "ended",
                        resolve,
                        { once: true }
                    );

                    audio.addEventListener(
                        "error",
                        () => reject(new Error(`Audio failed: ${path}`)),
                        { once: true }
                    );

                    audio.play().catch(reject);

                    this.sequenceCancel = () => {
                        audio.pause();
                        resolve();
                    };

                });

            } catch (error) {

                console.error(error);
                this.stopSequence();
                break;

            }

        }

        this.sequenceCancel = null;
        this.activeAudio = null;
        this.activeContainer = null;
    }

    stopSequence() {

        this.sequenceStopped = true;

        if (this.sequenceCancel) {
            this.sequenceCancel();
            this.sequenceCancel = null;
        }

        this.stopPreviousAudio();
    }
}

const stotraAudioPlayer = new StotraAudioPlayer();