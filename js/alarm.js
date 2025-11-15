/**
 * TaskFlow Alarm System - Sistema de Alarmes e Notificações
 * @author Carlos Antonio de Oliveira Piquet
 */

class AlarmSystem {
    constructor() {
        this.activeAlarms = [];
        this.checkInterval = null;
        this.audioElement = null;
        this.notificationPermission = false;
    }

    /**
     * Inicializa o sistema de alarmes
     */
    async init() {
        // Criar elemento de áudio
        this.createAudioElement();

        // Solicitar permissão para notificações
        await this.requestNotificationPermission();

        // Carregar alarmes ativos do banco
        await this.loadActiveAlarms();

        // Iniciar verificação periódica
        this.startAlarmCheck();

        console.log('⏰ Sistema de alarmes inicializado');
    }

    /**
     * Cria elemento de áudio para alarmes
     */
    createAudioElement() {
        this.audioElement = document.getElementById('somAlarme');
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'somAlarme';
            this.audioElement.preload = 'auto';
            // Usando data URL para som de alarme
            this.audioElement.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUREOXKLS8cmCMwYhc8Tv5p1NFBEORJ/Y8sR2JAU=';
            document.body.appendChild(this.audioElement);
        }
    }

    /**
     * Solicita permissão para notificações do navegador
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            
            if (this.notificationPermission) {
                console.log('✅ Permissão de notificações concedida');
            } else {
                console.log('⚠️ Permissão de notificações negada');
            }
        }
    }

    /**
     * Carrega alarmes ativos do banco de dados
     */
    async loadActiveAlarms() {
        try {
            this.activeAlarms = await db.getActiveAlarms();
            console.log(`📋 ${this.activeAlarms.length} alarmes ativos carregados`);
        } catch (error) {
            console.error('Erro ao carregar alarmes:', error);
            this.activeAlarms = [];
        }
    }

    /**
     * Inicia verificação periódica de alarmes
     */
    startAlarmCheck() {
        // Verificar a cada segundo
        this.checkInterval = setInterval(() => {
            this.checkAlarms();
        }, 1000);
    }

    /**
     * Para verificação de alarmes
     */
    stopAlarmCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Verifica se algum alarme deve ser disparado
     */
    async checkAlarms() {
        const now = Date.now();

        for (const alarm of this.activeAlarms) {
            if (!alarm.triggered && now >= alarm.alarmTime) {
                await this.triggerAlarm(alarm);
            }
        }
    }

    /**
     * Dispara um alarme
     */
    async triggerAlarm(alarm) {
        console.log('🔔 Alarme disparado:', alarm);

        // Marcar como disparado no banco
        alarm.triggered = true;
        alarm.triggeredAt = new Date().toISOString();
        await db.updateAlarm(alarm);

        // Remover da lista de ativos
        this.activeAlarms = this.activeAlarms.filter(a => a.id !== alarm.id);

        // Buscar informações da tarefa
        const task = await db.getTask(alarm.taskId);

        if (task) {
            // Mostrar alerta visual
            this.showVisualAlert(alarm.title || task.text, alarm.message || 'Lembrete de tarefa!');

            // Tocar som
            this.playAlarmSound();

            // Mostrar notificação do navegador
            this.showBrowserNotification(alarm.title || task.text, alarm.message || 'Lembrete de tarefa!');
        }
    }

    /**
     * Mostra alerta visual na tela
     */
    showVisualAlert(titulo, mensagem) {
        const alertElement = document.getElementById('alerta');
        const tituloElement = document.getElementById('alertaTitulo');
        const mensagemElement = document.getElementById('alertaMensagem');

        if (alertElement && tituloElement && mensagemElement) {
            tituloElement.textContent = titulo;
            mensagemElement.textContent = mensagem;
            alertElement.style.display = 'block';

            // Criar efeito de partículas
            this.createAlertParticles();
        }
    }

    /**
     * Toca som de alarme
     */
    playAlarmSound() {
        if (this.audioElement) {
            this.audioElement.loop = true;
            this.audioElement.play().catch(err => {
                console.warn('Não foi possível reproduzir o som:', err);
            });
        }
    }

    /**
     * Para o som de alarme
     */
    stopAlarmSound() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

    /**
     * Para o alarme (som + visual)
     */
    stopAlarm() {
        this.stopAlarmSound();
        
        const alertElement = document.getElementById('alerta');
        if (alertElement) {
            alertElement.style.display = 'none';
        }

        // Limpar partículas
        const particles = document.querySelectorAll('.alert-particle');
        particles.forEach(p => p.remove());
    }

    /**
     * Mostra notificação do navegador
     */
    showBrowserNotification(titulo, mensagem) {
        if (this.notificationPermission && 'Notification' in window) {
            const notification = new Notification(titulo, {
                body: mensagem,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⏰</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">📋</text></svg>',
                tag: 'taskflow-alarm',
                requireInteraction: true,
                vibrate: [200, 100, 200]
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    /**
     * Cria partículas de alerta
     */
    createAlertParticles() {
        const alertElement = document.getElementById('alerta');
        if (!alertElement) return;

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'alert-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            alertElement.appendChild(particle);

            // Remover após animação
            setTimeout(() => particle.remove(), 2000);
        }
    }

    /**
     * Agenda um novo alarme
     */
    async scheduleAlarm(taskId, alarmTime, title, message) {
        const alarm = {
            id: 'alarm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            taskId: taskId,
            alarmTime: new Date(alarmTime).getTime(),
            title: title,
            message: message,
            triggered: false,
            createdAt: new Date().toISOString()
        };

        try {
            await db.addAlarm(alarm);
            this.activeAlarms.push(alarm);
            console.log('✅ Alarme agendado para:', new Date(alarmTime));
            return alarm;
        } catch (error) {
            console.error('Erro ao agendar alarme:', error);
            return null;
        }
    }

    /**
     * Cancela um alarme
     */
    async cancelAlarm(alarmId) {
        try {
            await db.deleteAlarm(alarmId);
            this.activeAlarms = this.activeAlarms.filter(a => a.id !== alarmId);
            console.log('❌ Alarme cancelado');
            return true;
        } catch (error) {
            console.error('Erro ao cancelar alarme:', error);
            return false;
        }
    }

    /**
     * Cancela todos os alarmes de uma tarefa
     */
    async cancelTaskAlarms(taskId) {
        const taskAlarms = this.activeAlarms.filter(a => a.taskId === taskId);
        
        for (const alarm of taskAlarms) {
            await this.cancelAlarm(alarm.id);
        }
    }

    /**
     * Lista alarmes de uma tarefa
     */
    getTaskAlarms(taskId) {
        return this.activeAlarms.filter(a => a.taskId === taskId);
    }

    /**
     * Agenda alarme automático (exemplo: 15 minutos antes)
     */
    async scheduleAutoAlarm(task, minutesBefore = 15) {
        if (!task.date || !task.time) return null;

        const taskDateTime = new Date(task.date + ' ' + task.time);
        const alarmTime = new Date(taskDateTime.getTime() - minutesBefore * 60000);

        // Não agendar se já passou
        if (alarmTime.getTime() < Date.now()) return null;

        return await this.scheduleAlarm(
            task.id,
            alarmTime,
            `Lembrete: ${task.text}`,
            `Sua tarefa começa em ${minutesBefore} minutos!`
        );
    }
}

// Inicializar sistema de alarmes
const alarmSystem = new AlarmSystem();
