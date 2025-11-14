// ========================================
// TaskFlow Configuration
// Personalize seu sistema aqui!
// ========================================

const CONFIG = {
    // Animações
    animations: {
        enabled: true,
        confetti: true,
        sparkles: true,
        particles: true,
        ripple: true,
        duration: 300 // ms
    },
    
    // Conquistas
    achievements: {
        enabled: true,
        showNotifications: true
    },
    
    // Auto-save
    autoSave: {
        enabled: true,
        interval: 30000 // 30 segundos
    },
    
    // Tema
    theme: {
        default: 'light', // 'light' ou 'dark'
        autoSwitch: false, // Alterna automaticamente com horário
        switchTime: {
            dark: 18, // Hora para ativar tema escuro
            light: 6  // Hora para ativar tema claro
        }
    },
    
    // Notificações
    notifications: {
        duration: 3000, // ms
        position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        sound: false
    },
    
    // Calendário
    calendar: {
        firstDayOfWeek: 0, // 0 = Domingo, 1 = Segunda
        showWeekNumbers: false,
        highlightWeekends: true
    },
    
    // Exportação
    export: {
        defaultFormat: 'html', // 'html', 'pdf', 'json'
        includeSummary: true,
        includeStats: true
    },
    
    // Cores Personalizadas (opcional)
    customColors: {
        // primary: '#4f46e5',
        // secondary: '#10b981',
        // danger: '#ef4444'
    },
    
    // Features Experimentais
    experimental: {
        voiceInput: false,
        ai: false,
        sync: false
    }
};

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
