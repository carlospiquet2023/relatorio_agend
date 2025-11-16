/**
 * TaskFlow Integration - Integração IndexedDB + Alarmes
 * @author Carlos Antonio de Oliveira Piquet
 */

// ==================== INICIALIZAÇÃO ====================

let dbInitialized = false;
let alarmSystemInitialized = false;

async function initializeTaskFlow() {
    console.log('🚀 Inicializando TaskFlow...');

    try {
        // Inicializar IndexedDB
        await db.init();
        dbInitialized = true;

        // Verificar se há dados no LocalStorage para migrar
        const hasLocalData = localStorage.getItem('tasks') || 
                             localStorage.getItem('notebookContent') ||
                             localStorage.getItem('achievements');

        if (hasLocalData) {
            console.log('📦 Dados antigos encontrados no LocalStorage');
            const shouldMigrate = confirm('Foram encontrados dados antigos. Deseja migrar para o novo sistema de banco de dados?\n\nIsso permitirá armazenar milhares de registros e melhor performance.');
            
            if (shouldMigrate) {
                await db.migrateFromLocalStorage();
                alert('✅ Migração concluída com sucesso!');
            }
        }

        // Carregar dados do IndexedDB
        await loadDataFromDB();

        // Inicializar sistema de alarmes
        await alarmSystem.init();
        alarmSystemInitialized = true;

        console.log('✅ TaskFlow inicializado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao inicializar TaskFlow:', error);
        alert('Erro ao inicializar o sistema. Verifique o console para mais detalhes.');
    }
}

// ==================== CARREGAR DADOS ====================

