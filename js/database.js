/**
 * TaskFlow Database - IndexedDB Manager
 * Gerenciador profissional de banco de dados local
 * @author Carlos Antonio de Oliveira Piquet
 */

class TaskFlowDB {
    constructor() {
        this.dbName = 'TaskFlowDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Inicializa o banco de dados IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para Tarefas
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    taskStore.createIndex('date', 'date', { unique: false });
                    taskStore.createIndex('priority', 'priority', { unique: false });
                    taskStore.createIndex('completed', 'completed', { unique: false });
                    taskStore.createIndex('alarmTime', 'alarmTime', { unique: false });
                    console.log('📋 Object Store "tasks" criado');
                }

                // Store para Notebook
                if (!db.objectStoreNames.contains('notebook')) {
                    db.createObjectStore('notebook', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    console.log('📝 Object Store "notebook" criado');
                }

                // Store para Achievements
                if (!db.objectStoreNames.contains('achievements')) {
                    const achievementStore = db.createObjectStore('achievements', { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    achievementStore.createIndex('unlocked', 'unlocked', { unique: false });
                    achievementStore.createIndex('unlockedAt', 'unlockedAt', { unique: false });
                    console.log('🏆 Object Store "achievements" criado');
                }

                // Store para Alarmes Ativos
                if (!db.objectStoreNames.contains('alarms')) {
                    const alarmStore = db.createObjectStore('alarms', { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    alarmStore.createIndex('taskId', 'taskId', { unique: false });
                    alarmStore.createIndex('alarmTime', 'alarmTime', { unique: false });
                    alarmStore.createIndex('triggered', 'triggered', { unique: false });
                    console.log('⏰ Object Store "alarms" criado');
                }

                // Store para Configurações
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { 
                        keyPath: 'key', 
                        autoIncrement: false 
                    });
                    console.log('⚙️ Object Store "settings" criado');
                }
            };
        });
    }

    /**
     * Migra dados do LocalStorage para IndexedDB
     */
    async migrateFromLocalStorage() {
        try {
            // Migrar Tarefas
            const tasksLS = localStorage.getItem('tasks');
            if (tasksLS) {
                const tasks = JSON.parse(tasksLS);
                for (const task of tasks) {
                    await this.addTask(task);
                }
                console.log(`✅ ${tasks.length} tarefas migradas`);
            }

            // Migrar Notebook
            const notebookLS = localStorage.getItem('notebookContent');
            if (notebookLS) {
                await this.saveNotebook(notebookLS);
                console.log('✅ Notebook migrado');
            }

            // Migrar Achievements
            const achievementsLS = localStorage.getItem('achievements');
            if (achievementsLS) {
                const achievements = JSON.parse(achievementsLS);
                for (const achievement of achievements) {
                    await this.saveAchievement(achievement);
                }
                console.log(`✅ ${achievements.length} conquistas migradas`);
            }

            // Migrar Theme
            const theme = localStorage.getItem('theme');
            if (theme) {
                await this.saveSetting('theme', theme);
                console.log('✅ Tema migrado');
            }

            console.log('🎉 Migração do LocalStorage concluída!');
        } catch (error) {
            console.error('❌ Erro na migração:', error);
        }
    }

    // ==================== TASKS ====================

    async addTask(task) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            const request = store.add(task);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateTask(task) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            const request = store.put(task);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteTask(taskId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            const request = store.delete(taskId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getTask(taskId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const request = store.get(taskId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTasks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async getTasksByDate(date) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const index = store.index('date');
            const request = index.getAll(date);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== NOTEBOOK ====================

    async saveNotebook(content) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notebook'], 'readwrite');
            const store = transaction.objectStore('notebook');
            const data = {
                id: 1,
                content: content,
                lastModified: new Date().toISOString()
            };
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getNotebook() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notebook'], 'readonly');
            const store = transaction.objectStore('notebook');
            const request = store.get(1);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.content : '');
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== ACHIEVEMENTS ====================

    async saveAchievement(achievement) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['achievements'], 'readwrite');
            const store = transaction.objectStore('achievements');
            const request = store.put(achievement);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllAchievements() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['achievements'], 'readonly');
            const store = transaction.objectStore('achievements');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== ALARMS ====================

    async addAlarm(alarm) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alarms'], 'readwrite');
            const store = transaction.objectStore('alarms');
            const request = store.add(alarm);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateAlarm(alarm) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alarms'], 'readwrite');
            const store = transaction.objectStore('alarms');
            const request = store.put(alarm);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAlarm(alarmId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alarms'], 'readwrite');
            const store = transaction.objectStore('alarms');
            const request = store.delete(alarmId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getActiveAlarms() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alarms'], 'readonly');
            const store = transaction.objectStore('alarms');
            const index = store.index('triggered');
            const request = index.getAll(false);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllAlarms() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alarms'], 'readonly');
            const store = transaction.objectStore('alarms');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== SETTINGS ====================

    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== UTILITIES ====================

    async clearAllData() {
        const stores = ['tasks', 'notebook', 'achievements', 'alarms', 'settings'];
        
        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        
        console.log('🗑️ Todos os dados foram limpos');
    }

    async exportData() {
        const data = {
            tasks: await this.getAllTasks(),
            notebook: await this.getNotebook(),
            achievements: await this.getAllAchievements(),
            alarms: await this.getAllAlarms(),
            exportDate: new Date().toISOString(),
            version: this.version
        };
        return data;
    }

    async importData(data) {
        try {
            // Importar tarefas
            if (data.tasks) {
                for (const task of data.tasks) {
                    await this.updateTask(task);
                }
            }

            // Importar notebook
            if (data.notebook) {
                await this.saveNotebook(data.notebook);
            }

            // Importar achievements
            if (data.achievements) {
                for (const achievement of data.achievements) {
                    await this.saveAchievement(achievement);
                }
            }

            // Importar alarmes
            if (data.alarms) {
                for (const alarm of data.alarms) {
                    await this.updateAlarm(alarm);
                }
            }

            console.log('✅ Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }
}

// Inicializar o banco de dados
const db = new TaskFlowDB();
