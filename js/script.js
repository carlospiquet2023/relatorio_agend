// ========================================
// TaskFlow - Sistema de Tarefas com Calendário
// ========================================

// Estado da aplicação
const state = {
    currentDate: new Date(),
    selectedDate: null,
    tasks: {},
    notebook: '',
    theme: 'light',
    currentFilter: 'all',
    streak: 0,
    totalTasksCompleted: 0,
    achievements: []
};

// ========================================
// Efeitos Visuais Premium
// ========================================
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#10b981', '#f59e0b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        document.body.appendChild(confetti);
        
        const duration = Math.random() * 3 + 2;
        const xMovement = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${xMovement}px, ${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => confetti.remove();
    }
}

function createSparkles(x, y) {
    const sparkleCount = 8;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#ffd700'];
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.width = '6px';
        sparkle.style.height = '6px';
        sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.boxShadow = '0 0 10px currentColor';
        
        document.body.appendChild(sparkle);
        
        const angle = (Math.PI * 2 * i) / sparkleCount;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        sparkle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => sparkle.remove();
    }
}

function addRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Sistema de Conquistas
const achievements = {
    'first_task': { name: '🎯 Primeira Tarefa', desc: 'Criou sua primeira tarefa!' },
    'week_streak': { name: '🔥 Sequência de 7 Dias', desc: '7 dias consecutivos!' },
    'task_master': { name: '💪 Mestre das Tarefas', desc: '100 tarefas criadas!' },
    'early_bird': { name: '🌅 Madrugador', desc: 'Criou tarefa antes das 6h!' },
    'night_owl': { name: '🦉 Coruja Noturna', desc: 'Criou tarefa depois das 23h!' },
    'productive_day': { name: '⚡ Dia Produtivo', desc: '10 tarefas em um dia!' }
};

function unlockAchievement(achievementId) {
    if (state.achievements.includes(achievementId)) return;
    
    state.achievements.push(achievementId);
    const achievement = achievements[achievementId];
    
    createConfetti();
    showToast(`🏆 Conquista Desbloqueada: ${achievement.name}`, 'success', 5000);
    saveToLocalStorage();
}

function checkAchievements() {
    const totalTasks = Object.values(state.tasks).flat().length;
    
    if (totalTasks === 1) unlockAchievement('first_task');
    if (totalTasks >= 100) unlockAchievement('task_master');
    
    const hour = new Date().getHours();
    if (hour < 6) unlockAchievement('early_bird');
    if (hour >= 23) unlockAchievement('night_owl');
    
    // Verificar dia produtivo
    const today = formatDateKey(new Date());
    if (state.tasks[today] && state.tasks[today].length >= 10) {
        unlockAchievement('productive_day');
    }
}

// ========================================
// Inicialização
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeTheme();
    renderCalendar();
    updateSummary();
    setupEventListeners();
    initializeAnimations();
    createFloatingParticles();
    showToast('🚀 TaskFlow carregado com sucesso!');
});

// Animações iniciais
function initializeAnimations() {
    // Fade in suave dos elementos
    const elements = document.querySelectorAll('.calendar-section, .summary-section, .toolbar');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Adicionar ripple a todos os botões
    document.querySelectorAll('.btn, .filter-btn, .priority-btn').forEach(btn => {
        btn.addEventListener('click', addRippleEffect);
    });
}

