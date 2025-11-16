/**
 * TaskFlow - PWA Install Manager
 * Gerencia a instalação do app como PWA
 */

let deferredPrompt;
let isInstalled = false;

// Detectar se já está instalado
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
    isInstalled = true;
    console.log('✅ App já está instalado como PWA');
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
                
                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nova versão disponível
                            if (confirm('🔄 Nova versão disponível! Atualizar agora?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(err => {
                console.error('❌ Erro ao registrar Service Worker:', err);
            });
    });
}

// Capturar evento de instalação
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📥 Evento beforeinstallprompt disparado');
    
    // Prevenir o mini-infobar do Chrome
    e.preventDefault();
    
    // Guardar o evento para usar depois
    deferredPrompt = e;
    
    // Mostrar botão de instalação
    showInstallButton();
});

// Mostrar botão de instalação
function showInstallButton() {
    const installBtn = document.getElementById('installApp');
    
    if (installBtn && !isInstalled) {
        installBtn.style.display = 'block';
        installBtn.title = 'Instalar App na Área de Trabalho';
        
        // Adicionar animação pulsante
        installBtn.classList.add('pulse-animation');
        
        // Event listener do botão
        installBtn.addEventListener('click', installPWA);
    }
}

// Instalar PWA
async function installPWA() {
    if (!deferredPrompt) {
        // Se não puder instalar como PWA, mostrar opções alternativas
        showInstallOptions();
        return;
    }
    
    // Mostrar prompt de instalação
    deferredPrompt.prompt();
    
    // Aguardar escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário escolheu: ${outcome}`);
    
    if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso!');
        
        // Esconder botão
        const installBtn = document.getElementById('installApp');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        // Mostrar confirmação
        if (typeof showToast === 'function') {
            showToast('🎉 App instalado na área de trabalho!', 'success', 5000);
        }
        
        // Criar confete
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
    } else {
        console.log('❌ Instalação cancelada pelo usuário');
    }
    
    // Limpar o prompt
    deferredPrompt = null;
}

// Mostrar opções de instalação alternativas
function showInstallOptions() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>📥 Instalar TaskFlow</h2>
                <button class="btn-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <h3 style="margin-bottom: 1rem;">Escolha como deseja instalar:</h3>
                
                <!-- Opção 1: PWA (Navegador) -->
                <div class="install-option" style="border: 2px solid var(--primary-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">
                        🌐 Instalar pelo Navegador (Recomendado)
                    </h4>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                        Rápido e fácil! Funciona em qualquer navegador moderno.
                    </p>
                    <div class="browser-instructions">
                        <p><strong>Chrome/Edge:</strong></p>
                        <ol style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                            <li>Clique no menu ⋮ (canto superior direito)</li>
                            <li>Selecione "Instalar TaskFlow"</li>
                            <li>Confirme a instalação</li>
                        </ol>
                        <p style="margin-top: 1rem;"><strong>Firefox:</strong></p>
                        <ol style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                            <li>Clique no ícone ⊕ na barra de endereço</li>
                            <li>Selecione "Instalar"</li>
                        </ol>
                    </div>
                </div>
                
                <!-- Opção 2: App Desktop (Electron) -->
                <div class="install-option" style="border: 2px solid var(--secondary-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                    <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">
                        🖥️ App Desktop Completo (Windows)
                    </h4>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                        Versão standalone com recursos avançados.
                    </p>
                    <ol style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                        <li>Baixe o instalador: 
                            <a href="https://github.com/carlospiquet2023/relatorio_agend/releases" 
                               target="_blank" 
                               style="color: var(--primary-color);">
                                GitHub Releases
                            </a>
                        </li>
                        <li>Execute <code>TaskFlow-Setup.exe</code></li>
                        <li>Siga o assistente de instalação</li>
                    </ol>
                    <p style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.9rem;">
                        <strong>💡 Dica:</strong> Você também pode compilar do código-fonte seguindo as instruções em 
                        <code>COMO_CRIAR_APP_DESKTOP.md</code>
                    </p>
                </div>
                
                <!-- Opção 3: Atalho Manual -->
                <div class="install-option" style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 1.5rem;">
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        🔗 Criar Atalho Manual
                    </h4>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                        Arrastar URL da barra de endereço para a área de trabalho.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Detectar quando o app é instalado
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalado com sucesso!');
    isInstalled = true;
    
    // Esconder botão
    const installBtn = document.getElementById('installApp');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    
    // Analytics (se tiver)
    if (typeof gtag === 'function') {
        gtag('event', 'install', {
            event_category: 'PWA',
            event_label: 'TaskFlow'
        });
    }
});

// Verificar se pode mostrar botão ao carregar
window.addEventListener('load', () => {
    // Se não estiver instalado e não tiver o evento beforeinstallprompt ainda
    if (!isInstalled) {
        // Aguardar um pouco para ver se o evento é disparado
        setTimeout(() => {
            if (!deferredPrompt) {
                // Mostrar botão com opções alternativas
                const installBtn = document.getElementById('installApp');
                if (installBtn) {
                    installBtn.style.display = 'block';
                    installBtn.title = 'Ver opções de instalação';
                    installBtn.addEventListener('click', showInstallOptions);
                }
            }
        }, 3000);
    }
});

console.log('✅ PWA Install Manager carregado');
