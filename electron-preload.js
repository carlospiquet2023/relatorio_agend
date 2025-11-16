/**
 * TaskFlow - Electron Preload Script
 * Ponte segura entre Electron e o código web
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expor API segura para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Notificações nativas
    showNotification: (title, body) => {
        ipcRenderer.send('show-notification', { title, body });
    },
    
    // Minimizar para bandeja
    minimizeToTray: () => {
        ipcRenderer.send('minimize-to-tray');
    },
    
    // Badge de contagem
    setBadge: (count) => {
        ipcRenderer.send('set-badge', count);
    },
    
    // Informações do sistema
    platform: process.platform,
    
    // Listeners de menu
    onMenuNewTask: (callback) => {
        ipcRenderer.on('menu-new-task', callback);
    },
    
    onMenuExport: (callback) => {
        ipcRenderer.on('menu-export', callback);
    },
    
    onMenuBackup: (callback) => {
        ipcRenderer.on('menu-backup', callback);
    },
    
    onMenuNotebook: (callback) => {
        ipcRenderer.on('menu-notebook', callback);
    },
    
    onMenuStats: (callback) => {
        ipcRenderer.on('menu-stats', callback);
    },
    
    onMenuToggleTheme: (callback) => {
        ipcRenderer.on('menu-toggle-theme', callback);
    },
    
    onMenuAbout: (callback) => {
        ipcRenderer.on('menu-about', callback);
    }
});

console.log('✅ Electron Preload carregado');