// Partículas flutuantes de fundo
function createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '-1';
    particlesContainer.style.overflow = 'hidden';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = (Math.random() * 6 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
        
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.animate([
            { transform: 'translateY(0) translateX(0)', opacity: 0 },
            { transform: `translateY(-${Math.random() * 100 + 50}px) translateX(${Math.random() * 100 - 50}px)`, opacity: 0.6 },
            { transform: `translateY(-${Math.random() * 200 + 100}px) translateX(${Math.random() * 200 - 100}px)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
        
        particlesContainer.appendChild(particle);
    }
}

// ========================================
// LocalStorage
// ========================================
function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('taskflow_tasks');
    const savedNotebook = localStorage.getItem('taskflow_notebook');
    const savedTheme = localStorage.getItem('taskflow_theme');
    
    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    }
    
    if (savedNotebook) {
        state.notebook = savedNotebook;
    }
    
    if (savedTheme) {
        state.theme = savedTheme;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('taskflow_notebook', state.notebook);
    localStorage.setItem('taskflow_theme', state.theme);
}

// ========================================
// Tema
// ========================================
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    saveToLocalStorage();
    showToast(`Tema ${state.theme === 'dark' ? 'escuro' : 'claro'} ativado`);
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

// ========================================
// Calendário
// ========================================
function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    // Atualizar título do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Limpar dias anteriores
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Primeiro dia do mês e total de dias
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = createDayElement(daysInPrevMonth - i, true, year, month - 1);
        calendarDays.appendChild(dayElement);
    }
    
    // Dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        const dayElement = createDayElement(day, false, year, month, isToday);
        calendarDays.appendChild(dayElement);
    }
    
    // Dias do próximo mês
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 semanas
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarDays.appendChild(dayElement);
    }
    
    updateFilterBadges();
}

function createDayElement(day, isOtherMonth, year, month, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    const dateKey = formatDateKey(new Date(year, month, day));
    const dayTasks = state.tasks[dateKey] || [];
    
    if (dayTasks.length > 0 && !isOtherMonth) {
        dayElement.classList.add('has-tasks');
    }
    
    // Número do dia
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Indicadores de tarefas
    if (dayTasks.length > 0 && !isOtherMonth) {
        const indicators = document.createElement('div');
        indicators.className = 'task-indicators';
        
        const priorities = { high: 0, medium: 0, low: 0 };
        dayTasks.forEach(task => {
            priorities[task.priority]++;
        });
        
        // Mostrar até 3 indicadores
        let dotsShown = 0;
        ['high', 'medium', 'low'].forEach(priority => {
            for (let i = 0; i < Math.min(priorities[priority], 3 - dotsShown); i++) {
                const dot = document.createElement('div');
                dot.className = `task-dot ${priority}`;
                indicators.appendChild(dot);
                dotsShown++;
            }
        });
        
        dayElement.appendChild(indicators);
        
        // Contador de tarefas
        if (dayTasks.length > 0) {
            const count = document.createElement('div');
            count.className = 'task-count';
            count.textContent = dayTasks.length;
            dayElement.appendChild(count);
        }
    }
    
    // Evento de clique
    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
            openTaskModal(new Date(year, month, day));
        });
    }
    
    return dayElement;
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

// ========================================
// Modal de Tarefas
// ========================================
function openTaskModal(date) {
    state.selectedDate = date;
    const modal = document.getElementById('taskModal');
    const dateInput = document.getElementById('taskDate');
    const taskText = document.getElementById('taskText');
    
    dateInput.value = formatDateDisplay(date);
    taskText.value = '';
    
    // Resetar botões de prioridade
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tarefas existentes
    displayExistingTasks(date);
    
    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    state.selectedDate = null;
}

function displayExistingTasks(date) {
    const container = document.getElementById('existingTasks');
    const dateKey = formatDateKey(date);
    const tasks = state.tasks[dateKey] || [];
    
    if (tasks.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<h4 style="margin-bottom: 1rem; color: var(--text-secondary);">Tarefas Existentes</h4>';
    
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority}`;
        
        const priorityEmoji = {
            high: '🔴',
            medium: '🟠',
            low: '🟢'
        };
        
        const priorityText = {
            high: 'Alta',
            medium: 'Média',
            low: 'Baixa'
        };
        
        taskElement.innerHTML = `
            <div class="task-header">
                <span class="task-priority">${priorityEmoji[task.priority]} ${priorityText[task.priority]}</span>
                <div class="task-actions">
                    <button class="btn-edit" onclick="editTask('${dateKey}', ${index})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteTask('${dateKey}', ${index})">🗑️ Excluir</button>
                </div>
            </div>
            <div class="task-text">
                ${task.time ? `<strong style="color: var(--primary-color);">🕐 ${task.time}</strong> - ` : ''}
                ${escapeHtml(task.text)}
            </div>
        `;
        
        container.appendChild(taskElement);
    });
}

async function saveTask() {
    const taskText = document.getElementById('taskText').value.trim();
    const selectedPriority = document.querySelector('.priority-btn.active');
    const taskTimeInput = document.getElementById('taskTime');
    
    if (!taskText) {
        showToast('⚠️ Digite uma tarefa!', 'warning');
        return;
    }
    
    if (!selectedPriority) {
        showToast('⚠️ Selecione uma prioridade!', 'warning');
        return;
    }

    if (!taskTimeInput || !taskTimeInput.value) {
        showToast('⚠️ Defina o horário da tarefa!', 'warning');
        return;
    }
    
    const dateKey = formatDateKey(state.selectedDate);
    const taskTime = taskTimeInput.value;
    
    // Criar objeto da tarefa
    const taskData = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: taskText,
        priority: selectedPriority.dataset.priority,
        date: dateKey,
        time: taskTime,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // Verificar se alarme está ativado
    const enableAlarm = document.getElementById('enableAlarm');
    const alarmMinutesBeforeInput = document.getElementById('alarmMinutesBefore');
    
    let alarmData = null;
    if (enableAlarm && enableAlarm.checked && alarmMinutesBeforeInput && alarmMinutesBeforeInput.value !== '') {
        const minutesBefore = parseInt(alarmMinutesBeforeInput.value);
        
        // Calcular horário do alarme
        const taskDateTime = new Date(dateKey + 'T' + taskTime);
        const alarmDateTime = new Date(taskDateTime.getTime() - minutesBefore * 60000);
        
        alarmData = {
            enabled: true,
            date: alarmDateTime.toISOString().split('T')[0],
            time: alarmDateTime.toTimeString().substring(0, 5),
            minutesBefore: minutesBefore
        };
    }

    // Salvar com alarme usando a nova função
    if (typeof saveTaskWithAlarm === 'function') {
        await saveTaskWithAlarm(taskData, alarmData);
    } else {
        // Fallback para método antigo
        if (!state.tasks[dateKey]) {
            state.tasks[dateKey] = [];
        }
        state.tasks[dateKey].push(taskData);
    }
    
    // Efeitos visuais ao salvar
    createConfetti();
    checkAchievements();
    
    renderCalendar();
    updateSummary();
    displayExistingTasks(state.selectedDate);
    
    // Limpar formulário
    document.getElementById('taskText').value = '';
    if (taskTimeInput) taskTimeInput.value = '';
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Limpar campos de alarme
    if (enableAlarm) enableAlarm.checked = false;
    if (alarmMinutesBeforeInput) alarmMinutesBeforeInput.value = '';
    
    const alarmFields = document.getElementById('alarmFields');
    if (alarmFields) {
        alarmFields.classList.add('hidden');
    }
    
    const alarmPreview = document.getElementById('alarmPreview');
    if (alarmPreview) {
        alarmPreview.classList.add('hidden');
    }
    
    // Remover seleção dos botões de alarme
    document.querySelectorAll('.btn-quick-alarm').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    showToast(alarmData ? '✅ Tarefa e alarme salvos! 🔔' : '✅ Tarefa salva com sucesso!');
}

function editTask(dateKey, index) {
    const task = state.tasks[dateKey][index];
    
    document.getElementById('taskText').value = task.text;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === task.priority) {
            btn.classList.add('active');
        }
    });
    
    // Remover tarefa antiga
    state.tasks[dateKey].splice(index, 1);
    if (state.tasks[dateKey].length === 0) {
        delete state.tasks[dateKey];
    }
    
    saveToLocalStorage();
    renderCalendar();
    updateSummary();
    displayExistingTasks(state.selectedDate);
    
    showToast('✏️ Editando tarefa...');
}

