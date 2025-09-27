// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Admin user dropdown
    const adminUserButton = document.querySelector('.admin-user-button');
    const adminDropdownMenu = document.querySelector('.admin-dropdown-menu');
    
    if (adminUserButton && adminDropdownMenu) {
        adminUserButton.addEventListener('click', function(e) {
            e.stopPropagation();
            adminDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            adminDropdownMenu.classList.remove('show');
        });
    }
    
    // Initialize admin dashboard
    AdminDashboard.init();
    
    // Initialize user management
    UserManagement.init();
    
    // Initialize analytics
    Analytics.init();
});

// Admin Dashboard Management
const AdminDashboard = {
    init() {
        this.loadDashboardData();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Export data button
        const exportBtn = document.querySelector('.admin-header-actions .btn-outline');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // Add user button
        const addUserBtn = document.querySelector('.admin-header-actions .btn-primary');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }
        
        // Search functionality
        const searchInput = document.querySelector('.admin-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchUsers(e.target.value));
        }
        
        // Filter functionality
        const filterBtn = document.querySelector('.admin-card-actions .btn-outline');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.showFilterModal());
        }
    },
    
    async loadDashboardData() {
        try {
            // Simulate API call
            const data = await this.fetchDashboardStats();
            this.updateStats(data);
            this.updateRecentActivity(data.recentActivity);
            this.updateUsersTable(data.users);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    },
    
    async fetchDashboardStats() {
        // Simulate API response
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalUsers: 25847,
                    totalCards: 52394,
                    totalViews: 1200000,
                    revenue: 48392,
                    userGrowth: 12.5,
                    cardGrowth: 8.3,
                    viewGrowth: 15.7,
                    revenueGrowth: 22.1,
                    recentActivity: [
                        {
                            type: 'user_registered',
                            user: 'john.doe@example.com',
                            time: '2 minutes ago',
                            icon: 'fa-user-plus'
                        },
                        {
                            type: 'card_created',
                            user: 'Sarah Johnson',
                            time: '5 minutes ago',
                            icon: 'fa-id-card'
                        },
                        {
                            type: 'card_shared',
                            user: 'Michael Chen',
                            time: '8 minutes ago',
                            icon: 'fa-share'
                        },
                        {
                            type: 'subscription_purchased',
                            user: 'Emily Rodriguez',
                            time: '12 minutes ago',
                            icon: 'fa-credit-card'
                        }
                    ],
                    users: [
                        {
                            id: 1,
                            name: 'John Doe',
                            email: 'john.doe@example.com',
                            plan: 'Premium',
                            cards: 3,
                            joined: 'Jan 15, 2025',
                            status: 'Active'
                        },
                        {
                            id: 2,
                            name: 'Sarah Johnson',
                            email: 'sarah.j@example.com',
                            plan: 'Free',
                            cards: 1,
                            joined: 'Jan 12, 2025',
                            status: 'Active'
                        },
                        {
                            id: 3,
                            name: 'Michael Chen',
                            email: 'm.chen@company.com',
                            plan: 'Business',
                            cards: 5,
                            joined: 'Jan 10, 2025',
                            status: 'Active'
                        }
                    ]
                });
            }, 1000);
        });
    },
    
    updateStats(data) {
        const statNumbers = document.querySelectorAll('.admin-stat-number');
        const statChanges = document.querySelectorAll('.admin-stat-change');
        
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = this.formatNumber(data.totalUsers);
            statNumbers[1].textContent = this.formatNumber(data.totalCards);
            statNumbers[2].textContent = this.formatNumber(data.totalViews, true);
            statNumbers[3].textContent = '$' + this.formatNumber(data.revenue);
        }
        
        if (statChanges.length >= 4) {
            statChanges[0].innerHTML = `<i class="fas fa-arrow-up"></i> +${data.userGrowth}% from last month`;
            statChanges[1].innerHTML = `<i class="fas fa-arrow-up"></i> +${data.cardGrowth}% from last month`;
            statChanges[2].innerHTML = `<i class="fas fa-arrow-up"></i> +${data.viewGrowth}% from last month`;
            statChanges[3].innerHTML = `<i class="fas fa-arrow-up"></i> +${data.revenueGrowth}% from last month`;
        }
    },
    
    updateRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.getActivityTitle(activity.type)}</div>
                    <div class="activity-meta">${activity.user} • ${activity.time}</div>
                </div>
            </div>
        `).join('');
    },
    
    getActivityTitle(type) {
        const titles = {
            'user_registered': 'New user registered',
            'card_created': 'Digital card created',
            'card_shared': 'Card shared via QR code',
            'subscription_purchased': 'Premium subscription purchased'
        };
        return titles[type] || 'Unknown activity';
    },
    
    updateUsersTable(users) {
        const tbody = document.querySelector('.admin-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${this.getInitials(user.name)}</div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-role">${user.plan} User</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.plan.toLowerCase()}">${user.plan}</span></td>
                <td>${user.cards}</td>
                <td>${user.joined}</td>
                <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View" onclick="UserManagement.viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" title="Edit" onclick="UserManagement.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="UserManagement.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    formatNumber(num, abbreviated = false) {
        if (abbreviated && num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (abbreviated && num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    exportData() {
        // Simulate data export
        this.showNotification('Exporting data...', 'info');
        
        setTimeout(() => {
            this.showNotification('Data exported successfully!', 'success');
        }, 2000);
    },
    
    showAddUserModal() {
        // Show add user modal (would be implemented with a modal library)
        this.showNotification('Add user modal would open here', 'info');
    },
    
    searchUsers(query) {
        // Implement user search functionality
        console.log('Searching users:', query);
    },
    
    showFilterModal() {
        // Show filter modal
        this.showNotification('Filter modal would open here', 'info');
    },
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <div class="admin-notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="admin-notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.admin-notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    },
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    },
    
    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
};

// User Management
const UserManagement = {
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Pagination buttons
        const prevBtn = document.querySelector('.admin-pagination .btn:first-child');
        const nextBtn = document.querySelector('.admin-pagination .btn:last-child');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }
    },
    
    viewUser(userId) {
        console.log('Viewing user:', userId);
        AdminDashboard.showNotification(`Viewing user ${userId}`, 'info');
    },
    
    editUser(userId) {
        console.log('Editing user:', userId);
        AdminDashboard.showNotification(`Editing user ${userId}`, 'info');
    },
    
    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            console.log('Deleting user:', userId);
            AdminDashboard.showNotification(`User ${userId} deleted`, 'success');
        }
    },
    
    previousPage() {
        console.log('Previous page');
        AdminDashboard.showNotification('Loading previous page...', 'info');
    },
    
    nextPage() {
        console.log('Next page');
        AdminDashboard.showNotification('Loading next page...', 'info');
    }
};

// Analytics
const Analytics = {
    init() {
        this.setupCharts();
    },
    
    setupCharts() {
        // Initialize chart (would use Chart.js or similar library)
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--gray-500);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>User Growth Chart</p>
                    <p style="font-size: 0.875rem;">Chart.js integration would go here</p>
                </div>
            `;
        }
    }
};

// Export for global access
window.AdminDashboard = AdminDashboard;
window.UserManagement = UserManagement;
window.Analytics = Analytics;
