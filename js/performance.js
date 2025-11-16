/**
 * TaskFlow - Performance Monitoring & Analytics System
 * Enterprise-level monitoring with Web Vitals, Error Tracking, and User Analytics
 * @author Carlos Antonio de Oliveira Piquet
 * @version 1.0.0 - Google-Level Performance
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            vitals: {},
            custom: {},
            errors: [],
            userActions: []
        };
        
        this.config = {
            enableVitals: true,
            enableErrorTracking: true,
            enableUserTracking: true,
            sampleRate: 1.0, // 100% sampling
            reportingEndpoint: null // Set to send data to backend
        };
    }

    /**
     * Initialize Performance Monitoring
     */
    async init() {
        console.log('📊 Initializing Performance Monitor...');
        
        if (this.config.enableVitals) {
            this.measureWebVitals();
        }
        
        if (this.config.enableErrorTracking) {
            this.setupErrorTracking();
        }
        
        if (this.config.enableUserTracking) {
            this.setupUserTracking();
        }
        
        // Measure initial load performance
        this.measurePageLoad();
        
        // Report performance periodically
        this.startPeriodicReporting();
        
        console.log('✅ Performance Monitor initialized');
    }

    /**
     * Measure Core Web Vitals
     * LCP, FID, CLS, FCP, TTFB
     */
    measureWebVitals() {
        // Use Web Vitals API
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            this.observePerformance('largest-contentful-paint', (entry) => {
                const lcp = entry.renderTime || entry.loadTime;
                this.metrics.vitals.LCP = lcp;
                this.reportMetric('LCP', lcp, this.getRating(lcp, [2500, 4000]));
            });

            // First Input Delay (FID)
            this.observePerformance('first-input', (entry) => {
                const fid = entry.processingStart - entry.startTime;
                this.metrics.vitals.FID = fid;
                this.reportMetric('FID', fid, this.getRating(fid, [100, 300]));
            });

            // Cumulative Layout Shift (CLS)
            this.observeCLS();

            // First Contentful Paint (FCP)
            this.observePerformance('paint', (entry) => {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.vitals.FCP = entry.startTime;
                    this.reportMetric('FCP', entry.startTime, this.getRating(entry.startTime, [1800, 3000]));
                }
            });

            // Time to First Byte (TTFB)
            this.measureTTFB();
        }

        // Interaction to Next Paint (INP) - newer metric
        this.measureINP();
    }

    /**
     * Observe performance entries
     */
    observePerformance(type, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    callback(entry);
                }
            });
            observer.observe({ type, buffered: true });
        } catch (error) {
            console.warn(`Failed to observe ${type}:`, error);
        }
    }

    /**
     * Observe Cumulative Layout Shift
     */
    observeCLS() {
        let clsValue = 0;
        let clsEntries = [];

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = clsEntries[0];
                    const lastSessionEntry = clsEntries[clsEntries.length - 1];

                    if (entry.startTime - lastSessionEntry?.startTime < 1000 &&
                        entry.startTime - firstSessionEntry?.startTime < 5000) {
                        clsEntries.push(entry);
                        clsValue += entry.value;
                    } else {
                        clsEntries = [entry];
                        clsValue = entry.value;
                    }

                    this.metrics.vitals.CLS = clsValue;
                    this.reportMetric('CLS', clsValue, this.getRating(clsValue, [0.1, 0.25]));
                }
            }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
    }

    /**
     * Measure Time to First Byte
     */
    measureTTFB() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            const ttfb = navTiming.responseStart - navTiming.requestStart;
            this.metrics.vitals.TTFB = ttfb;
            this.reportMetric('TTFB', ttfb, this.getRating(ttfb, [800, 1800]));
        }
    }

    /**
     * Measure Interaction to Next Paint (INP)
     */
    measureINP() {
        let maxInp = 0;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const inp = entry.processingStart - entry.startTime;
                maxInp = Math.max(maxInp, inp);
                this.metrics.vitals.INP = maxInp;
            }
        });

        try {
            observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
        } catch (error) {
            // INP not supported
        }
    }

    /**
     * Measure Page Load Performance
     */
    measurePageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                
                this.metrics.custom.pageLoad = pageLoadTime;
                this.metrics.custom.domReady = domReadyTime;
                
                console.log(`📈 Page Load: ${pageLoadTime}ms | DOM Ready: ${domReadyTime}ms`);
                
                this.reportCustomMetric('PageLoad', {
                    total: pageLoadTime,
                    domReady: domReadyTime,
                    resources: performance.getEntriesByType('resource').length
                });
            }, 0);
        });
    }

    /**
     * Setup Error Tracking
     */
    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'JavaScript Error',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackError({
                    type: 'Resource Load Error',
                    resource: event.target.src || event.target.href,
                    element: event.target.tagName,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * Track Error
     */
    trackError(error) {
        this.metrics.errors.push(error);
        
        console.error('❌ Error tracked:', error);
        
        // Limit error storage
        if (this.metrics.errors.length > 100) {
            this.metrics.errors.shift();
        }
        
        // Send to analytics
        this.sendAnalytics('error', error);
    }

    /**
     * Setup User Action Tracking
     */
    setupUserTracking() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackAction('click', {
                element: e.target.tagName,
                class: e.target.className,
                id: e.target.id,
                text: e.target.textContent?.substring(0, 50)
            });
        });

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.trackAction('visibility', {
                hidden: document.hidden
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = Math.floor(scrollPercent / 25) * 25; // Track in 25% increments
                this.trackAction('scroll', { depth: maxScroll });
            }
        });
    }

    /**
     * Track User Action
     */
    trackAction(type, data) {
        const action = {
            type,
            data,
            timestamp: Date.now()
        };
        
        this.metrics.userActions.push(action);
        
        // Limit action storage
        if (this.metrics.userActions.length > 200) {
            this.metrics.userActions.shift();
        }
    }

    /**
     * Get metric rating (good, needs-improvement, poor)
     */
    getRating(value, thresholds) {
        if (value <= thresholds[0]) return 'good';
        if (value <= thresholds[1]) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Report metric to console
     */
    reportMetric(name, value, rating) {
        const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
        console.log(`%c${name}: ${value.toFixed(2)}ms [${rating}]`, `color: ${color}; font-weight: bold;`);
    }

    /**
     * Report custom metric
     */
    reportCustomMetric(name, data) {
        console.log(`%c📊 ${name}:`, 'color: #4f46e5; font-weight: bold;', data);
    }

    /**
     * Send analytics data
     */
    sendAnalytics(type, data) {
        if (Math.random() > this.config.sampleRate) return;
        
        if (this.config.reportingEndpoint) {
            // Send to backend
            fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data, timestamp: Date.now() })
            }).catch(err => console.warn('Failed to send analytics:', err));
        }
    }

    /**
     * Start periodic reporting
     */
    startPeriodicReporting() {
        setInterval(() => {
            this.generateReport();
        }, 60000); // Every minute
    }

    /**
     * Generate performance report
     */
    generateReport() {
        const report = {
            vitals: this.metrics.vitals,
            custom: this.metrics.custom,
            errorCount: this.metrics.errors.length,
            actionCount: this.metrics.userActions.length,
            timestamp: Date.now()
        };
        
        console.log('%c📊 Performance Report:', 'color: #4f46e5; font-weight: bold; font-size: 14px;', report);
        
        return report;
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            report: this.generateReport()
        };
    }
}

// Initialize global performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