async function deleteTask(dateKey, index) {
    if (!confirm('Deseja realmente excluir esta tarefa?')) {
        return;
    }
    
    const task = state.tasks[dateKey][index];
    
    // Usar nova função que cancela alarmes
    if (typeof deleteTaskWithAlarm === 'function' && task.id) {
        await deleteTaskWithAlarm(task.id, dateKey);
    } else {
        // Fallback para método antigo
        state.tasks[dateKey].splice(index, 1);
        
        if (state.tasks[dateKey].length === 0) {
            delete state.tasks[dateKey];
        }
    }
    
    saveToLocalStorage();
    renderCalendar();
    updateSummary();
    displayExistingTasks(state.selectedDate);
    
    showToast('🗑️ Tarefa excluída!');
}

// ========================================
// Resumo e Estatísticas
// ========================================
function updateSummary() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    let totalTasks = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    
    Object.keys(state.tasks).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getMonth() === month && date.getFullYear() === year) {
            state.tasks[dateKey].forEach(task => {
                totalTasks++;
                if (task.priority === 'high') highPriority++;
                else if (task.priority === 'medium') mediumPriority++;
                else if (task.priority === 'low') lowPriority++;
            });
        }
    });
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('highPriorityTasks').textContent = highPriority;
    document.getElementById('mediumPriorityTasks').textContent = mediumPriority;
    document.getElementById('lowPriorityTasks').textContent = lowPriority;
}

