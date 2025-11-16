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
        this.volumeFadeInterval = null;
        this.screenFlashInterval = null;
        this.vibrationInterval = null;
        this.isAlarmActive = false;
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
            // Usar arquivo de alarme profissional da pasta alarme
            this.audioElement.src = 'alarme/Bells Message Pack vol.1  1.mp3';
            document.body.appendChild(this.audioElement);
        }
        
        // Preparar áudio com interação inicial do usuário (requisito do navegador)
        this.audioElement.addEventListener('error', (e) => {
            console.error('❌ Erro ao carregar arquivo de áudio:', e);
            console.error('Verifique se o arquivo existe em: alarme/Bells Message Pack vol.1  1.mp3');
        });
        
        this.audioElement.addEventListener('loadeddata', () => {
            console.log('✅ Arquivo de áudio carregado com sucesso');
        });
    }



    /**
     * Solicita permissão para notificações do navegador
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Navegador não suporta notificações');
            return false;
        }

        // Verificar se já tem permissão
        if (Notification.permission === 'granted') {
            this.notificationPermission = true;
            console.log('✅ Permissão de notificações já concedida');
            return true;
        }

        // Se bloqueado, não pedir novamente
        if (Notification.permission === 'denied') {
            console.warn('⚠️ Permissão de notificações bloqueada pelo usuário');
            this.notificationPermission = false;
            return false;
        }

        // Solicitar permissão
        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            
            if (this.notificationPermission) {
                console.log('✅ Permissão de notificações concedida');
                // Mostrar notificação de teste
                new Notification('TaskFlow', {
                    body: 'Notificações ativadas com sucesso! 🔔',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">✅</text></svg>'
                });
            } else {
                console.log('⚠️ Permissão de notificações negada');
            }
            
            return this.notificationPermission;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
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
     * Mostra alerta visual ULTRA PODEROSO na tela
     */
    showVisualAlert(titulo, mensagem) {
        // Vibração contínua (dispositivos móveis)
        if ('vibrate' in navigator) {
            // Padrão de vibração: [vibra 200ms, pausa 100ms, vibra 200ms]
            this.vibrationInterval = setInterval(() => {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }, 1000);
        }
        
        // Flash na tela inteira
        this.screenFlashInterval = setInterval(() => {
            document.body.classList.toggle('alarm-screen-flash');
        }, 500);
        
        // Criar modal ULTRA PODEROSA de alarme
        const modal = document.createElement('div');
        modal.className = 'alarm-modal alarm-modal-extreme';
        modal.innerHTML = `
            <div class="alarm-modal-overlay alarm-overlay-extreme"></div>
            <div class="alarm-modal-content alarm-content-extreme">
                <div class="alarm-explosion-ring"></div>
                <div class="alarm-explosion-ring alarm-ring-2"></div>
                <div class="alarm-explosion-ring alarm-ring-3"></div>
                <div class="alarm-icon-container alarm-icon-mega">
                    <div class="alarm-icon-pulse alarm-pulse-extreme"></div>
                    <div class="alarm-icon-pulse alarm-pulse-extreme-2"></div>
                    <div class="alarm-icon alarm-icon-extreme">⏰</div>
                    <div class="alarm-lightning alarm-lightning-1">⚡</div>
                    <div class="alarm-lightning alarm-lightning-2">⚡</div>
                    <div class="alarm-lightning alarm-lightning-3">⚡</div>
                    <div class="alarm-lightning alarm-lightning-4">⚡</div>
                </div>
                <h2 class="alarm-title alarm-title-extreme">${titulo}</h2>
                <p class="alarm-message alarm-message-extreme">${mensagem}</p>
                <div class="alarm-urgency-bar">
                    <div class="alarm-urgency-fill"></div>
                </div>
                <div class="alarm-buttons alarm-buttons-extreme">
                    <button class="btn btn-primary btn-lg alarm-stop-btn alarm-btn-mega">
                        ✅ PARAR ALARME
                    </button>
                    <button class="btn btn-secondary alarm-snooze-btn alarm-btn-snooze">
                        💤 Soneca (5 min)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Shake na tela
        document.body.classList.add('alarm-shake-screen');

        // Animar entrada explosiva
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Event listeners
        modal.querySelector('.alarm-stop-btn').addEventListener('click', () => {
            this.stopAlarm();
            modal.classList.remove('active');
            document.body.classList.remove('alarm-shake-screen', 'alarm-screen-flash');
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.alarm-snooze-btn').addEventListener('click', () => {
            this.stopAlarmSound();
            modal.classList.remove('active');
            document.body.classList.remove('alarm-shake-screen', 'alarm-screen-flash');
            setTimeout(() => modal.remove(), 300);
            this.snoozeAlarm(5);
        });

        // Criar explosão de partículas e confete
        this.createExtremeParticles();
        this.createConfettiExplosion();
        
        // Piscar título da página
        this.startTitleBlink(titulo);
    }

    /**
     * Toca som de alarme ULTRA PODEROSO com fade in progressivo
     */
    playAlarmSound() {
        if (!this.audioElement) {
            console.error('❌ Elemento de áudio não encontrado');
            return;
        }

        this.isAlarmActive = true;
        
        // Começar do zero
        this.audioElement.currentTime = 0;
        this.audioElement.volume = 0;
        this.audioElement.loop = true;
        
        // Tentar tocar
        const playPromise = this.audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Fade in progressivo de 0 a 1 em 3 segundos
                let currentVolume = 0;
                this.volumeFadeInterval = setInterval(() => {
                    if (currentVolume < 1 && this.isAlarmActive) {
                        currentVolume += 0.02;
                        this.audioElement.volume = Math.min(currentVolume, 1);
                    } else if (currentVolume >= 1) {
                        clearInterval(this.volumeFadeInterval);
                    }
                }, 60); // Aumenta a cada 60ms
                
                console.log('🔊 Som do alarme iniciado com sucesso!');
            }).catch(err => {
                console.error('❌ Não foi possível reproduzir o som automaticamente:', err);
                console.error('ℹ️ Navegadores bloqueiam autoplay de áudio. O usuário precisa interagir primeiro.');
                
                // Criar botão para ativar som manualmente
                this.createEnableSoundButton();
            });
        }
    }

    /**
     * Cria botão para ativar som quando autoplay é bloqueado
     */
    createEnableSoundButton() {
        // Verificar se já existe
        if (document.getElementById('enableSoundBtn')) return;
        
        const button = document.createElement('button');
        button.id = 'enableSoundBtn';
        button.className = 'btn btn-danger btn-enable-sound';
        button.innerHTML = '🔊 CLIQUE PARA ATIVAR O SOM DO ALARME';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            animation: pulse 1s infinite;
            box-shadow: 0 4px 20px rgba(255, 0, 0, 0.5);
        `;
        
        button.addEventListener('click', () => {
            this.audioElement.play().then(() => {
                console.log('🔊 Som ativado pelo usuário');
                button.remove();
                
                // Fade in
                let currentVolume = 0;
                this.volumeFadeInterval = setInterval(() => {
                    if (currentVolume < 1 && this.isAlarmActive) {
                        currentVolume += 0.02;
                        this.audioElement.volume = Math.min(currentVolume, 1);
                    } else if (currentVolume >= 1) {
                        clearInterval(this.volumeFadeInterval);
                    }
                }, 60);
            }).catch(err => {
                console.error('Erro ao ativar som:', err);
            });
        });
        
        document.body.appendChild(button);
    }

    /**
     * Para o som de alarme e todos os efeitos
     */
    stopAlarmSound() {
        this.isAlarmActive = false;
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.audioElement.volume = 1;
        }
        
        // Limpar intervalos
        if (this.volumeFadeInterval) {
            clearInterval(this.volumeFadeInterval);
            this.volumeFadeInterval = null;
        }
        
        if (this.screenFlashInterval) {
            clearInterval(this.screenFlashInterval);
            this.screenFlashInterval = null;
        }
        
        if (this.vibrationInterval) {
            clearInterval(this.vibrationInterval);
            this.vibrationInterval = null;
        }
        
        // Parar vibração
        if ('vibrate' in navigator) {
            navigator.vibrate(0);
        }
        
        // Remover classe de flash da tela
        document.body.classList.remove('alarm-screen-flash');
    }

    /**
     * Para o alarme (som + visual)
     */
    stopAlarm() {
        this.stopAlarmSound();
        
        // Parar piscar título
        if (this.titleBlinkInterval) {
            clearInterval(this.titleBlinkInterval);
            document.title = 'TaskFlow - Organize suas Tarefas';
        }
        
        const alertElement = document.getElementById('alerta');
        if (alertElement) {
            alertElement.style.display = 'none';
        }

        // Remover modal customizada se existir
        const alarmModal = document.querySelector('.alarm-modal');
        if (alarmModal) {
            alarmModal.classList.remove('active');
            setTimeout(() => alarmModal.remove(), 300);
        }

        // Limpar partículas e confetes
        const particles = document.querySelectorAll('.alert-particle, .alarm-particle-extreme, .alarm-confetti');
        particles.forEach(p => p.remove());
        
        // Remover classes de efeitos
        document.body.classList.remove('alarm-shake-screen', 'alarm-screen-flash');
    }

    /**
     * Função de soneca - reagenda alarme
     */
    async snoozeAlarm(minutes = 5) {
        const snoozeTime = new Date(Date.now() + minutes * 60000);
        
        // Mostrar notificação
        if (this.notificationPermission) {
            new Notification('Soneca Ativada', {
                body: `Alarme reagendado para ${snoozeTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💤</text></svg>'
            });
        }

        // Agendar novo alarme
        await this.scheduleAlarm(
            'snooze_' + Date.now(),
            snoozeTime,
            'Fim da Soneca',
            'Hora de voltar ao trabalho!'
        );

        console.log('💤 Soneca agendada para:', snoozeTime);
    }

    /**
     * Mostra notificação do navegador
     */
    showBrowserNotification(titulo, mensagem) {
        // Verificar suporte a notificações
        if (!('Notification' in window)) {
            console.warn('⚠️ Navegador não suporta notificações');
            return;
        }

        // Verificar permissão
        if (Notification.permission !== 'granted') {
            console.warn('⚠️ Permissão de notificação não concedida');
            // Tentar solicitar permissão
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showBrowserNotification(titulo, mensagem);
                }
            });
            return;
        }

        try {
            const notification = new Notification(titulo, {
                body: mensagem,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⏰</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">📋</text></svg>',
                tag: 'taskflow-alarm',
                requireInteraction: true,
                vibrate: [200, 100, 200],
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            console.log('🔔 Notificação exibida:', titulo);
        } catch (error) {
            console.error('❌ Erro ao exibir notificação:', error);
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
     * Cria explosão EXTREMA de partículas
     */
    createExtremeParticles() {
        const particleCount = 100; // 100 partículas!
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'alarm-particle-extreme';
            particle.style.cssText = `
                position: fixed;
                left: 50%;
                top: 50%;
                width: ${Math.random() * 20 + 5}px;
                height: ${Math.random() * 20 + 5}px;
                background: ${this.getRandomColor()};
                border-radius: 50%;
                pointer-events: none;
                z-index: 999999;
                box-shadow: 0 0 20px ${this.getRandomColor()};
                animation: explodeParticle ${Math.random() * 2 + 1}s ease-out forwards;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            `;
            
            // Direção aleatória
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = Math.random() * 300 + 200;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
    }

    /**
     * Cria explosão de confete
     */
    createConfettiExplosion() {
        const confettiCount = 150;
        const emojis = ['🎉', '⭐', '✨', '💥', '🔥', '⚡', '🌟', '💫', '🎊', '🎈'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'alarm-confetti';
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -50px;
                font-size: ${Math.random() * 30 + 20}px;
                pointer-events: none;
                z-index: 999998;
                animation: fallConfetti ${Math.random() * 3 + 2}s linear forwards;
                animation-delay: ${Math.random() * 0.5}s;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 6000);
        }
    }

    /**
     * Piscar título da página
     */
    startTitleBlink(alarmTitle) {
        const originalTitle = document.title;
        let isOriginal = true;
        
        this.titleBlinkInterval = setInterval(() => {
            document.title = isOriginal ? `🚨 ALARME: ${alarmTitle}` : '⏰ ATENÇÃO!!!';
            isOriginal = !isOriginal;
        }, 1000);
        
        // Restaurar título original após 30 segundos
        setTimeout(() => {
            if (this.titleBlinkInterval) {
                clearInterval(this.titleBlinkInterval);
                document.title = originalTitle;
            }
        }, 30000);
    }

    /**
     * Retorna cor aleatória vibrante
     */
    getRandomColor() {
        const colors = [
            '#ff0000', '#ff4500', '#ff6347', '#ff1493',
            '#ff00ff', '#9400d3', '#4b0082', '#0000ff',
            '#00ffff', '#00ff00', '#ffff00', '#ffa500',
            '#ff69b4', '#ff00aa', '#aa00ff', '#00aaff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
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
