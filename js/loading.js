/**
 * TaskFlow - Skeleton Loader & Loading States
 * Enterprise-level progressive loading with animated placeholders
 * @author Carlos Antonio de Oliveira Piquet
 * @version 1.0.0 - Google-Level UX
 */

class LoadingSystem {
    constructor() {
        this.activeLoaders = new Set();
    }

    /**
     * Create skeleton loader for dashboard
     */
    createDashboardSkeleton() {
        return `
            <div class="skeleton-container">
                <!-- Stats Cards Skeleton -->
                <div class="skeleton-stats-grid">
                    ${this.createStatsCardSkeleton().repeat(6)}
                </div>
                
                <!-- Charts Skeleton -->
                <div class="skeleton-charts-grid">
                    ${this.createChartSkeleton().repeat(4)}
                </div>
            </div>
        `;
    }

    /**
     * Create stats card skeleton
     */
    createStatsCardSkeleton() {
        return `
            <div class="skeleton-stat-card">
                <div class="skeleton-icon skeleton-pulse"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line skeleton-line-sm skeleton-shimmer"></div>
                    <div class="skeleton-line skeleton-line-lg skeleton-shimmer"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create chart skeleton
     */
    createChartSkeleton() {
        return `
            <div class="skeleton-chart">
                <div class="skeleton-chart-header">
                    <div class="skeleton-line skeleton-line-md skeleton-shimmer"></div>
                </div>
                <div class="skeleton-chart-body">
                    <div class="skeleton-chart-placeholder skeleton-pulse"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create task list skeleton
     */
    createTaskListSkeleton(count = 3) {
        return `
            <div class="skeleton-task-list">
                ${Array(count).fill(this.createTaskSkeleton()).join('')}
            </div>
        `;
    }

    /**
     * Create task skeleton
     */
    createTaskSkeleton() {
        return `
            <div class="skeleton-task">
                <div class="skeleton-checkbox skeleton-pulse"></div>
                <div class="skeleton-task-content">
                    <div class="skeleton-line skeleton-line-lg skeleton-shimmer"></div>
                    <div class="skeleton-line skeleton-line-md skeleton-shimmer"></div>
                </div>
                <div class="skeleton-badge skeleton-pulse"></div>
            </div>
        `;
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay(message = 'Carregando...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        this.activeLoaders.add('overlay');
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
            this.activeLoaders.delete('overlay');
        }
    }

    /**
     * Show inline loader in element
     */
    showInlineLoader(element, size = 'medium') {
        const loader = document.createElement('div');
        loader.className = `inline-loader inline-loader-${size}`;
        loader.innerHTML = `
            <div class="loader-spinner"></div>
        `;
        element.appendChild(loader);
        return loader;
    }

    /**
     * Show button loading state
     */
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = `
                <span class="button-loader"></span>
                <span>Processando...</span>
            `;
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Salvar';
            button.classList.remove('btn-loading');
        }
    }

    /**
     * Show progress bar
     */
    showProgress(percentage) {
        let progressBar = document.getElementById('global-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'global-progress';
            progressBar.className = 'global-progress';
            progressBar.innerHTML = `<div class="global-progress-bar"></div>`;
            document.body.appendChild(progressBar);
        }
        
        const bar = progressBar.querySelector('.global-progress-bar');
        bar.style.width = `${percentage}%`;
        
        if (percentage >= 100) {
            setTimeout(() => {
                progressBar.remove();
            }, 500);
        }
    }

    /**
     * Lazy load images
     */
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('lazy-loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Preload critical resources
     */
    preloadResources(resources) {
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.type;
            link.href = resource.url;
            document.head.appendChild(link);
        });
    }
}

// CSS for skeleton loaders and loading states
const loadingStyles = `
/* Skeleton Loaders */
.skeleton-container {
    padding: 1rem;
}

.skeleton-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
}

.skeleton-stat-card {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    padding: 1.75rem;
    display: flex;
    gap: 1.25rem;
}

.skeleton-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: var(--bg-tertiary);
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skeleton-line {
    height: 16px;
    background: var(--bg-tertiary);
    border-radius: 4px;
}

.skeleton-line-sm {
    width: 60%;
}

.skeleton-line-md {
    width: 80%;
}

.skeleton-line-lg {
    width: 100%;
    height: 24px;
}

.skeleton-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2rem;
}

.skeleton-chart {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    padding: 2rem;
    height: 400px;
}

.skeleton-chart-header {
    margin-bottom: 1.5rem;
}

.skeleton-chart-placeholder {
    width: 100%;
    height: 300px;
    background: var(--bg-tertiary);
    border-radius: 8px;
}

/* Animations */
.skeleton-pulse {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-shimmer {
    background: linear-gradient(
        90deg,
        var(--bg-tertiary) 0%,
        var(--border-color) 50%,
        var(--bg-tertiary) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

@keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Loading Overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.3s ease;
}

.loading-overlay.fade-out {
    animation: fadeOut 0.3s ease;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top: 4px solid white;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 0.8s linear infinite;
}

.loading-message {
    font-size: 1.1rem;
    font-weight: 500;
}

/* Button Loading */
.btn-loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
}

.button-loader {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 0.5rem;
}

/* Global Progress Bar */
.global-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    z-index: 99999;
}

.global-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
    box-shadow: 0 0 10px var(--primary-color);
}

/* Animations */
@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* Lazy Load Images */
img.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

img.lazy-loaded {
    opacity: 1;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);

// Initialize global loading system
const loadingSystem = new LoadingSystem();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingSystem;
}
