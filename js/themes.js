/**
 * TaskFlow Theme System - Sistema de Temas Premium
 * 12 Temas profissionais com transições suaves
 * @author Carlos Antonio de Oliveira Piquet
 */

class ThemeSystem {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'Light',
                icon: '☀️',
                colors: {
                    primaryColor: '#4f46e5',
                    secondaryColor: '#10b981',
                    dangerColor: '#ef4444',
                    warningColor: '#f59e0b',
                    infoColor: '#3b82f6',
                    successColor: '#10b981',
                    purpleColor: '#a855f7',
                    pinkColor: '#ec4899',
                    bgPrimary: '#f9fafb',
                    bgSecondary: '#ffffff',
                    bgTertiary: '#f3f4f6',
                    textPrimary: '#111827',
                    textSecondary: '#6b7280',
                    textLight: '#9ca3af',
                    borderColor: '#e5e7eb',
                    shadowGlow: 'rgba(79, 70, 229, 0.3)',
                    particleColor: '#667eea'
                }
            },
            dark: {
                name: 'Dark',
                icon: '🌙',
                colors: {
                    primaryColor: '#6366f1',
                    secondaryColor: '#10b981',
                    dangerColor: '#ef4444',
                    warningColor: '#f59e0b',
                    infoColor: '#3b82f6',
                    successColor: '#10b981',
                    purpleColor: '#a855f7',
                    pinkColor: '#ec4899',
                    bgPrimary: '#111827',
                    bgSecondary: '#1f2937',
                    bgTertiary: '#374151',
                    textPrimary: '#f9fafb',
                    textSecondary: '#d1d5db',
                    textLight: '#9ca3af',
                    borderColor: '#374151',
                    shadowGlow: 'rgba(99, 102, 241, 0.5)',
                    particleColor: '#818cf8'
                }
            },
            neonHacker: {
                name: 'Neon Hacker',
                icon: '⚡',
                colors: {
                    primaryColor: '#00ff41',
                    secondaryColor: '#39ff14',
                    dangerColor: '#ff0055',
                    warningColor: '#ffff00',
                    infoColor: '#00d4ff',
                    successColor: '#00ff41',
                    purpleColor: '#bf00ff',
                    pinkColor: '#ff00ff',
                    bgPrimary: '#0a0e27',
                    bgSecondary: '#0f1419',
                    bgTertiary: '#1a1f2e',
                    textPrimary: '#00ff41',
                    textSecondary: '#39ff14',
                    textLight: '#7cfc00',
                    borderColor: '#00ff41',
                    shadowGlow: 'rgba(0, 255, 65, 0.8)',
                    particleColor: '#00ff41'
                }
            },
            royalGold: {
                name: 'Royal Gold',
                icon: '👑',
                colors: {
                    primaryColor: '#ffd700',
                    secondaryColor: '#daa520',
                    dangerColor: '#b8860b',
                    warningColor: '#ffa500',
                    infoColor: '#f0e68c',
                    successColor: '#9acd32',
                    purpleColor: '#9370db',
                    pinkColor: '#ff69b4',
                    bgPrimary: '#1a1410',
                    bgSecondary: '#2d2416',
                    bgTertiary: '#3d3020',
                    textPrimary: '#ffd700',
                    textSecondary: '#f4e4c1',
                    textLight: '#daa520',
                    borderColor: '#8b7355',
                    shadowGlow: 'rgba(255, 215, 0, 0.6)',
                    particleColor: '#ffd700'
                }
            },
            matrix: {
                name: 'Matrix',
                icon: '🖥️',
                colors: {
                    primaryColor: '#00ff00',
                    secondaryColor: '#00cc00',
                    dangerColor: '#ff0000',
                    warningColor: '#ffff00',
                    infoColor: '#00ffff',
                    successColor: '#00ff00',
                    purpleColor: '#00ff88',
                    pinkColor: '#00ff66',
                    bgPrimary: '#000000',
                    bgSecondary: '#0d0d0d',
                    bgTertiary: '#1a1a1a',
                    textPrimary: '#00ff00',
                    textSecondary: '#00cc00',
                    textLight: '#009900',
                    borderColor: '#003300',
                    shadowGlow: 'rgba(0, 255, 0, 0.7)',
                    particleColor: '#00ff00'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                icon: '🌆',
                colors: {
                    primaryColor: '#ff00ff',
                    secondaryColor: '#00ffff',
                    dangerColor: '#ff0055',
                    warningColor: '#ffaa00',
                    infoColor: '#00d4ff',
                    successColor: '#00ff88',
                    purpleColor: '#bf00ff',
                    pinkColor: '#ff1493',
                    bgPrimary: '#0f0a1e',
                    bgSecondary: '#1a0f2e',
                    bgTertiary: '#2d1b4e',
                    textPrimary: '#ff00ff',
                    textSecondary: '#00ffff',
                    textLight: '#b967ff',
                    borderColor: '#4a148c',
                    shadowGlow: 'rgba(255, 0, 255, 0.8)',
                    particleColor: '#ff00ff'
                }
            },
            minimalWhite: {
                name: 'Minimal White',
                icon: '⚪',
                colors: {
                    primaryColor: '#000000',
                    secondaryColor: '#333333',
                    dangerColor: '#dc143c',
                    warningColor: '#ff8c00',
                    infoColor: '#4169e1',
                    successColor: '#228b22',
                    purpleColor: '#8a2be2',
                    pinkColor: '#ff1493',
                    bgPrimary: '#ffffff',
                    bgSecondary: '#f8f8f8',
                    bgTertiary: '#eeeeee',
                    textPrimary: '#000000',
                    textSecondary: '#555555',
                    textLight: '#888888',
                    borderColor: '#dddddd',
                    shadowGlow: 'rgba(0, 0, 0, 0.1)',
                    particleColor: '#000000'
                }
            },
            midnightBlue: {
                name: 'Midnight Blue',
                icon: '🌌',
                colors: {
                    primaryColor: '#4169e1',
                    secondaryColor: '#1e90ff',
                    dangerColor: '#ff4500',
                    warningColor: '#ffa500',
                    infoColor: '#87ceeb',
                    successColor: '#32cd32',
                    purpleColor: '#9370db',
                    pinkColor: '#ff69b4',
                    bgPrimary: '#0c1445',
                    bgSecondary: '#132052',
                    bgTertiary: '#1a2d5f',
                    textPrimary: '#e6f0ff',
                    textSecondary: '#b3d1ff',
                    textLight: '#8cb3ff',
                    borderColor: '#2a4d8f',
                    shadowGlow: 'rgba(65, 105, 225, 0.6)',
                    particleColor: '#4169e1'
                }
            },
            forestGreen: {
                name: 'Forest Green',
                icon: '🌲',
                colors: {
                    primaryColor: '#228b22',
                    secondaryColor: '#32cd32',
                    dangerColor: '#ff4500',
                    warningColor: '#ffa500',
                    infoColor: '#20b2aa',
                    successColor: '#3cb371',
                    purpleColor: '#9370db',
                    pinkColor: '#ff69b4',
                    bgPrimary: '#0d1f0d',
                    bgSecondary: '#1a331a',
                    bgTertiary: '#264626',
                    textPrimary: '#90ee90',
                    textSecondary: '#7cfc00',
                    textLight: '#5fa55f',
                    borderColor: '#2d5a2d',
                    shadowGlow: 'rgba(34, 139, 34, 0.6)',
                    particleColor: '#32cd32'
                }
            },
            sunset: {
                name: 'Sunset',
                icon: '🌅',
                colors: {
                    primaryColor: '#ff6b6b',
                    secondaryColor: '#ffa500',
                    dangerColor: '#dc143c',
                    warningColor: '#ff8c00',
                    infoColor: '#ff69b4',
                    successColor: '#ff7f50',
                    purpleColor: '#da70d6',
                    pinkColor: '#ff1493',
                    bgPrimary: '#1f0c0c',
                    bgSecondary: '#331414',
                    bgTertiary: '#462020',
                    textPrimary: '#ffe4e1',
                    textSecondary: '#ffc1c1',
                    textLight: '#ff9999',
                    borderColor: '#5a2020',
                    shadowGlow: 'rgba(255, 107, 107, 0.6)',
                    particleColor: '#ff6b6b'
                }
            },
            ocean: {
                name: 'Ocean',
                icon: '🌊',
                colors: {
                    primaryColor: '#00bcd4',
                    secondaryColor: '#00acc1',
                    dangerColor: '#ff5252',
                    warningColor: '#ffc107',
                    infoColor: '#03a9f4',
                    successColor: '#4caf50',
                    purpleColor: '#9c27b0',
                    pinkColor: '#e91e63',
                    bgPrimary: '#0d1d2d',
                    bgSecondary: '#14293d',
                    bgTertiary: '#1e3a4d',
                    textPrimary: '#e0f7fa',
                    textSecondary: '#b2ebf2',
                    textLight: '#80deea',
                    borderColor: '#2d4d5d',
                    shadowGlow: 'rgba(0, 188, 212, 0.6)',
                    particleColor: '#00bcd4'
                }
            },
            lavender: {
                name: 'Lavender Dreams',
                icon: '💜',
                colors: {
                    primaryColor: '#9b59b6',
                    secondaryColor: '#8e44ad',
                    dangerColor: '#e74c3c',
                    warningColor: '#f39c12',
                    infoColor: '#3498db',
                    successColor: '#2ecc71',
                    purpleColor: '#a29bfe',
                    pinkColor: '#fd79a8',
                    bgPrimary: '#1a0d2e',
                    bgSecondary: '#2d1841',
                    bgTertiary: '#3f2454',
                    textPrimary: '#e8daef',
                    textSecondary: '#d7bde2',
                    textLight: '#c39bd3',
                    borderColor: '#512e5f',
                    shadowGlow: 'rgba(155, 89, 182, 0.6)',
                    particleColor: '#9b59b6'
                }
            }
        };
    }

    /**
     * Inicializa o sistema de temas
     */
    async init() {
        // Carregar tema salvo
        const savedTheme = await db.getSetting('theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }

        // Aplicar tema inicial
        this.applyTheme(this.currentTheme);

        // Setup event listeners
        this.setupThemeSelector();

        console.log('🎨 Sistema de temas inicializado:', this.currentTheme);
    }

    /**
     * Aplica um tema
     */
    applyTheme(themeName, animate = true) {
        if (!this.themes[themeName]) {
            console.error('Tema não encontrado:', themeName);
            return;
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // Adicionar classe de transição
        if (animate) {
            root.classList.add('theme-transitioning');
        }

        // Aplicar cores
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(cssVar, value);
        });

        // Atualizar data-theme
        document.body.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;

        // Salvar preferência
        db.saveSetting('theme', themeName);

        // Atualizar ícone do tema
        this.updateThemeIcon();

        // Remover classe de transição
        if (animate) {
            setTimeout(() => {
                root.classList.remove('theme-transitioning');
            }, 500);
        }

        // Criar efeito visual de mudança de tema
        if (animate) {
            this.createThemeChangeEffect();
        }

        console.log('🎨 Tema aplicado:', theme.name);
    }

    /**
     * Cria efeito visual de mudança de tema
     */
    createThemeChangeEffect() {
        const colors = this.themes[this.currentTheme].colors;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.background = colors.particleColor;
            particle.style.boxShadow = `0 0 20px ${colors.shadowGlow}`;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }

    /**
     * Atualiza ícone do tema
     */
    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.themes[this.currentTheme].icon;
        }
    }

    /**
     * Setup seletor de temas
     */
    setupThemeSelector() {
        // Criar modal de seleção de temas se não existir
        let themeModal = document.getElementById('themeModal');
        
        if (!themeModal) {
            themeModal = this.createThemeModal();
            document.body.appendChild(themeModal);
        }

        // Botão de tema
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                themeModal.classList.add('active');
            });
        }

        // Fechar modal
        const closeBtn = themeModal.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                themeModal.classList.remove('active');
            });
        }

        // Fechar ao clicar fora
        themeModal.addEventListener('click', (e) => {
            if (e.target === themeModal) {
                themeModal.classList.remove('active');
            }
        });
    }

    /**
     * Cria modal de seleção de temas
     */
    createThemeModal() {
        const modal = document.createElement('div');
        modal.id = 'themeModal';
        modal.className = 'modal';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>🎨 Selecionar Tema</h2>
            <button class="btn-close">&times;</button>
        `;
        
        const body = document.createElement('div');
        body.className = 'modal-body theme-grid';
        
        // Criar cards de temas
        Object.entries(this.themes).forEach(([key, theme]) => {
            const card = document.createElement('div');
            card.className = 'theme-card';
            if (key === this.currentTheme) {
                card.classList.add('active');
            }
            
            card.innerHTML = `
                <div class="theme-preview" style="background: ${theme.colors.bgSecondary}">
                    <div class="theme-icon-large">${theme.icon}</div>
                    <div class="theme-colors">
                        <span style="background: ${theme.colors.primaryColor}"></span>
                        <span style="background: ${theme.colors.secondaryColor}"></span>
                        <span style="background: ${theme.colors.purpleColor}"></span>
                        <span style="background: ${theme.colors.pinkColor}"></span>
                    </div>
                </div>
                <div class="theme-name" style="color: ${theme.colors.textPrimary}">${theme.name}</div>
            `;
            
            card.addEventListener('click', () => {
                // Remover active de todos
                body.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Aplicar tema
                this.applyTheme(key);
                
                // Fechar modal após pequeno delay
                setTimeout(() => {
                    modal.classList.remove('active');
                }, 300);
            });
            
            body.appendChild(card);
        });
        
        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        
        return modal;
    }

    /**
     * Obtém tema atual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Lista todos os temas disponíveis
     */
    getAvailableThemes() {
        return Object.keys(this.themes);
    }
}

// Inicializar sistema de temas
const themeSystem = new ThemeSystem();