function updateFilterBadges() {
    let all = 0, high = 0, medium = 0, low = 0;
    
    Object.values(state.tasks).forEach(tasks => {
        tasks.forEach(task => {
            all++;
            if (task.priority === 'high') high++;
            else if (task.priority === 'medium') medium++;
            else if (task.priority === 'low') low++;
        });
    });
    
    document.getElementById('badge-all').textContent = all;
    document.getElementById('badge-high').textContent = high;
    document.getElementById('badge-medium').textContent = medium;
    document.getElementById('badge-low').textContent = low;
}

function openStatistics() {
    const modal = document.getElementById('statsModal');
    
    let totalDays = 0;
    let totalTasks = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    
    Object.keys(state.tasks).forEach(dateKey => {
        totalDays++;
        state.tasks[dateKey].forEach(task => {
            totalTasks++;
            if (task.priority === 'high') highPriority++;
            else if (task.priority === 'medium') mediumPriority++;
            else if (task.priority === 'low') lowPriority++;
        });
    });
    
    const average = totalDays > 0 ? (totalTasks / totalDays).toFixed(1) : 0;
    
    document.getElementById('statDaysWithTasks').textContent = totalDays;
    document.getElementById('statTotalTasks').textContent = totalTasks;
    document.getElementById('statHighPriority').textContent = highPriority;
    document.getElementById('statMediumPriority').textContent = mediumPriority;
    document.getElementById('statLowPriority').textContent = lowPriority;
    document.getElementById('statAverage').textContent = average;
    
    // Atualizar gráfico
    const total = highPriority + mediumPriority + lowPriority;
    if (total > 0) {
        const highPercent = (highPriority / total * 100).toFixed(1);
        const mediumPercent = (mediumPriority / total * 100).toFixed(1);
        const lowPercent = (lowPriority / total * 100).toFixed(1);
        
        document.querySelector('.chart-fill.high').style.width = `${highPercent}%`;
        document.querySelector('.chart-fill.medium').style.width = `${mediumPercent}%`;
        document.querySelector('.chart-fill.low').style.width = `${lowPercent}%`;
        
        document.getElementById('chartHighValue').textContent = highPercent;
        document.getElementById('chartMediumValue').textContent = mediumPercent;
        document.getElementById('chartLowValue').textContent = lowPercent;
    }
    
    modal.classList.add('active');
}

// ========================================
// Caderno
// ========================================
function openNotebook() {
    const modal = document.getElementById('notebookModal');
    const textarea = document.getElementById('notebookText');
    
    textarea.value = state.notebook;
    updateNotebookInfo();
    
    modal.classList.add('active');
}

function updateNotebookInfo() {
    const text = document.getElementById('notebookText').value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    document.getElementById('charCount').textContent = `${charCount} caracteres`;
    document.getElementById('wordCount').textContent = `${wordCount} palavras`;
}

function saveNotebook() {
    state.notebook = document.getElementById('notebookText').value;
    saveToLocalStorage();
    
    const now = new Date();
    document.getElementById('lastSaved').textContent = `Salvo às ${now.toLocaleTimeString()}`;
    
    showToast('💾 Caderno salvo!');
}

function clearNotebook() {
    if (!confirm('Deseja realmente limpar o caderno?')) {
        return;
    }
    
    document.getElementById('notebookText').value = '';
    state.notebook = '';
    saveToLocalStorage();
    updateNotebookInfo();
    
    showToast('🗑️ Caderno limpo!');
}

