/**
 * TaskFlow - Integração com Electron
 * Adapta funcionalidades web para desktop
 */

// Verificar se está rodando no Electron
const isElectron = typeof window !== 'undefined' && 
                   window.electronAPI !== undefined;

if (isElectron) {
    console.log('🖥️ Rodando no Electron Desktop');

    // Integrar notificações do Electron
    const originalShowNotification = window.Notification;
    
    // Sobrescrever notificações para usar Electron quando disponível
    if (window.electronAPI && window.electronAPI.showNotification) {
        // Manter compatibilidade com código existente
        window.showElectronNotification = function(title, body) {
            window.electronAPI.showNotification(title, body);
        };
    }

    // Listeners de menu
    if (window.electronAPI) {
        // Nova tarefa (Ctrl+N)
        window.electronAPI.onMenuNewTask(() => {
            if (typeof openTaskModal === 'function') {
                openTaskModal(new Date());
            }
        });

        // Exportar (Ctrl+E)
        window.electronAPI.onMenuExport(() => {
            if (typeof exportReport === 'function') {
                exportReport();
            }
        });

        // Backup (Ctrl+B)
        window.electronAPI.onMenuBackup(() => {
            if (typeof backupData === 'function') {
                backupData();
            }
        });

        // Caderno (Ctrl+K)
        window.electronAPI.onMenuNotebook(() => {
            if (typeof openNotebook === 'function') {
                openNotebook();
            }
        });

        // Estatísticas
        window.electronAPI.onMenuStats(() => {
            if (typeof openStatistics === 'function') {
                openStatistics();
            }
        });

        // Alternar tema (Ctrl+T)
        window.electronAPI.onMenuToggleTheme(() => {
            if (typeof toggleTheme === 'function') {
                toggleTheme();
            }
        });

        // Sobre
        window.electronAPI.onMenuAbout(() => {
            const modal = document.getElementById('licenseModal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }

    // Atualizar badge de tarefas pendentes
    window.updateTaskBadge = function() {
        if (window.electronAPI && window.electronAPI.setBadge) {
            const today = new Date();
            const dateKey = formatDateKey(today);
            const todayTasks = state.tasks[dateKey] || [];
            const pendingCount = todayTasks.filter(t => !t.completed).length;
            
            window.electronAPI.setBadge(pendingCount);
        }
    };

    // Chamar updateTaskBadge sempre que tarefas mudarem
    const originalSaveTask = window.saveTask;
    if (typeof originalSaveTask === 'function') {
        window.saveTask = async function() {
            await originalSaveTask.apply(this, arguments);
            if (window.updateTaskBadge) {
                window.updateTaskBadge();
            }
        };
    }

    // Atualizar badge ao carregar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.updateTaskBadge) {
                window.updateTaskBadge();
            }
        }, 1000);
    });

    // Integrar notificações de alarme com Electron
    if (typeof alarmSystem !== 'undefined') {
        const originalShowBrowserNotification = alarmSystem.showBrowserNotification;
        
        alarmSystem.showBrowserNotification = function(titulo, mensagem) {
            // Tentar usar Electron primeiro
            if (window.electronAPI && window.electronAPI.showNotification) {
                window.electronAPI.showNotification(titulo, mensagem);
            }
            
            // Fallback para notificação web
            if (originalShowBrowserNotification) {
                originalShowBrowserNotification.call(this, titulo, mensagem);
            }
        };
    }

    console.log('✅ Integração Electron configurada');
} else {
    console.log('🌐 Rodando no navegador web');
}
