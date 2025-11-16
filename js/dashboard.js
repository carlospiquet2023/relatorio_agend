/**
 * TaskFlow Dashboard System - Dashboard Analítico Profissional
 * Sistema completo de análise de dados com gráficos interativos
 * @author Carlos Antonio de Oliveira Piquet
 * @version 2.0
 */

class DashboardSystem {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: 'rgba(79, 70, 229, 0.8)',
            primaryLight: 'rgba(79, 70, 229, 0.2)',
            secondary: 'rgba(16, 185, 129, 0.8)',
            secondaryLight: 'rgba(16, 185, 129, 0.2)',
            danger: 'rgba(239, 68, 68, 0.8)',
            dangerLight: 'rgba(239, 68, 68, 0.2)',
            warning: 'rgba(245, 158, 11, 0.8)',
            warningLight: 'rgba(245, 158, 11, 0.2)',
            info: 'rgba(59, 130, 246, 0.8)',
            infoLight: 'rgba(59, 130, 246, 0.2)',
            purple: 'rgba(168, 85, 247, 0.8)',
            purpleLight: 'rgba(168, 85, 247, 0.2)',
            pink: 'rgba(236, 72, 153, 0.8)',
            pinkLight: 'rgba(236, 72, 153, 0.2)'
        };
        
        // Configuração padrão dos gráficos
        this.defaultChartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            }
        };
    }

    /**
     * Inicializa o dashboard
     */
    async init() {
        console.log('📊 Inicializando Dashboard System...');
        
        // Criar modal do dashboard
        this.createDashboardModal();

        // Setup event listener para botão de estatísticas
        const statsBtn = document.getElementById('openStats');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.openDashboard();
            });
        }

        console.log('✅ Dashboard System inicializado');
    }

    /**
     * Abre o dashboard
     */
    async openDashboard() {
        try {
            const modal = document.getElementById('dashboardModal');
            if (modal) {
                modal.classList.add('active');
                
                // Aguardar modal estar visível
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Carregar dados e renderizar gráficos
                await this.loadDashboardData();
            }
        } catch (error) {
            console.error('❌ Erro ao abrir dashboard:', error);
            if (typeof showToast === 'function') {
                showToast('Erro ao carregar dashboard');
            }
        }
    }

    /**
     * Fecha o dashboard
     */
    closeDashboard() {
        const modal = document.getElementById('dashboardModal');
        if (modal) {
            modal.classList.remove('active');
            
            // Destruir gráficos para liberar memória
            this.destroyCharts();
        }
    }

    /**
     * Carrega dados e renderiza gráficos
     */
    async loadDashboardData() {
        try {
            // Buscar tarefas do banco de dados ou localStorage
            let tasks = [];
            if (typeof db !== 'undefined' && db.getAllTasks) {
                tasks = await db.getAllTasks();
            } else if (typeof state !== 'undefined' && state.tasks) {
                // Converter objeto de tarefas em array
                tasks = [];
                Object.keys(state.tasks).forEach(date => {
                    if (Array.isArray(state.tasks[date])) {
                        state.tasks[date].forEach(task => {
                            tasks.push({
                                ...task,
                                date: date
                            });
                        });
                    }
                });
            }
            
            console.log(`📊 Carregando dashboard com ${tasks.length} tarefas`);
            
            const stats = this.calculateStatistics(tasks);
            
            // Atualizar cards de estatísticas
            this.updateStatCards(stats);
            
            // Renderizar todos os gráficos
            await Promise.all([
                this.renderPriorityChart(stats),
                this.renderWeekPerformanceChart(stats),
                this.renderCompletionChart(stats),
                this.renderCategoryChart(stats)
            ]);
            
            // Renderizar heatmap (não usa Chart.js)
            this.renderHeatmap(stats);
            
            console.log('✅ Dashboard carregado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar dados do dashboard:', error);
        }
    }

    /**
     * Calcula estatísticas
     */
    calculateStatistics(tasks) {
        const stats = {
            total: tasks.length,
            completed: 0,
            pending: 0,
            high: 0,
            medium: 0,
            low: 0,
            byDay: {},
            byWeek: {},
            byMonth: {},
            completionRate: 0,
            avgTasksPerDay: 0,
            mostProductiveDay: '',
            streak: 0
        };

        // Processar tarefas
        tasks.forEach(task => {
            // Contadores gerais
            if (task.completed) {
                stats.completed++;
            } else {
                stats.pending++;
            }

            // Por prioridade
            if (task.priority === 'high') stats.high++;
            else if (task.priority === 'medium') stats.medium++;
            else stats.low++;

            // Por dia
            const date = task.date;
            if (!stats.byDay[date]) {
                stats.byDay[date] = { total: 0, completed: 0 };
            }
            stats.byDay[date].total++;
            if (task.completed) {
                stats.byDay[date].completed++;
            }

            // Por semana
            const week = this.getWeekNumber(new Date(date));
            if (!stats.byWeek[week]) {
                stats.byWeek[week] = { total: 0, completed: 0 };
            }
            stats.byWeek[week].total++;
            if (task.completed) {
                stats.byWeek[week].completed++;
            }

            // Por mês
            const month = date.substring(0, 7); // YYYY-MM
            if (!stats.byMonth[month]) {
                stats.byMonth[month] = { total: 0, completed: 0 };
            }
            stats.byMonth[month].total++;
            if (task.completed) {
                stats.byMonth[month].completed++;
            }
        });

        // Calcular taxa de conclusão
        stats.completionRate = stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100) 
            : 0;

        // Média de tarefas por dia
        const uniqueDays = Object.keys(stats.byDay).length;
        stats.avgTasksPerDay = uniqueDays > 0 
            ? (stats.total / uniqueDays).toFixed(1) 
            : 0;

        // Dia mais produtivo
        let maxCompleted = 0;
        Object.entries(stats.byDay).forEach(([date, data]) => {
            if (data.completed > maxCompleted) {
                maxCompleted = data.completed;
                stats.mostProductiveDay = this.formatDateBR(date);
            }
        });

        // Calcular streak
        stats.streak = this.calculateStreak(stats.byDay);

        return stats;
    }

    /**
     * Gráfico de tarefas por prioridade (Pizza/Doughnut)
     */
    renderPriorityChart(stats) {
        const ctx = document.getElementById('priorityChart');
        if (!ctx) {
            console.warn('⚠️ Canvas priorityChart não encontrado');
            return Promise.resolve();
        }

        this.destroyChart('priority');

        const data = [stats.high || 0, stats.medium || 0, stats.low || 0];
        const total = data.reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            console.warn('⚠️ Sem dados para gráfico de prioridades');
            return Promise.resolve();
        }

        try {
            this.charts.priority = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['🔴 Alta', '🟠 Média', '🟢 Baixa'],
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            this.chartColors.danger,
                            this.chartColors.warning,
                            this.chartColors.secondary
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverOffset: 10
                    }]
                },
                options: {
                    ...this.defaultChartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                        ...this.defaultChartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Tarefas por Prioridade',
                            font: {
                                size: 16,
                                weight: 'bold',
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                            },
                            padding: {
                                top: 10,
                                bottom: 20
                            }
                        },
                        tooltip: {
                            ...this.defaultChartOptions.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de prioridades renderizado');
            return Promise.resolve();
        } catch (error) {
            console.error('❌ Erro ao renderizar gráfico de prioridades:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Gráfico de desempenho semanal (Linha)
     */
    renderWeekPerformanceChart(stats) {
        const ctx = document.getElementById('weekPerformanceChart');
        if (!ctx) {
            console.warn('⚠️ Canvas weekPerformanceChart não encontrado');
            return Promise.resolve();
        }

        this.destroyChart('weekPerformance');

        // Últimas 7 semanas
        const weeks = this.getLast7Weeks();
        const completedData = [];
        const totalData = [];

        weeks.forEach(week => {
            const weekData = stats.byWeek[week] || { total: 0, completed: 0 };
            totalData.push(weekData.total);
            completedData.push(weekData.completed);
        });

        try {
            this.charts.weekPerformance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: weeks.map(w => `Semana ${w}`),
                    datasets: [
                        {
                            label: '✅ Concluídas',
                            data: completedData,
                            borderColor: this.chartColors.secondary,
                            backgroundColor: this.chartColors.secondaryLight,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: this.chartColors.secondary,
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        },
                        {
                            label: '📋 Total',
                            data: totalData,
                            borderColor: this.chartColors.primary,
                            backgroundColor: this.chartColors.primaryLight,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: this.chartColors.primary,
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    ...this.defaultChartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                        ...this.defaultChartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Desempenho Semanal',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,
                                bottom: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 11
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de desempenho semanal renderizado');
            return Promise.resolve();
        } catch (error) {
            console.error('❌ Erro ao renderizar gráfico semanal:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Gráfico de taxa de conclusão (Barra Empilhada)
     */
    renderCompletionChart(stats) {
        const ctx = document.getElementById('completionChart');
        if (!ctx) {
            console.warn('⚠️ Canvas completionChart não encontrado');
            return Promise.resolve();
        }

        this.destroyChart('completion');

        // Últimos 6 meses
        const months = this.getLast6Months();
        const completedData = [];
        const pendingData = [];

        months.forEach(month => {
            const monthData = stats.byMonth[month] || { total: 0, completed: 0 };
            completedData.push(monthData.completed);
            pendingData.push(monthData.total - monthData.completed);
        });

        try {
            this.charts.completion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months.map(m => this.formatMonth(m)),
                    datasets: [
                        {
                            label: '✅ Concluídas',
                            data: completedData,
                            backgroundColor: this.chartColors.secondary,
                            borderWidth: 0,
                            borderRadius: 6
                        },
                        {
                            label: '⏳ Pendentes',
                            data: pendingData,
                            backgroundColor: this.chartColors.warning,
                            borderWidth: 0,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    ...this.defaultChartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                        ...this.defaultChartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Tarefas Concluídas vs Pendentes (6 meses)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,
                                bottom: 20
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 11
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de conclusão renderizado');
            return Promise.resolve();
        } catch (error) {
            console.error('❌ Erro ao renderizar gráfico de conclusão:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Heatmap de produtividade (Canvas personalizado)
     */
    renderHeatmap(stats) {
        const canvas = document.getElementById('heatmapChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        
        ctx.scale(2, 2);

        // Últimos 90 dias
        const days = 90;
        const cellSize = (width / 2 - 40) / 13; // 13 semanas
        const today = new Date();

        // Limpar canvas
        ctx.clearRect(0, 0, width, height);

        // Desenhar grade
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            
            const dayData = stats.byDay[dateStr] || { total: 0, completed: 0 };
            const intensity = dayData.completed > 0 
                ? Math.min(dayData.completed / 5, 1) 
                : 0;

            const col = Math.floor(i / 7);
            const row = i % 7;
            const x = 30 + col * (cellSize + 2);
            const y = 20 + row * (cellSize + 2);

            // Cor baseada na intensidade
            const color = this.getHeatmapColor(intensity);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, cellSize, cellSize);

            // Borda
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }

        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Heatmap de Produtividade (90 dias)', 10, 15);

        // Legenda
        ctx.font = '10px sans-serif';
        ctx.fillText('Menos', width / 2 - 100, height / 2 - 5);
        for (let i = 0; i <= 4; i++) {
            const color = this.getHeatmapColor(i / 4);
            ctx.fillStyle = color;
            ctx.fillRect(width / 2 - 50 + i * 15, height / 2 - 15, 12, 12);
        }
        ctx.fillStyle = '#333';
        ctx.fillText('Mais', width / 2 + 20, height / 2 - 5);
    }

    /**
     * Gráfico de categorias/tags
     */
    renderCategoryChart(stats) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) {
            console.warn('⚠️ Canvas categoryChart não encontrado');
            return;
        }

        this.destroyChart('category');

        // Dados baseados nas prioridades
        const data = [stats.high || 0, stats.medium || 0, stats.low || 0];
        const total = data.reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            // Sem dados, mostrar mensagem
            const parent = ctx.parentElement;
            parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">📊 Nenhuma tarefa registrada</div>';
            return;
        }

        try {
            this.charts.category = new Chart(ctx, {
                type: 'polarArea',
                data: {
                    labels: ['🔴 Alta Prioridade', '🟠 Média Prioridade', '🟢 Baixa Prioridade'],
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            this.chartColors.dangerLight,
                            this.chartColors.warningLight,
                            this.chartColors.secondaryLight
                        ],
                        borderColor: [
                            this.chartColors.danger,
                            this.chartColors.warning,
                            this.chartColors.secondary
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    ...this.defaultChartOptions,
                    maintainAspectRatio: false,
                    plugins: {
                        ...this.defaultChartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Distribuição por Prioridade',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de categorias renderizado');
        } catch (error) {
            console.error('❌ Erro ao renderizar gráfico de categorias:', error);
        }
    }

    /**
     * Atualiza cards de estatísticas
     */
    updateStatCards(stats) {
        const updates = [
            { id: 'stat-total', value: stats.total || 0 },
            { id: 'stat-completed', value: stats.completed || 0 },
            { id: 'stat-pending', value: stats.pending || 0 },
            { id: 'stat-completion-rate', value: (stats.completionRate || 0) + '%' },
            { id: 'stat-avg-tasks', value: stats.avgTasksPerDay || '0.0' },
            { id: 'stat-streak', value: (stats.streak || 0) + ' dias' }
        ];

        updates.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                // Animação de contagem
                this.animateValue(element, value);
            }
        });
        
        console.log('✅ Cards de estatísticas atualizados', stats);
    }
    
    /**
     * Anima o valor de um elemento
     */
    animateValue(element, finalValue) {
        const isNumber = typeof finalValue === 'number';
        const hasPercent = typeof finalValue === 'string' && finalValue.includes('%');
        const hasDays = typeof finalValue === 'string' && finalValue.includes('dias');
        
        if (isNumber || hasPercent || hasDays) {
            // Extrair número
            const num = isNumber ? finalValue : parseFloat(finalValue);
            
            if (!isNaN(num)) {
                element.style.opacity = '0';
                setTimeout(() => {
                    element.textContent = finalValue;
                    element.style.opacity = '1';
                    element.style.transition = 'opacity 0.3s ease';
                }, 100);
                return;
            }
        }
        
        // Fallback: apenas atualizar
        element.textContent = finalValue;
    }

    /**
     * Utilitários
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getLast7Weeks() {
        const weeks = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 7));
            weeks.push(this.getWeekNumber(date));
        }
        return weeks;
    }

    getLast6Months() {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            months.push(`${year}-${month}`);
        }
        return months;
    }

    formatMonth(monthStr) {
        const [year, month] = monthStr.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(month) - 1]}/${year}`;
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateBR(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    getHeatmapColor(intensity) {
        const colors = [
            '#ebedf0',
            '#c6e48b',
            '#7bc96f',
            '#239a3b',
            '#196127'
        ];
        const index = Math.floor(intensity * (colors.length - 1));
        return colors[index];
    }

    calculateStreak(byDay) {
        const dates = Object.keys(byDay).sort().reverse();
        let streak = 0;
        const today = this.formatDate(new Date());
        
        for (const date of dates) {
            if (byDay[date].completed > 0) {
                streak++;
            } else if (date !== today) {
                break;
            }
        }
        
        return streak;
    }

    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    destroyCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    /**
     * Cria modal do dashboard
     */
    createDashboardModal() {
        const modal = document.createElement('div');
        modal.id = 'dashboardModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-dashboard">
                <div class="modal-header">
                    <h2>📊 Dashboard Analítico</h2>
                    <button class="btn-close" onclick="dashboardSystem.closeDashboard()">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Cards de Estatísticas -->
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-info">
                                <div class="stat-label">Total de Tarefas</div>
                                <div class="stat-value" id="stat-total">0</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">✅</div>
                            <div class="stat-info">
                                <div class="stat-label">Concluídas</div>
                                <div class="stat-value" id="stat-completed">0</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-info">
                                <div class="stat-label">Pendentes</div>
                                <div class="stat-value" id="stat-pending">0</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📈</div>
                            <div class="stat-info">
                                <div class="stat-label">Taxa de Conclusão</div>
                                <div class="stat-value" id="stat-completion-rate">0%</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-info">
                                <div class="stat-label">Média por Dia</div>
                                <div class="stat-value" id="stat-avg-tasks">0</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-info">
                                <div class="stat-label">Sequência</div>
                                <div class="stat-value" id="stat-streak">0 dias</div>
                            </div>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <canvas id="priorityChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="weekPerformanceChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="completionChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>

                    <!-- Heatmap -->
                    <div class="heatmap-container">
                        <canvas id="heatmapChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDashboard();
            }
        });
    }
}

// Inicializar sistema de dashboard
const dashboardSystem = new DashboardSystem();