// ========================================
// Exportação de Relatórios
// ========================================
function exportReport() {
    const tasks = [];
    
    Object.keys(state.tasks).sort().forEach(dateKey => {
        state.tasks[dateKey].forEach(task => {
            const date = new Date(dateKey);
            tasks.push({
                date: formatDateDisplay(date),
                text: task.text,
                priority: task.priority === 'high' ? '🔴 Alta' : 
                         task.priority === 'medium' ? '🟠 Média' : '🟢 Baixa'
            });
        });
    });
    
    if (tasks.length === 0) {
        showToast('⚠️ Não há tarefas para exportar!', 'warning');
        return;
    }
    
    // Criar HTML
    let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Tarefas - TaskFlow</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
                .info { margin: 20px 0; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
                td { padding: 12px; border-bottom: 1px solid #ddd; }
                tr:hover { background: #f9fafb; }
                .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📄 Relatório de Tarefas - TaskFlow</h1>
                <div class="info">
                    <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <p><strong>Total de Tarefas:</strong> ${tasks.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tarefa</th>
                            <th>Prioridade</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    tasks.forEach(task => {
        html += `
            <tr>
                <td>${task.date}</td>
                <td>${escapeHtml(task.text)}</td>
                <td>${task.priority}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
                <div class="footer">
                    <p>Gerado por TaskFlow - Sistema de Gerenciamento de Tarefas</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Download
    downloadFile(html, 'relatorio-tarefas.html', 'text/html');
    showToast('📄 Relatório exportado com sucesso!');
}

function exportNotebookPDF() {
    const text = document.getElementById('notebookText').value;
    
    if (!text.trim()) {
        showToast('⚠️ O caderno está vazio!', 'warning');
        return;
    }
    
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Caderno - TaskFlow</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.8; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                h1 { color: #4f46e5; }
                .content { white-space: pre-wrap; }
                .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📘 Caderno de Anotações</h1>
                <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div class="content">${escapeHtml(text)}</div>
            <div class="footer">
                <p>Gerado por TaskFlow</p>
            </div>
        </body>
        </html>
    `;
    
    downloadFile(html, 'caderno.html', 'text/html');
    showToast('📄 Caderno exportado!');
}

function exportNotebookTXT() {
    const text = document.getElementById('notebookText').value;
    
    if (!text.trim()) {
        showToast('⚠️ O caderno está vazio!', 'warning');
        return;
    }
    
    const content = `CADERNO DE ANOTAÇÕES - TASKFLOW\n` +
                   `Data: ${new Date().toLocaleString('pt-BR')}\n` +
                   `${'='.repeat(50)}\n\n${text}`;
    
    downloadFile(content, 'caderno.txt', 'text/plain');
    showToast('📝 Caderno exportado como TXT!');
}

// ========================================
// WhatsApp Integration
// ========================================

function openWhatsAppPrompt() {
    const text = document.getElementById('notebookText').value;
    
    if (!text.trim()) {
        showToast('⚠️ O caderno está vazio!', 'warning');
        return;
    }
    
    const whatsappModal = document.getElementById('whatsappModal');
    whatsappModal.classList.add('active');
    whatsappModal.style.display = 'block';
    
    // Focar no input
    setTimeout(() => {
        document.getElementById('whatsappNumber').focus();
    }, 100);
}

function closeWhatsAppPrompt() {
    const whatsappModal = document.getElementById('whatsappModal');
    whatsappModal.classList.remove('active');
    whatsappModal.style.display = 'none';
    document.getElementById('whatsappNumber').value = '';
}

function sendToWhatsApp() {
    const numberInput = document.getElementById('whatsappNumber');
    let number = numberInput.value.trim().replace(/\D/g, ''); // Remove tudo exceto números
    
    if (!number) {
        showToast('⚠️ Digite um número válido!', 'warning');
        numberInput.focus();
        return;
    }
    
    // Validar número brasileiro (DDD + 8 ou 9 dígitos)
    if (number.length < 10 || number.length > 11) {
        showToast('⚠️ Número inválido! Use: DDD + número (10 ou 11 dígitos)', 'warning');
        numberInput.focus();
        return;
    }
    
    // Adicionar código do país (+55)
    const fullNumber = '55' + number;
    
    // Pegar texto do caderno
    const text = document.getElementById('notebookText').value;
    
    // Formatar mensagem
    const message = `*📘 TASKFLOW - Caderno de Anotações*\n` +
                   `📅 Data: ${new Date().toLocaleString('pt-BR')}\n` +
                   `${'─'.repeat(30)}\n\n` +
                   `${text}`;
    
    // Criar URL do WhatsApp
    const whatsappURL = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
    
    // Animação de envio
    const confirmBtn = document.getElementById('confirmWhatsApp');
    confirmBtn.classList.add('whatsapp-sending');
    confirmBtn.textContent = '📤 Enviando...';
    
    setTimeout(() => {
        // Abrir WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Fechar modal
        closeWhatsAppPrompt();
        
        // Resetar botão
        confirmBtn.classList.remove('whatsapp-sending');
        confirmBtn.textContent = '✅ Enviar';
        
        showToast('✅ Abrindo WhatsApp...', 'success');
    }, 500);
}

// Permitir envio com Enter
document.addEventListener('DOMContentLoaded', () => {
    const whatsappInput = document.getElementById('whatsappNumber');
    if (whatsappInput) {
        whatsappInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendToWhatsApp();
            }
        });
        
        // Formatar número enquanto digita
        whatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            e.target.value = value;
        });
    }
});

// ========================================
// Backup e Importação
// ========================================
function backupData() {
    const data = {
        tasks: state.tasks,
        notebook: state.notebook,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    const filename = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    downloadFile(json, filename, 'application/json');
    showToast('💾 Backup criado com sucesso!');
}

function importData() {
    document.getElementById('importFile').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.tasks || !data.version) {
                throw new Error('Arquivo inválido');
            }
            
            if (!confirm('Importar dados? Isso substituirá todas as tarefas atuais!')) {
                return;
            }
            
            state.tasks = data.tasks || {};
            state.notebook = data.notebook || '';
            
            saveToLocalStorage();
            renderCalendar();
            updateSummary();
            
            showToast('📥 Dados importados com sucesso!');
        } catch (error) {
            showToast('❌ Erro ao importar arquivo!', 'error');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ========================================
// Filtros
// ========================================
function setFilter(filter) {
    state.currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    renderCalendar();
    showToast(`Filtro: ${filter === 'all' ? 'Todas' : filter === 'high' ? 'Alta' : filter === 'medium' ? 'Média' : 'Baixa'}`);
}

// ========================================
// Utilitários
// ========================================
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Tema
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navegação do calendário
    document.getElementById('prevMonth').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
        updateSummary();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
        updateSummary();
    });
    
    document.getElementById('todayBtn').addEventListener('click', () => {
        state.currentDate = new Date();
        renderCalendar();
        updateSummary();
    });
    
    // Modal de tarefas
    document.getElementById('closeModal').addEventListener('click', closeTaskModal);
    document.getElementById('cancelTask').addEventListener('click', closeTaskModal);
    document.getElementById('saveTask').addEventListener('click', saveTask);
    
    // Prioridade
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Caderno
    document.getElementById('openNotebook').addEventListener('click', openNotebook);
    document.getElementById('closeNotebook').addEventListener('click', () => {
        saveNotebook();
        document.getElementById('notebookModal').classList.remove('active');
    });
    document.getElementById('notebookText').addEventListener('input', updateNotebookInfo);
    document.getElementById('clearNotebook').addEventListener('click', clearNotebook);
    document.getElementById('sendWhatsApp').addEventListener('click', openWhatsAppPrompt);
    document.getElementById('cancelWhatsApp').addEventListener('click', closeWhatsAppPrompt);
    document.getElementById('confirmWhatsApp').addEventListener('click', sendToWhatsApp);
    document.getElementById('exportNotebookPDF').addEventListener('click', exportNotebookPDF);
    document.getElementById('exportNotebookTXT').addEventListener('click', exportNotebookTXT);
    
    // Estatísticas
    document.getElementById('openStats').addEventListener('click', openStatistics);
    document.getElementById('closeStats').addEventListener('click', () => {
        document.getElementById('statsModal').classList.remove('active');
    });
    
    // Exportação e backup
    document.getElementById('exportReport').addEventListener('click', exportReport);
    document.getElementById('backupData').addEventListener('click', backupData);
    document.getElementById('importData').addEventListener('click', importData);
    document.getElementById('importFile').addEventListener('change', handleImportFile);
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = btn.dataset.filter;
            state.currentFilter = filter;
            
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // ESC para fechar modais e command palette
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            document.getElementById('commandPalette').classList.remove('active');
        }
        
        // Ctrl/Cmd + K para abrir command palette
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
        
        // Ctrl/Cmd + S para salvar caderno
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            if (document.getElementById('notebookModal').classList.contains('active')) {
                e.preventDefault();
                saveNotebook();
            }
        }
        
        // Ctrl/Cmd + N para nova tarefa no dia atual
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openTaskModal(new Date());
        }
        
        // Ctrl/Cmd + E para exportar relatório
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportReport();
        }
        
        // Ctrl/Cmd + B para backup
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            backupData();
        }
    });
    
    // Setup command palette
    setupCommandPalette();
    
    // Setup license modal
    setupLicenseModal();
}

