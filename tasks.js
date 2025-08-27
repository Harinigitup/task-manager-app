// Task management functionality
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('priorityFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        if (!window.authManager.isAuthenticated()) {
            alert('Please login to create tasks');
            return;
        }

        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const task = {
            id: Date.now().toString(),
            title: title,
            description: description,
            category: category,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: window.authManager.getCurrentUser().id
        };

        this.addTask(task);
        document.getElementById('taskForm').reset();
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            
            // Filter tasks for current user
            if (window.authManager.isAuthenticated()) {
                const userId = window.authManager.getCurrentUser().id;
                this.tasks = this.tasks.filter(task => task.userId === userId);
            }
            
            this.renderTasks();
        }
    }

    applyFilters() {
        this.renderTasks();
    }

    getFilteredTasks() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        return this.tasks.filter(task => {
            // Category filter
            if (categoryFilter !== 'all' && task.category !== categoryFilter) {
                return false;
            }

            // Priority filter
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'completed' && !task.completed) return false;
                if (statusFilter === 'pending' && task.completed) return false;
            }

            // Search filter
            if (searchTerm && 
                !task.title.toLowerCase().includes(searchTerm) &&
                !task.description.toLowerCase().includes(searchTerm)) {
                return false;
            }

            return true;
        });
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">No tasks found. Create your first task!</p>';
            return;
        }

        tasksList.innerHTML = filteredTasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(task => this.createTaskCard(task))
            .join('');
        
        // Add event listeners to new task cards
        this.addTaskEventListeners();
    }

    createTaskCard(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const completedClass = task.completed ? 'completed' : '';
        
        return `
            <div class="task-card priority-${task.priority} ${completedClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <p class="task-description">${this.escapeHtml(task.description || 'No description')}</p>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-sm ${task.completed ? 'btn-outline' : 'btn-success'}" 
                                data-action="toggle">
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn btn-sm btn-outline" data-action="edit">Edit</button>
                        <button class="btn btn-sm btn-danger" data-action="delete">Delete</button>
                    </div>
                </div>
                <div class="task-meta">
                    <span class="category">${task.category}</span>
                    <span class="priority">${task.priority}</span>
                    <span class="due-date">${dueDate}</span>
                    <span class="status">${task.completed ? 'Completed' : 'Pending'}</span>
                </div>
            </div>
        `;
    }

    addTaskEventListeners() {
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;
            
            card.querySelector('[data-action="toggle"]').addEventListener('click', () => {
                this.toggleTaskCompletion(taskId);
            });
            
            card.querySelector('[data-action="edit"]').addEventListener('click', () => {
                this.editTask(taskId);
            });
            
            card.querySelector('[data-action="delete"]').addEventListener('click', () => {
                this.deleteTask(taskId);
            });
        });
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Populate form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';

        // Remove the task (will be re-added with updated data)
        this.deleteTask(taskId);
        
        // Scroll to form
        document.getElementById('taskForm').scrollIntoView({ behavior: 'smooth' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTasksCount() {
        return {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length
        };
    }
}

// Initialize task manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