async function loadDataFromDB() {
    try {
        // Carregar tarefas
        const tasks = await db.getAllTasks();
        state.tasks = {};
        tasks.forEach(task => {
            if (!state.tasks[task.date]) {
                state.tasks[task.date] = [];
            }
            state.tasks[task.date].push(task);
        });

        // Carregar notebook
        state.notebook = await db.getNotebook();
        const notebookArea = document.getElementById('notebookContent');
        if (notebookArea) {
            notebookArea.value = state.notebook;
        }

        // Carregar achievements
        const achievements = await db.getAllAchievements();
        if (achievements.length > 0) {
            state.achievements = achievements;
        } else {
            // Inicializar achievements padrão
            await initializeDefaultAchievements();
        }

        // Carregar tema
        const savedTheme = await db.getSetting('theme');
        if (savedTheme) {
            state.theme = savedTheme;
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        }

        console.log('📊 Dados carregados do IndexedDB');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function initializeDefaultAchievements() {
    const defaultAchievements = [
        { id: 'first_task', name: 'Primeira Tarefa', description: 'Criou sua primeira tarefa', unlocked: false, icon: '🎯' },
        { id: 'week_streak', name: 'Semana Produtiva', description: 'Completou tarefas por 7 dias seguidos', unlocked: false, icon: '🔥' },
        { id: 'task_master', name: 'Mestre das Tarefas', description: 'Completou 100 tarefas', unlocked: false, icon: '👑' },
        { id: 'early_bird', name: 'Madrugador', description: 'Completou uma tarefa antes das 6h', unlocked: false, icon: '🌅' },
        { id: 'night_owl', name: 'Coruja Noturna', description: 'Completou uma tarefa depois das 22h', unlocked: false, icon: '🦉' },
        { id: 'productive_day', name: 'Dia Produtivo', description: 'Completou 10 tarefas em um dia', unlocked: false, icon: '⚡' }
    ];

    for (const achievement of defaultAchievements) {
        await db.saveAchievement(achievement);
    }

    state.achievements = defaultAchievements;
}

// ==================== WRAPPER FUNCTIONS (compatibilidade com script.js antigo) ====================

// Substituir salvamento de tarefas
const originalSaveTasks = window.saveTasks;
window.saveTasks = async function() {
    // Não faz nada - o salvamento é feito diretamente no IndexedDB
    console.log('💾 Salvamento via IndexedDB');
};

// Substituir salvamento de notebook
const originalSaveNotebook = window.saveNotebook;
window.saveNotebookToDB = async function(content) {
    if (dbInitialized) {
        await db.saveNotebook(content);
        state.notebook = content;
    }
};

// Substituir salvamento de tema
window.saveThemeToDB = async function(theme) {
    if (dbInitialized) {
        await db.saveSetting('theme', theme);
        state.theme = theme;
    }
};

// Substituir salvamento de achievements
window.saveAchievementToDB = async function(achievement) {
    if (dbInitialized) {
        await db.saveAchievement(achievement);
    }
};

// ==================== FUNÇÕES DE TAREFAS COM ALARMES ====================

window.saveTaskWithAlarm = async function(taskData, alarmData = null) {
    try {
        // Salvar tarefa no IndexedDB
        if (taskData.id && await db.getTask(taskData.id)) {
            await db.updateTask(taskData);
        } else {
            await db.addTask(taskData);
        }

        // Atualizar estado local
        if (!state.tasks[taskData.date]) {
            state.tasks[taskData.date] = [];
        }
        
        const existingIndex = state.tasks[taskData.date].findIndex(t => t.id === taskData.id);
        if (existingIndex >= 0) {
            state.tasks[taskData.date][existingIndex] = taskData;
        } else {
            state.tasks[taskData.date].push(taskData);
        }

        // Agendar alarme se fornecido
        if (alarmData && alarmData.enabled && alarmSystemInitialized) {
            const alarmTime = new Date(alarmData.date + ' ' + alarmData.time);
            
            // Verificar se o alarme é no futuro
            if (alarmTime.getTime() > Date.now()) {
                await alarmSystem.scheduleAlarm(
                    taskData.id,
                    alarmTime,
                    `📋 ${taskData.text}`,
                    `Lembrete de tarefa!`
                );
                
                console.log('⏰ Alarme agendado para:', alarmTime);
            }
        }

        return true;
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        return false;
    }
};

window.deleteTaskWithAlarm = async function(taskId, date) {
    try {
        // Cancelar alarmes associados
        if (alarmSystemInitialized) {
            await alarmSystem.cancelTaskAlarms(taskId);
        }

        // Remover do IndexedDB
        await db.deleteTask(taskId);

        // Atualizar estado local
        if (state.tasks[date]) {
            state.tasks[date] = state.tasks[date].filter(t => t.id !== taskId);
        }

        return true;
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        return false;
    }
};

// ==================== CONFIGURAÇÃO DE ALARMES NA INTERFACE ====================

window.setupAlarmInterface = function() {
    const enableAlarmCheckbox = document.getElementById('enableAlarm');
    const alarmFields = document.getElementById('alarmFields');
    const quickAlarmButtons = document.querySelectorAll('.btn-quick-alarm');
    const taskTimeInput = document.getElementById('taskTime');
    const alarmPreview = document.getElementById('alarmPreview');
    const alarmPreviewTime = document.getElementById('alarmPreviewTime');
    const alarmMinutesBeforeInput = document.getElementById('alarmMinutesBefore');

    if (enableAlarmCheckbox && alarmFields) {
        enableAlarmCheckbox.addEventListener('change', function() {
            if (this.checked) {
                alarmFields.classList.remove('hidden');
                
                // Verificar se há horário de tarefa definido
                if (!taskTimeInput || !taskTimeInput.value) {
                    showToast('⚠️ Defina primeiro o horário da tarefa!', 'warning');
                    this.checked = false;
                    return;
                }
            } else {
                alarmFields.classList.add('hidden');
                if (alarmPreview) alarmPreview.classList.add('hidden');
                if (alarmMinutesBeforeInput) alarmMinutesBeforeInput.value = '';
                
                // Remover seleção dos botões
                quickAlarmButtons.forEach(btn => btn.classList.remove('selected'));
            }
        });
    }

    // Atualizar preview quando o horário da tarefa mudar
    if (taskTimeInput) {
        taskTimeInput.addEventListener('change', function() {
            if (enableAlarmCheckbox && enableAlarmCheckbox.checked && alarmMinutesBeforeInput && alarmMinutesBeforeInput.value) {
                updateAlarmPreview();
            }
        });
    }

    // Botões de atalho para alarme
    quickAlarmButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const minutes = parseInt(this.dataset.minutes);
            const taskDateInput = document.getElementById('taskDate');
            const taskTimeInput = document.getElementById('taskTime');
            
            if (!taskDateInput || !taskDateInput.value) {
                showToast('⚠️ Selecione primeiro uma data para a tarefa!', 'warning');
                return;
            }

            if (!taskTimeInput || !taskTimeInput.value) {
                showToast('⚠️ Defina primeiro o horário da tarefa!', 'warning');
                return;
            }

            // Remover seleção de outros botões
            quickAlarmButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Marcar este botão como selecionado
            this.classList.add('selected');

            // Armazenar os minutos antes
            if (alarmMinutesBeforeInput) {
                alarmMinutesBeforeInput.value = minutes;
            }

            // Ativar o checkbox se não estiver
            if (enableAlarmCheckbox && !enableAlarmCheckbox.checked) {
                enableAlarmCheckbox.checked = true;
                enableAlarmCheckbox.dispatchEvent(new Event('change'));
            }

            // Atualizar preview
            updateAlarmPreview();
        });
    });

    function updateAlarmPreview() {
        const taskDateInput = document.getElementById('taskDate');
        const taskTimeInput = document.getElementById('taskTime');
        const alarmMinutesBeforeInput = document.getElementById('alarmMinutesBefore');
        const alarmPreview = document.getElementById('alarmPreview');
        const alarmPreviewTime = document.getElementById('alarmPreviewTime');

        if (!taskDateInput || !taskTimeInput || !alarmMinutesBeforeInput || !alarmPreview || !alarmPreviewTime) {
            return;
        }

        const dateValue = taskDateInput.value;
        const timeValue = taskTimeInput.value;
        const minutesBefore = parseInt(alarmMinutesBeforeInput.value) || 0;

        // Validação rigorosa
        if (!dateValue || !timeValue || dateValue.trim() === '' || timeValue.trim() === '') {
            alarmPreview.classList.add('hidden');
            return;
        }

        try {
            // Calcular horário do alarme
            const [year, month, day] = dateValue.split('-').map(v => parseInt(v));
            const [hours, minutes] = timeValue.split(':').map(v => parseInt(v));
            
            // Validar valores
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
                alarmPreview.classList.add('hidden');
                return;
            }
            
            const taskDateTime = new Date(year, month - 1, day, hours, minutes);
            
            // Verificar se a data é válida
            if (isNaN(taskDateTime.getTime())) {
                alarmPreview.classList.add('hidden');
                return;
            }
            
            const alarmDateTime = new Date(taskDateTime.getTime() - minutesBefore * 60000);

            // Formatar data e hora
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const formattedDateTime = alarmDateTime.toLocaleDateString('pt-BR', options);

            alarmPreviewTime.textContent = formattedDateTime;
            alarmPreview.classList.remove('hidden');

            // Feedback visual
            alarmPreview.style.animation = 'none';
            setTimeout(() => {
                alarmPreview.style.animation = 'pulse 2s ease-in-out infinite';
            }, 10);
        } catch (error) {
            console.error('Erro ao calcular preview do alarme:', error);
            alarmPreview.classList.add('hidden');
        }
    }
};