// ========================================
// License Modal
// ========================================
function setupLicenseModal() {
    const viewLicenseBtn = document.getElementById('viewLicense');
    const licenseModal = document.getElementById('licenseModal');
    const closeLicenseBtn = document.getElementById('closeLicense');
    
    viewLicenseBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        licenseModal.classList.add('active');
    });
    
    closeLicenseBtn?.addEventListener('click', () => {
        licenseModal.classList.remove('active');
    });
    
    licenseModal?.addEventListener('click', (e) => {
        if (e.target === licenseModal) {
            licenseModal.classList.remove('active');
        }
    });
}

// ========================================
// Command Palette System
// ========================================
const commands = [
    { icon: '📝', title: 'Nova Tarefa Hoje', desc: 'Criar nova tarefa no dia atual', shortcut: 'Ctrl+N', action: () => openTaskModal(new Date()) },
    { icon: '📘', title: 'Abrir Caderno', desc: 'Abrir bloco de anotações', action: openNotebook },
    { icon: '📊', title: 'Ver Estatísticas', desc: 'Visualizar estatísticas completas', action: openStatistics },
    { icon: '📄', title: 'Exportar Relatório', desc: 'Exportar todas as tarefas', shortcut: 'Ctrl+E', action: exportReport },
    { icon: '💾', title: 'Fazer Backup', desc: 'Salvar backup dos dados', shortcut: 'Ctrl+B', action: backupData },
    { icon: '📥', title: 'Importar Dados', desc: 'Restaurar backup anterior', action: importData },
    { icon: '🌙', title: 'Alternar Tema', desc: 'Mudar entre claro e escuro', action: toggleTheme },
    { icon: '🗑️', title: 'Limpar Caderno', desc: 'Apagar todas as anotações', action: clearNotebook },
    { icon: '📅', title: 'Ir para Hoje', desc: 'Voltar para o mês atual', action: () => { state.currentDate = new Date(); renderCalendar(); updateSummary(); } }
];

