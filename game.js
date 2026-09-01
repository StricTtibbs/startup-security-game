// Game State
const gameState = {
    day: 1,
    cash: 50000,
    reputation: 50,
    employees: [],
    projects: [],
    research: [],
    contracts: [],
    upgrades: {},
    news: [],
    events: [],
    alerts: [],
    monthlyRevenue: 0,
    monthlyExpenses: 5000,
};

// Employee Roles
const EMPLOYEE_ROLES = {
    'security-expert': { name: 'Security Expert', cost: 8000, bonus: 'security' },
    'developer': { name: 'Developer', cost: 6000, bonus: 'speed' },
    'business-manager': { name: 'Business Manager', cost: 5000, bonus: 'negotiation' },
    'security-analyst': { name: 'Security Analyst', cost: 4500, bonus: 'detection' },
};

// Initialize Game
function initGame() {
    setupEventListeners();
    updateUI();
    addNewsItem('Game started! You are the CEO of a new cybersecurity startup.');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Hiring
    document.querySelectorAll('.hire-btn').forEach(btn => {
        btn.addEventListener('click', () => hireEmployee(btn.dataset.role));
    });

    // Projects
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => allocateResources(btn.dataset.project));
    });

    document.getElementById('new-project-btn')?.addEventListener('click', newProject);

    // Research
    document.querySelectorAll('.research-btn').forEach(btn => {
        btn.addEventListener('click', () => investInResearch(btn.dataset.research));
    });

    // Upgrades
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => purchaseUpgrade(btn.dataset.upgrade));
    });

    // Advance Day
    document.getElementById('advance-day-btn').addEventListener('click', advanceDay);
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Hiring System
function hireEmployee(role) {
    const roleData = EMPLOYEE_ROLES[role];
    
    if (gameState.cash < roleData.cost) {
        addAlert('❌ Not enough cash to hire ' + roleData.name);
        return;
    }

    gameState.cash -= roleData.cost;
    gameState.employees.push({
        id: Date.now(),
        role: role,
        name: generateEmployeeName(),
        morale: 100,
        bonus: roleData.bonus,
    });

    gameState.monthlyExpenses += roleData.cost;
    addNewsItem(`✅ Hired a new ${roleData.name}!`);
    updateUI();
}

function generateEmployeeName() {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn'];
    const lastNames = ['Smith', 'Chen', 'Patel', 'Johnson', 'Garcia', 'Lee', 'Brown', 'Martinez'];
    return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
}

// Project Management
function allocateResources(projectId) {
    const amount = prompt(`How much to allocate to project ${projectId}? (e.g., 5000)`);
    if (!amount || isNaN(amount)) return;

    const numAmount = parseInt(amount);
    if (gameState.cash < numAmount) {
        addAlert('❌ Not enough cash!');
        return;
    }

    gameState.cash -= numAmount;
    let project = gameState.projects.find(p => p.id == projectId);
    if (project) {
        project.progress += Math.min(numAmount / 500, 50);
        if (project.progress > 100) project.progress = 100;
    }
    updateUI();
}

function newProject() {
    const name = prompt('Project name:');
    const revenue = prompt('Monthly revenue when complete:');
    
    if (!name || !revenue) return;

    gameState.projects.push({
        id: gameState.projects.length + 1,
        name: name,
        progress: 0,
        revenue: parseInt(revenue),
        complete: false,
    });
    updateUI();
}

// Research System
function investInResearch(researchId) {
    if (gameState.cash < 10000) {
        addAlert('❌ Not enough cash for research investment!');
        return;
    }

    gameState.cash -= 10000;
    let research = gameState.research.find(r => r.id == researchId);
    if (!research) {
        gameState.research.push({
            id: researchId,
            progress: 0,
        });
        research = gameState.research[gameState.research.length - 1];
    }
    research.progress += 20;
    addNewsItem(`📚 Invested in research. Progress: ${research.progress}%`);
    updateUI();
}

// Upgrade System
function purchaseUpgrade(upgradeType) {
    const upgrades = {
        'office': { name: 'Office Expansion', cost: 20000, bonus: 'capacity' },
        'servers': { name: 'Server Farm', cost: 30000, bonus: 'speed' },
        'lab': { name: 'Lab Equipment', cost: 15000, bonus: 'research' },
    };

    const upgrade = upgrades[upgradeType];
    if (gameState.cash < upgrade.cost) {
        addAlert('❌ Not enough cash for upgrade!');
        return;
    }

    gameState.cash -= upgrade.cost;
    gameState.upgrades[upgradeType] = true;
    addNewsItem(`⚡ Purchased ${upgrade.name}!`);
    updateUI();
}

