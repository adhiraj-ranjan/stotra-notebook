const notebookCells = document.getElementById("notebookCells");

const params = new URLSearchParams(window.location.search);
const stotramId = params.get("id");

let allVerses = [];
let currentVerseIndex = 0;
// Only allow safe file identifiers.
const validId = /^[a-z0-9-]+$/;

async function loadNotebook() {

    try {

        if (!stotramId || !validId.test(stotramId)) {
            throw new Error("Invalid stotram identifier");
        }

        const response = await fetch(
            `data/stotrams/${stotramId}.json`
        );

        if (!response.ok) {
            throw new Error("Stotram not found");
        }

        const data = await response.json();

        document.title = `${data.title} | Stotra Notebook`;

        document.getElementById("stotramTitle").textContent =
            data.title;

        document.getElementById("stotramDescription").textContent =
            data.description;

        document.getElementById("verseCount").textContent =
            `${data.verses.length} Verses Available`;

        document.getElementById("difficulty").textContent =
            data.difficulty;

        allVerses = data.verses;

        renderNotebook(allVerses);

        createVerseNavigation();

        updateVerseNavigation();

    } catch (error) {

        console.error(error);

        notebookCells.textContent =
            "Unable to load this notebook. Please return to the library.";

    }
}

function renderNotebook(verses) {

    notebookCells.innerHTML = "";

    verses.forEach(verse => {

        const cell = document.createElement("article");
        cell.className = "notebook-cell";

        cell.innerHTML = `
            <div class="cell-number">
                In [${String(verse.number).padStart(2, "0")}]:
            </div>

            <div class="cell-content">

                <div class="cell-heading">
                    <h3>Shloka ${verse.number}</h3>
                    <span class="cell-symbol">ॐ</span>
                </div>

                <div class="sanskrit-verse"></div>

                <div class="audio-controls"></div>

                <div class="translation-section">

                    <details>
                        <summary>🔤 Transliteration</summary>
                        <div class="translation-content transliteration"></div>
                    </details>

                    <details>
                        <summary>📖 Hindi Meaning</summary>
                        <div class="translation-content hindi-meaning"></div>
                    </details>

                    <details>
                        <summary>📜 English Meaning</summary>
                        <div class="translation-content english-meaning"></div>
                    </details>

                </div>

            </div>
        `;

        cell.querySelector(".sanskrit-verse").textContent =
            verse.sanskrit;

        cell.querySelector(".transliteration").textContent =
            verse.transliteration;

        cell.querySelector(".hindi-meaning").textContent =
            verse.meaning_hi;

        cell.querySelector(".english-meaning").textContent =
            verse.meaning_en;
        
        // Create audio player for this verse
        const audioContainer = cell.querySelector(".audio-controls");

        if (verse.audio) {

            const player = stotraAudioPlayer.createPlayer(verse.audio);

            audioContainer.appendChild(player);

        } else {

            audioContainer.textContent = "Audio coming soon";

        }

        notebookCells.appendChild(cell);

    });
}

// Expand all translation sections
document.getElementById("expandAllBtn").addEventListener(
    "click",
    () => {
        document.querySelectorAll(
            ".translation-section details"
        ).forEach(detail => {
            detail.open = true;
        });
    }
);

// Collapse all translation sections
document.getElementById("collapseAllBtn").addEventListener(
    "click",
    () => {
        document.querySelectorAll(
            ".translation-section details"
        ).forEach(detail => {
            detail.open = false;
        });
    }
);

loadNotebook();

/* =========================
   VERSE NAVIGATION
========================= */

function createVerseNavigation() {

    const container =
        document.getElementById("verseNavButtons");

    container.innerHTML = "";

    document.getElementById("navigationCount").textContent =
        `${allVerses.length} Shlokas`;

    allVerses.forEach((verse, index) => {

        const button = document.createElement("button");

        button.className = "verse-nav-btn";
        button.textContent = verse.number;

        button.addEventListener("click", () => {
            goToVerse(index);
        });

        container.appendChild(button);

    });
}

function goToVerse(index) {

    if (index < 0 || index >= allVerses.length) {
        return;
    }

    currentVerseIndex = index;

    const cells =
        document.querySelectorAll(".notebook-cell");

    const targetCell = cells[index];

    if (!targetCell) return;

    targetCell.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    updateVerseNavigation();
}

function updateVerseNavigation() {

    const buttons =
        document.querySelectorAll(".verse-nav-btn");

    buttons.forEach((button, index) => {

        button.classList.toggle(
            "active",
            index === currentVerseIndex
        );

        button.setAttribute(
            "aria-current",
            index === currentVerseIndex ? "true" : "false"
        );

    });

    document.getElementById(
        "currentVerseIndicator"
    ).textContent =
        `Shloka ${allVerses[currentVerseIndex]?.number ?? 1} of ${allVerses.length}`;

    document.getElementById(
        "previousVerseBtn"
    ).disabled = currentVerseIndex === 0;

    document.getElementById(
        "nextVerseBtn"
    ).disabled =
        currentVerseIndex === allVerses.length - 1;
}

/* =========================
   PREVIOUS / NEXT
========================= */

document.getElementById(
    "previousVerseBtn"
).addEventListener("click", () => {

    goToVerse(currentVerseIndex - 1);

});

document.getElementById(
    "nextVerseBtn"
).addEventListener("click", () => {

    goToVerse(currentVerseIndex + 1);

});

/* =========================
   PLAY ENTIRE STOTRAM
========================= */

const playAllBtn =
    document.getElementById("playAllBtn");

let isPlayingAll = false;

playAllBtn.addEventListener("click", async () => {

    if (isPlayingAll) {

        stotraAudioPlayer.stopSequence();

        isPlayingAll = false;

        playAllBtn.textContent = "▶ Play All";
        playAllBtn.classList.remove("playing");

        return;
    }

    const audioPaths = allVerses
        .filter(verse => verse.audio)
        .map(verse => verse.audio);

    if (!audioPaths.length) {
        alert("No audio recordings are available yet.");
        return;
    }

    isPlayingAll = true;

    playAllBtn.textContent = "⏹ Stop";
    playAllBtn.classList.add("playing");

    try {

        await stotraAudioPlayer.playSequence(audioPaths);

    } finally {

        isPlayingAll = false;

        playAllBtn.textContent = "▶ Play All";
        playAllBtn.classList.remove("playing");

    }

});