// ==================== EXPORT/IMPORT COM INDEXEDDB ====================

window.exportDataFromDB = async function() {
    try {
        const data = await db.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        showToast('✅ Backup exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showToast('❌ Erro ao exportar dados', 'error');
    }
};

window.importDataToDB = async function(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const success = await db.importData(data);
        
        if (success) {
            await loadDataFromDB();
            
            // Atualizar interface
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
            
            showToast('✅ Dados importados com sucesso!', 'success');
            
            // Recarregar alarmes
            if (alarmSystemInitialized) {
                await alarmSystem.loadActiveAlarms();
            }
        } else {
            showToast('❌ Erro ao importar dados', 'error');
        }
    } catch (error) {
        console.error('Erro ao importar:', error);
        showToast('❌ Arquivo inválido', 'error');
    }
};

// ==================== ESTATÍSTICAS COM INDEXEDDB ====================

window.getStatsFromDB = async function() {
    const allTasks = await db.getAllTasks();
    
    const stats = {
        total: allTasks.length,
        completed: allTasks.filter(t => t.completed).length,
        pending: allTasks.filter(t => !t.completed).length,
        high: allTasks.filter(t => t.priority === 'high').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        low: allTasks.filter(t => t.priority === 'low').length,
        byDate: {}
    };

    allTasks.forEach(task => {
        if (!stats.byDate[task.date]) {
            stats.byDate[task.date] = { total: 0, completed: 0 };
        }
        stats.byDate[task.date].total++;
        if (task.completed) {
            stats.byDate[task.date].completed++;
        }
    });

    return stats;
};

// ==================== SOLICITAR PERMISSÃO DE NOTIFICAÇÕES ====================

window.requestNotificationPermission = async function() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            showToast('✅ Notificações ativadas!', 'success');
            new Notification('TaskFlow', {
                body: 'Você receberá lembretes das suas tarefas!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">✅</text></svg>'
            });
        }
    }
};

// ==================== INICIALIZAÇÃO AUTOMÁTICA ====================

document.addEventListener('DOMContentLoaded', async function() {
    await initializeTaskFlow();
    setupAlarmInterface();
    
    // Solicitar permissão de notificações após 2 segundos
    setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            const banner = document.createElement('div');
            banner.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 9999;
                max-width: 350px;
                animation: slideInRight 0.5s ease;
            `;
            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">🔔</div>
                    <div style="flex: 1;">
                        <strong>Ativar Notificações?</strong>
                        <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9;">
                            Receba lembretes das suas tarefas
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button id="allowNotif" style="flex: 1; padding: 0.5rem; background: white; color: #667eea; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                        ✅ Permitir
                    </button>
                    <button id="denyNotif" style="flex: 1; padding: 0.5rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Agora não
                    </button>
                </div>
            `;
            document.body.appendChild(banner);

            document.getElementById('allowNotif').onclick = async () => {
                await requestNotificationPermission();
                banner.remove();
            };

            document.getElementById('denyNotif').onclick = () => {
                banner.remove();
            };
        }
    }, 2000);
});