// Advance Day
function advanceDay() {
    gameState.day++;

    // Process projects
    gameState.projects.forEach(project => {
        if (!project.complete && project.progress < 100) {
            const developersCount = gameState.employees.filter(e => e.bonus === 'speed').length;
            project.progress += 2 + (developersCount * 1.5);
            if (project.progress > 100) {
                project.progress = 100;
                project.complete = true;
                gameState.reputation += 10;
                addNewsItem(`🎉 Project "${project.name}" completed!`);
            }
        }
        if (project.complete) {
            gameState.monthlyRevenue += project.revenue / 30;
        }
    });

    // Deduct expenses
    gameState.cash -= gameState.monthlyExpenses / 30;

    // Random events
    triggerRandomEvent();

    // Check game over
    if (gameState.cash < 0) {
        endGame('💸 Bankruptcy! Your company ran out of money.');
        return;
    }

    // Check win condition
    if (gameState.reputation >= 100 && gameState.cash >= 100000) {
        endGame('🏆 Success! Your security company is thriving!');
        return;
    }

    updateUI();
}

// Random Events
function triggerRandomEvent() {
    const events = [
        {
            text: '🎯 Major contract opportunity discovered!',
            effect: () => { gameState.cash += 5000; gameState.reputation += 5; }
        },
        {
            text: '⚠️ Security breach discovered. Must allocate resources to fix.',
            effect: () => { gameState.cash -= 2000; gameState.reputation -= 5; }
        },
        {
            text: '📈 Market demand for security solutions is rising!',
            effect: () => { gameState.monthlyRevenue += 1000; }
        },
        {
            text: '😤 Employee requests raise.',
            effect: () => { gameState.monthlyExpenses += 500; }
        },
        {
            text: '🎓 Team completes training course.',
            effect: () => { gameState.reputation += 3; }
        },
    ];

    if (Math.random() > 0.7) {
        const event = events[Math.floor(Math.random() * events.length)];
        addNewsItem(event.text);
        event.effect();
    }
}

// UI Updates
function updateUI() {
    // Header stats
    document.getElementById('cash').textContent = gameState.cash.toFixed(0);
    document.getElementById('reputation').textContent = gameState.reputation.toFixed(0);
    document.getElementById('employees').textContent = gameState.employees.length + 1;
    document.getElementById('day').textContent = gameState.day;

    // Dashboard
    document.getElementById('monthly-revenue').textContent = gameState.monthlyRevenue.toFixed(0);
    document.getElementById('monthly-expenses').textContent = gameState.monthlyExpenses.toFixed(0);
    document.getElementById('net-income').textContent = (gameState.monthlyRevenue - gameState.monthlyExpenses).toFixed(0);

    // Projects
    updateProjectProgress();

    // Research
    updateResearchProgress();

    // Team Roster
    updateTeamRoster();
}

function updateProjectProgress() {
    gameState.projects.forEach(project => {
        const element = document.getElementById(`project-${project.id}-progress`);
        if (element) {
            element.style.width = Math.min(project.progress, 100) + '%';
        }
    });
}

function updateResearchProgress() {
    gameState.research.forEach(research => {
        const element = document.getElementById(`research-${research.id}-progress`);
        if (element) {
            element.style.width = Math.min(research.progress, 100) + '%';
        }
    });
}

function updateTeamRoster() {
    const rosterList = document.getElementById('roster-list');
    rosterList.innerHTML = '';
    
    gameState.employees.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'team-member';
        div.innerHTML = `<strong>${emp.name}</strong> - ${EMPLOYEE_ROLES[emp.role].name} (Morale: ${emp.morale}%)`;
        rosterList.appendChild(div);
    });
}

// News and Alerts
function addNewsItem(text) {
    gameState.news.unshift(text);
    if (gameState.news.length > 5) gameState.news.pop();
    updateNewsFeed();
}

function addAlert(text) {
    gameState.alerts.unshift(text);
    if (gameState.alerts.length > 5) gameState.alerts.pop();
    updateAlerts();
}

function updateNewsFeed() {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';
    gameState.news.forEach(item => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.textContent = item;
        feed.appendChild(div);
    });
}

function updateAlerts() {
    const alerts = document.getElementById('alerts-list');
    alerts.innerHTML = '';
    gameState.alerts.forEach(item => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.textContent = item;
        alerts.appendChild(div);
    });
}

// Game Over
function endGame(message) {
    alert(message);
    alert(`Final Stats:\n💰 Cash: $${gameState.cash.toFixed(0)}\n📊 Reputation: ${gameState.reputation}\n👥 Employees: ${gameState.employees.length}\n⏰ Days Survived: ${gameState.day}`);
    location.reload();
}

// Start Game
window.addEventListener('DOMContentLoaded', initGame);