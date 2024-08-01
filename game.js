const boardSize = 35;
const initialAssets = 100;
const facilityCost = 20;
const gameBoard = document.getElementById('gameBoard');
const status = document.getElementById('status');
const resetButton = document.getElementById('resetButton');
const addCountryButton = document.getElementById('addCountryButton');
const addShipButton = document.getElementById('addShipButton');
const updatePoliciesButton = document.getElementById('updatePoliciesButton');
const declareWarButton = document.getElementById('declareWarButton');
const manageDiplomacyButton = document.getElementById('manageDiplomacyButton');
const manageEconomyButton = document.getElementById('manageEconomyButton');
const manageMilitaryButton = document.getElementById('manageMilitaryButton');
const researchTechButton = document.getElementById('researchTechButton');
const setGovernmentButton = document.getElementById('setGovernmentButton');
const propagandaButton = document.getElementById('propagandaButton');
const triggerEventButton = document.getElementById('triggerEventButton');
const buildFacilityButton = document.getElementById('buildFacilityButton');
const createFortButton = document.getElementById('createFortButton');
const commandCountryButton = document.getElementById('commandCountryButton');
const manageAssetsButton = document.getElementById('manageAssetsButton');
const handleArmyDeathButton = document.getElementById('handleArmyDeathButton');
const handleNationCollapseButton = document.getElementById('handleNationCollapseButton');
const switchCountryButton = document.getElementById('switchCountryButton');

let selectedCell = null;
let units = [];
let ships = [];
let countries = [];
let forts = [];
let assets = {};
let currentCountry = null;

function createBoard() {
    gameBoard.innerHTML = ''; // 既存のセルをクリア
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.style.width = `${100 / boardSize}%`;
        cell.style.height = `${100 / boardSize}%`;
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

function loadGame() {
    const savedUnits = JSON.parse(localStorage.getItem('units')) || [];
    const savedShips = JSON.parse(localStorage.getItem('ships')) || [];
    const savedCountries = JSON.parse(localStorage.getItem('countries')) || [];
    const savedForts = JSON.parse(localStorage.getItem('forts')) || [];
    const savedAssets = JSON.parse(localStorage.getItem('assets')) || {};
    currentCountry = localStorage.getItem('currentCountry') || null;

    units = savedUnits.map(unit => {
        const cell = document.querySelector(`.cell[data-index="${unit.index}"]`);
        cell.classList.add('unit');
        return { ...unit, element: cell };
    });

    ships = savedShips.map(ship => {
        const cell = document.querySelector(`.cell[data-index="${ship.index}"]`);
        cell.classList.add('ship');
        return { ...ship, element: cell };
    });

    countries = savedCountries.map(country => {
        const cell = document.querySelector(`.cell[data-index="${country.index}"]`);
        cell.classList.add('country');
        return { ...country, element: cell };
    });

    forts = savedForts.map(fort => {
        const cell = document.querySelector(`.cell[data-index="${fort.index}"]`);
        cell.classList.add('fort');
        return { ...fort, element: cell };
    });

    assets = savedAssets;
    updateStatus();
}

function saveGame() {
    localStorage.setItem('units', JSON.stringify(units));
    localStorage.setItem('ships', JSON.stringify(ships));
    localStorage.setItem('countries', JSON.stringify(countries));
    localStorage.setItem('forts', JSON.stringify(forts));
    localStorage.setItem('assets', JSON.stringify(assets));
    localStorage.setItem('currentCountry', currentCountry);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index, 10);

    if (selectedCell) {
        if (cell !== selectedCell && !cell.classList.contains('unit') && !cell.classList.contains('ship')) {
            if (selectedCell.classList.contains('unit')) {
                moveUnit(selectedCell, cell);
            } else if (selectedCell.classList.contains('ship')) {
                moveShip(selectedCell, cell);
            }
        }
        selectedCell.classList.remove('selected');
        selectedCell = null;
    } else if (cell.classList.contains('unit') || cell.classList.contains('ship')) {
        cell.classList.add('selected');
        selectedCell = cell;
    }
}

function moveUnit(fromCell, toCell) {
    if (!currentCountry) {
        alert('国を選択してください');
        return;
    }

    if (!assets[currentCountry] || assets[currentCountry] < 0) {
        alert('資産が不足しています');
        return;
    }

    const fromIndex = parseInt(fromCell.dataset.index, 10);
    const toIndex = parseInt(toCell.dataset.index, 10);

    const unit = units.find(u => u.index === fromIndex);
    if (unit) {
        unit.index = toIndex;
        unit.element = toCell;
        toCell.classList.add('unit');
        fromCell.classList.remove('unit');
    }

    saveGame();
    updateStatus();
}

function moveShip(fromCell, toCell) {
    if (!currentCountry) {
        alert('国を選択してください');
        return;
    }

    if (!assets[currentCountry] || assets[currentCountry] < 0) {
        alert('資産が不足しています');
        return;
    }

    const fromIndex = parseInt(fromCell.dataset.index, 10);
    const toIndex = parseInt(toCell.dataset.index, 10);

    const ship = ships.find(s => s.index === fromIndex);
    if (ship) {
        ship.index = toIndex;
        ship.element = toCell;
        toCell.classList.add('ship');
        fromCell.classList.remove('ship');
    }

    saveGame();
    updateStatus();
}

