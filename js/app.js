const stotramGrid = document.getElementById("stotramGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

let stotrams = [];
let selectedCategory = "all";

async function loadStotrams() {
    try {
        const response = await fetch("data/stotrams.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        stotrams = await response.json();

        console.log("Loaded stotrams:", stotrams);

        filterStotrams();

    } catch (error) {
        console.error("Library loading error:", error);

        emptyState.textContent =
            "Unable to load the stotram library. Please refresh the page.";

        emptyState.hidden = false;
    }
}

// Create stotram cards
function renderStotrams(items) {

    stotramGrid.innerHTML = "";

    emptyState.textContent = "No stotrams found.";
    emptyState.hidden = items.length > 0;

    items.forEach(stotram => {

        const card = document.createElement("article");
        card.className = "stotram-card";

        const top = document.createElement("div");
        top.className = "card-top";

        const symbol = document.createElement("div");
        symbol.className = "card-symbol";
        symbol.textContent = stotram.symbol;

        const difficulty = document.createElement("span");
        difficulty.className = "difficulty";
        difficulty.textContent = stotram.difficulty;

        top.append(symbol, difficulty);

        const title = document.createElement("h3");
        title.textContent = stotram.title;

        const sanskrit = document.createElement("p");
        sanskrit.className = "card-sanskrit";
        sanskrit.textContent = stotram.sanskrit;

        const description = document.createElement("p");
        description.className = "card-description";
        description.textContent = stotram.description;

        const footer = document.createElement("div");
        footer.className = "card-footer";

        const count = document.createElement("span");
        count.className = "verse-count";

        count.textContent = stotram.verses
            ? `${stotram.verses} Verses`
            : "Verse count varies";

        const action = document.createElement("span");
        action.className = "open-btn";

        action.textContent = stotram.status === "available"
            ? "Open Notebook →"
            : "Coming Soon";

        footer.append(count, action);

        card.append(
            top,
            title,
            sanskrit,
            description,
            footer
        );

        // Notebook navigation will be enabled in Phase 2.
        if (stotram.status === "available") {
            const link = document.createElement("a");

            link.href =
                `notebook.html?id=${encodeURIComponent(stotram.id)}`;

            link.appendChild(card);
            stotramGrid.appendChild(link);

        } else {
            stotramGrid.appendChild(card);
        }

    });
}

// Search functionality
searchInput.addEventListener("input", filterStotrams);

// Initialize
loadStotrams();

function filterStotrams() {
    const searchTerm = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const filtered = stotrams.filter(stotram => {

        const matchesCategory =
            selectedCategory.toLowerCase() === "all" ||
            stotram.deity?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch = [
            stotram.title,
            stotram.sanskrit,
            stotram.description,
            stotram.deity
        ].some(value =>
            String(value || "").toLowerCase().includes(searchTerm)
        );

        return matchesCategory && matchesSearch;
    });

    renderStotrams(filtered);
}

document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        selectedCategory = button.dataset.category;

        filterStotrams();
    });
});