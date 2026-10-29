const notebookCells = document.getElementById("notebookCells");

const params = new URLSearchParams(window.location.search);
const stotramId = params.get("id");

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

        renderNotebook(data.verses);

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

                <div class="audio-controls">
                    <button class="audio-btn" disabled>
                        ▶ Audio Coming Soon
                    </button>
                </div>

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