function toggleCommandPalette() {
    const palette = document.getElementById('commandPalette');
    const input = document.getElementById('commandInput');
    
    if (palette.classList.contains('active')) {
        palette.classList.remove('active');
    } else {
        palette.classList.add('active');
        input.value = '';
        renderCommandSuggestions('');
        setTimeout(() => input.focus(), 100);
    }
}

function setupCommandPalette() {
    const input = document.getElementById('commandInput');
    const palette = document.getElementById('commandPalette');
    
    input.addEventListener('input', (e) => {
        renderCommandSuggestions(e.target.value);
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const selected = document.querySelector('.command-item.selected');
            if (selected) {
                selected.click();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateCommands(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateCommands(-1);
        }
    });
    
    palette.addEventListener('click', (e) => {
        if (e.target === palette) {
            palette.classList.remove('active');
        }
    });
}

function renderCommandSuggestions(query) {
    const container = document.getElementById('commandSuggestions');
    const filtered = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.desc.toLowerCase().includes(query.toLowerCase())
    );
    
    container.innerHTML = filtered.map((cmd, index) => `
        <div class="command-item ${index === 0 ? 'selected' : ''}" onclick="executeCommand(${commands.indexOf(cmd)})">
            <span class="command-icon">${cmd.icon}</span>
            <div class="command-info">
                <div class="command-title">${cmd.title}</div>
                <div class="command-desc">${cmd.desc}</div>
            </div>
            ${cmd.shortcut ? `<span class="command-shortcut">${cmd.shortcut}</span>` : ''}
        </div>
    `).join('');
}

function navigateCommands(direction) {
    const items = document.querySelectorAll('.command-item');
    const current = document.querySelector('.command-item.selected');
    const currentIndex = Array.from(items).indexOf(current);
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    
    items.forEach(item => item.classList.remove('selected'));
    items[newIndex]?.classList.add('selected');
    items[newIndex]?.scrollIntoView({ block: 'nearest' });
}

function executeCommand(index) {
    const cmd = commands[index];
    cmd.action();
    document.getElementById('commandPalette').classList.remove('active');
    showToast(`✨ ${cmd.title} executado!`);
}

// ========================================
// Auto-save do caderno
// ========================================
setInterval(() => {
    if (document.getElementById('notebookModal').classList.contains('active')) {
        const currentText = document.getElementById('notebookText').value;
        if (currentText !== state.notebook) {
            saveNotebook();
        }
    }
}, 30000); // Auto-save a cada 30 segundos
