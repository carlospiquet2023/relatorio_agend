/**
 * TaskFlow - Electron Main Process
 * Sistema Desktop de Gerenciamento de Tarefas
 * @author Carlos Antonio de Oliveira Piquet
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, Notification, shell } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let isQuitting = false;

// Criar janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'assets/icon.png'),
        backgroundColor: '#f9fafb',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'electron-preload.js')
        },
        show: false,
        frame: true,
        titleBarStyle: 'default',
        autoHideMenuBar: false
    });

    // Carregar index.html
    mainWindow.loadFile('index.html');

    // Mostrar janela quando estiver pronta
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ TaskFlow iniciado com sucesso!');
    });

    // Minimizar para bandeja em vez de fechar
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            
            // Mostrar notificação
            if (Notification.isSupported()) {
                new Notification({
                    title: 'TaskFlow',
                    body: 'O aplicativo continua rodando na bandeja do sistema',
                    icon: path.join(__dirname, 'assets/icon.png')
                }).show();
            }
        }
        return false;
    });

    // Abrir links externos no navegador
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Menu da aplicação
    createApplicationMenu();

    // Criar ícone na bandeja
    createTray();

    // DevTools (comentar em produção)
    // mainWindow.webContents.openDevTools();
}

// Criar menu da aplicação
function createApplicationMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Nova Tarefa',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-task');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exportar Relatório',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('menu-export');
                    }
                },
                {
                    label: 'Fazer Backup',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        mainWindow.webContents.send('menu-backup');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        isQuitting = true;
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Recortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Selecionar Tudo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                {
                    label: 'Alternar Tema',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => {
                        mainWindow.webContents.send('menu-toggle-theme');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Recarregar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Tela Cheia',
                    accelerator: 'F11',
                    role: 'togglefullscreen'
                },
                { type: 'separator' },
                {
                    label: 'Ferramentas do Desenvolvedor',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'Ferramentas',
            submenu: [
                {
                    label: 'Caderno de Anotações',
                    accelerator: 'CmdOrCtrl+K',
                    click: () => {
                        mainWindow.webContents.send('menu-notebook');
                    }
                },
                {
                    label: 'Estatísticas',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        mainWindow.webContents.send('menu-stats');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Configurações de Alarmes',
                    click: () => {
                        mainWindow.webContents.send('menu-alarm-settings');
                    }
                }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Documentação',
                    click: () => {
                        shell.openExternal('https://github.com/carlospiquet2023/relatorio_agend');
                    }
                },
                {
                    label: 'Reportar Problema',
                    click: () => {
                        shell.openExternal('https://github.com/carlospiquet2023/relatorio_agend/issues');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sobre o TaskFlow',
                    click: () => {
                        mainWindow.webContents.send('menu-about');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Criar ícone na bandeja do sistema
function createTray() {
    const iconPath = path.join(__dirname, 'assets/icon.png');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir TaskFlow',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Nova Tarefa',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('menu-new-task');
            }
        },
        { type: 'separator' },
        {
            label: 'Estatísticas',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('menu-stats');
            }
        },
        { type: 'separator' },
        {
            label: 'Sair',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('TaskFlow - Gerenciamento de Tarefas');
    tray.setContextMenu(contextMenu);

    // Clicar no ícone mostra a janela
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

// Quando o Electron estiver pronto
app.whenReady().then(() => {
    createWindow();

    // macOS: recriar janela quando clicar no dock
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

// Fechar quando todas as janelas forem fechadas (exceto macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Antes de sair
app.on('before-quit', () => {
    isQuitting = true;
});

// IPC - Comunicação com o renderer
ipcMain.on('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        new Notification({
            title: title,
            body: body,
            icon: path.join(__dirname, 'assets/icon.png')
        }).show();
    }
});

ipcMain.on('minimize-to-tray', () => {
    mainWindow.hide();
});

ipcMain.on('set-badge', (event, count) => {
    // Badge no ícone (Windows 10+)
    if (count > 0) {
        app.setBadgeCount(count);
    } else {
        app.setBadgeCount(0);
    }
});

console.log('🚀 TaskFlow Electron inicializado');