function addCountry() {
    const emptyCells = Array.from(document.querySelectorAll('.cell')).filter(cell => !cell.classList.contains('unit') && !cell.classList.contains('ship') && !cell.classList.contains('country') && !cell.classList.contains('fort'));
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.classList.add('country');
        const country = { index: parseInt(randomCell.dataset.index, 10), element: randomCell, assets: initialAssets };
        countries.push(country);
        assets[countries.length - 1] = initialAssets;
        saveGame();
        updateStatus();
    }
}

function addShip() {
    const emptyCells = Array.from(document.querySelectorAll('.cell')).filter(cell => !cell.classList.contains('unit') && !cell.classList.contains('ship'));
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.classList.add('ship');
        ships.push({ index: parseInt(randomCell.dataset.index, 10), element: randomCell });
        saveGame();
        updateStatus();
    }
}

function updatePolicies() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 20) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 20;
    alert('政策を更新しました');
    saveGame();
    updateStatus();
}

function declareWar() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 30) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 30;
    alert('戦争を宣言しました');
    saveGame();
    updateStatus();
}

function manageDiplomacy() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 10) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 10;
    alert('外交関係を管理しました');
    saveGame();
    updateStatus();
}

function manageEconomy() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 15) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 15;
    alert('経済を管理しました');
    saveGame();
    updateStatus();
}

function manageMilitary() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 25) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 25;
    alert('軍事を管理しました');
    saveGame();
    updateStatus();
}

function researchTech() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 40) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 40;
    alert('技術を研究しました');
    saveGame();
    updateStatus();
}

function setGovernment() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 35) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 35;
    alert('政府を設定しました');
    saveGame();
    updateStatus();
}

function propaganda() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 5) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 5;
    alert('宣伝活動を行いました');
    saveGame();
    updateStatus();
}

function triggerEvent() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < 50) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= 50;
    alert('イベントを発生させました');
    saveGame();
    updateStatus();
}

function buildFacility() {
    if (!currentCountry || !assets[currentCountry] || assets[currentCountry] < facilityCost) {
        alert('資産が不足しています');
        return;
    }
    assets[currentCountry] -= facilityCost;
    alert('施設を建設しました');
    saveGame();
    updateStatus();
}

function createFort() {
    const emptyCells = Array.from(document.querySelectorAll('.cell')).filter(cell => !cell.classList.contains('unit') && !cell.classList.contains('ship') && !cell.classList.contains('country') && !cell.classList.contains('fort'));
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.classList.add('fort');
        forts.push({ index: parseInt(randomCell.dataset.index, 10), element: randomCell });
        saveGame();
        updateStatus();
    }
}

function commandCountry() {
    if (!currentCountry || !assets[currentCountry]) {
        alert('国が選択されていません');
        return;
    }
    alert(`現在の国: ${currentCountry}, 資産: ${assets[currentCountry]}`);
}

function manageAssets() {
    if (!currentCountry || !assets[currentCountry]) {
        alert('国が選択されていません');
        return;
    }
    alert(`現在の国: ${currentCountry}, 資産: ${assets[currentCountry]}`);
}

function handleArmyDeath() {
    alert('軍隊の死亡処理を行いました');
}

function handleNationCollapse() {
    alert('国の崩壊処理を行いました');
}

function switchCountry() {
    currentCountry = prompt('切り替えたい国の名前を入力してください:');
    if (currentCountry && assets[currentCountry] !== undefined) {
        alert(`現在の国は ${currentCountry} です。`);
    } else {
        alert('無効な国名です。');
    }
}

function updateStatus() {
    status.textContent = `現在の国: ${currentCountry || 'なし'}, 資産: ${assets[currentCountry] || 0}`;
}

resetButton.addEventListener('click', () => {
    createBoard();
    loadGame();
});

addCountryButton.addEventListener('click', addCountry);
addShipButton.addEventListener('click', addShip);
updatePoliciesButton.addEventListener('click', updatePolicies);
declareWarButton.addEventListener('click', declareWar);
manageDiplomacyButton.addEventListener('click', manageDiplomacy);
manageEconomyButton.addEventListener('click', manageEconomy);
manageMilitaryButton.addEventListener('click', manageMilitary);
researchTechButton.addEventListener('click', researchTech);
setGovernmentButton.addEventListener('click', setGovernment);
propagandaButton.addEventListener('click', propaganda);
triggerEventButton.addEventListener('click', triggerEvent);
buildFacilityButton.addEventListener('click', buildFacility);
createFortButton.addEventListener('click', createFort);
commandCountryButton.addEventListener('click', commandCountry);
manageAssetsButton.addEventListener('click', manageAssets);
handleArmyDeathButton.addEventListener('click', handleArmyDeath);
handleNationCollapseButton.addEventListener('click', handleNationCollapse);
switchCountryButton.addEventListener('click', switchCountry);

createBoard();
loadGame();
