// Main application script
class TaskManagerApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.checkAuthStatus();
        this.setupDemoData();
    }

    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('authModal');
                if (modal.style.display === 'block') {
                    window.authManager.closeAuthModal();
                }
            }
            
            // Ctrl+K or Cmd+K focuses search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });

        // Responsive design adjustments
        window.addEventListener('resize', () => this.handleResize());
    }

    checkAuthStatus() {
        // Check auth status periodically (every 5 minutes)
        setInterval(() => {
            if (!window.authManager.isAuthenticated()) {
                window.authManager.showAuthContent();
            }
        }, 5 * 60 * 1000);
    }

    handleResize() {
        // Add responsive class for mobile
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    setupDemoData() {
        // Add some demo tasks if no tasks exist and user is logged in
        setTimeout(() => {
            if (window.authManager.isAuthenticated() && window.taskManager.tasks.length === 0) {
                if (confirm('Would you like to add some demo tasks to get started?')) {
                    this.addDemoTasks();
                }
            }
        }, 1000);
    }

    addDemoTasks() {
        const demoTasks = [
            {
                title: 'Complete project proposal',
                description: 'Finish the project proposal document and send it for review',
                category: 'work',
                priority: 'high',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                title: 'Buy groceries',
                description: 'Milk, eggs, bread, fruits, and vegetables',
                category: 'shopping',
                priority: 'medium',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                title: 'Morning workout',
                description: '30 minutes of cardio and strength training',
                category: 'health',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0]
            },
            {
                title: 'Read book',
                description: 'Read at least one chapter of the current book',
                category: 'personal',
                priority: 'low',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ];

        demoTasks.forEach(taskData => {
            const task = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ...taskData,
                completed: false,
                createdAt: new Date().toISOString(),
                userId: window.authManager.getCurrentUser().id
            };
            window.taskManager.addTask(task);
        });

        alert('Demo tasks added successfully!');
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getPriorityColor(priority) {
        const colors = {
            high: '#dc3545',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colors[priority] || '#6c757d';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                }
                .notification-info { background: #17a2b8; }
                .notification-success { background: #28a745; }
                .notification-warning { background: #ffc107; color: #212529; }
                .notification-error { background: #dc3545; }
                .notification button {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
    window.taskManagerApp = new TaskManagerApp();
    
    // Add some helpful console messages
    console.log('Task Manager App initialized!');
    console.log('Available global objects:');
    console.log('- window.authManager: Authentication management');
    console.log('- window.taskManager: Task management');
    console.log('- window.taskManagerApp: Main application');
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
