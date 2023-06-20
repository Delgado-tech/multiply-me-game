const medalImages = document.querySelectorAll(".medal-image");
const difficultTexts = document.querySelectorAll(".level-selector-text");
const subTitle = document.querySelector("#sub-title");

const gameUrl = "./pages/game.html";

var medalsLevel = [];
var goldenLevels = 0;

SetStorage();
ClearGameSession();

//localStorage.removeItem("levels"); <-- resetar progresso

function SetStorage() {
    if(localStorage.getItem("levels") == null) localStorage.setItem("levels", "e1=0,e2=0,e3=locked,m1=0,m2=locked,m3=locked,d1=0,d2=locked,d3=locked");
    medalsLevel = localStorage.getItem("levels").split(",");
}

function ClearGameSession() {
    if(localStorage.getItem("game-session") != null) localStorage.removeItem("game-session"); // remove qualquer sessão de jogo existente
}

medalImages.forEach((e) => {
    let imgElement = e.children.item(0);

    let levelId = e.getAttribute("id");
    let levelCurrent = medalsLevel.find(value => new RegExp(levelId).test(value)).split("=")[1]; //procura o level correspondente

    imgElement.setAttribute("data-medal-level", levelCurrent);

    if(levelCurrent == "locked") {
        e.style.setProperty("cursor", "not-allowed");
        e.style.setProperty("box-shadow", "none");
        imgElement.src = imgElement.src.replace(/(\/clock-)(.*?)(\.)/, `/locked.`);
        setTimeout(() => imgElement.style.setProperty("opacity", "100%"), 50);
        return;
    }

    if(levelCurrent > 1) {
        goldenLevels++;
        if (goldenLevels >= medalImages.length) {
            difficultTexts.forEach(e => e.style.setProperty("color", "var(--color-golden)"));
            subTitle.style.setProperty("background", "var(--gradient-golden)");
        }
    }

    e.addEventListener("click", () => {
        localStorage.setItem("game-session", levelId);
        window.location.href = gameUrl;
    });

});