// Firebase Configuration (REPLACE WITH YOUR CONFIG)
const firebaseConfig = {
    apiKey: "AIzaSyA9Ex8-ptNNYwiQvkoegh0ue2AAgMGCo4s",
    authDomain: "vidyora-lost-and-found.firebaseapp.com",
    databaseURL: "https://vidyora-lost-and-found-default-rtdb.firebaseio.com",
    projectId: "vidyora-lost-and-found",
    storageBucket: "vidyora-lost-and-found.firebasestorage.app",
    messagingSenderId: "122153871464",
    appId: "1:122153871464:web:41a9c1f2c5919daa3373dd"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Enable offline persistence
firebase.database().enablePersistence()
    .catch((err) => {
        console.error("Offline support failed: ", err);
    });

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const lostBtn = document.getElementById('lostBtn');
    const foundBtn = document.getElementById('foundBtn');
    const itemType = document.getElementById('itemType');
    const itemForm = document.getElementById('itemForm');
    const submitBtn = document.getElementById('submitBtn');
    const itemsGrid = document.getElementById('itemsGrid');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const pagination = document.getElementById('pagination');
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const modalClose = document.getElementById('modalClose');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Firebase References
    const itemsRef = database.ref('lostAndFound');
    
    // Pagination Variables
    const itemsPerPage = 6;
    let currentPage = 1;
    let totalItems = 0;
    let allItems = [];
    let filteredItems = [];
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
        loadItems();
    }
    
    function setupEventListeners() {
        // Form Toggle
        lostBtn.addEventListener('click', () => {
            itemType.value = 'lost';
            lostBtn.classList.add('active');
            foundBtn.classList.remove('active');
        });
        
        foundBtn.addEventListener('click', () => {
            itemType.value = 'found';
            foundBtn.classList.add('active');
            lostBtn.classList.remove('active');
        });
        
        // Form Submission
        itemForm.addEventListener('submit', handleFormSubmit);
        
        // Search
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        
        // Filter Buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilters(btn.dataset.filter);
            });
        });
        
        // Admin Panel
        adminBtn.addEventListener('click', () => {
            const password = prompt("Enter admin password:");
            if (password === "jees1") { // Default password
                toggleAdminModal();
            } else {
                alert("Incorrect password!");
            }
        });
        modalClose.addEventListener('click', toggleAdminModal);
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                toggleAdminModal();
            }
        });
    }
    
    // Handle Form Submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) return;
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            // Create item object
            const newItem = {
                type: itemType.value,
                name: document.getElementById('itemName').value.trim(),
                description: document.getElementById('itemDescription').value.trim(),
                location: document.getElementById('location').value.trim(),
                date: document.getElementById('date').value,
                contact: document.getElementById('contact').value.trim(),
                resolved: false,
                timestamp: Date.now(),
                resolvedAt: null
            };
            
            // Push to Firebase
            await itemsRef.push(newItem);
            
            // Show success notification
            showNotification('Item submitted successfully!');
            
            // Reset form
            itemForm.reset();
        } catch (error) {
            console.error("Submission error:", error);
            showNotification('Error submitting item. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
        }
    }
    
    // Validate Form
    function validateForm() {
        const name = document.getElementById('itemName').value.trim();
        const description = document.getElementById('itemDescription').value.trim();
        const location = document.getElementById('location').value.trim();
        const date = document.getElementById('date').value;
        const contact = document.getElementById('contact').value.trim();
        
        if (!name || !description || !location || !date || !contact) {
            showNotification('Please fill all required fields', 'error');
            return false;
        }
        
        return true;
    }
    
    // Load Items from Firebase
    function loadItems() {
        itemsRef.orderByChild('timestamp').on('value', (snapshot) => {
            const itemsData = snapshot.val() || {};
            allItems = [];
            
            // Convert Firebase object to array
            for (const key in itemsData) {
                allItems.push({
                    id: key,
                    ...itemsData[key]
                });
            }
            
            // Reverse to show newest first
            allItems.reverse();
            totalItems = allItems.length;
            
            // Apply default filter
            applyFilters('all');
            
            // Hide loader
            loader.style.display = 'none';
            
            // Update admin stats if modal is open
            if (adminModal.style.display === 'flex') {
                updateAdminStats();
                loadAdminItems();
            }
        }, (error) => {
            console.error("Database error:", error);
            loader.style.display = 'none';
            itemsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error loading items. Please refresh.</p></div>';
        });
    }
    
    // Apply Filters and Search
    function applyFilters(filterType) {
        filteredItems = [...allItems];
        
        // Apply type filter
        if (filterType === 'lost') {
            filteredItems = filteredItems.filter(item => item.type === 'lost');
        } else if (filterType === 'found') {
            filteredItems = filteredItems.filter(item => item.type === 'found');
        } else if (filterType === 'resolved') {
            filteredItems = filteredItems.filter(item => item.resolved);
        } else if (filterType === 'unresolved') {
            filteredItems = filteredItems.filter(item => !item.resolved);
        }
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Update pagination
        updatePagination();
        
        // Display filtered items
        displayItems(getPaginatedItems());
    }
    
    // Handle Search
    function handleSearch() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        applyFilters(activeFilter);
    }
    
    // Debounce Search Input
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Display Items
    function displayItems(items) {
        if (items.length === 0) {
            itemsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No items found matching your criteria.</p></div>';
            pagination.style.display = 'none';
            return;
        }
        
        itemsGrid.innerHTML = '';
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = `item-card ${item.resolved ? 'resolved' : ''}`;
            
            // Format dates
            const dateObj = new Date(item.timestamp);
            const formattedDate = dateObj.toLocaleDateString() + ' at ' + dateObj.toLocaleTimeString();
            const displayDate = item.date || 'Not specified';
            
            itemCard.innerHTML = `
                <div class="item-body">
                    <span class="item-badge ${item.type}">${item.type.toUpperCase()}</span>
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-text"><strong>Description:</strong> ${item.description}</p>
                    <p class="item-text"><strong>Location:</strong> ${item.location}</p>
                    <p class="item-text"><strong>Date:</strong> ${displayDate}</p>
                    <p class="item-text"><strong>Contact:</strong> ${item.contact}</p>
                    
                    <div class="item-actions">
                        ${!item.resolved ? `
                        <button class="action-btn resolve-btn" data-id="${item.id}">
                            <i class="fas fa-check"></i> Mark Resolved
                        </button>
                        ` : ''}
                        <button class="action-btn contact-btn" onclick="alert('Contact: ${item.contact}')">
                            <i class="fas fa-envelope"></i> Contact
                        </button>
                    </div>
                    
                    <div class="item-meta">
                        <span>Reported on ${formattedDate}</span>
                    </div>
                </div>
            `;
            
            itemsGrid.appendChild(itemCard);
        });
        
        // Add event listeners to resolve buttons
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('button').dataset.id;
                markItemResolved(itemId);
            });
        });
        
        // Show pagination if needed
        pagination.style.display = filteredItems.length > itemsPerPage ? 'flex' : 'none';
    }
    
    // Mark Item as Resolved
    function markItemResolved(itemId) {
        if (confirm('Mark this item as resolved?')) {
            database.ref(`lostAndFound/${itemId}`).update({
                resolved: true,
                resolvedAt: Date.now()
            }).then(() => {
                showNotification('Item marked as resolved!');
            }).catch(error => {
                console.error("Error resolving item:", error);
                showNotification('Error resolving item', 'error');
            });
        }
    }
    
    // Pagination Functions
    function updatePagination() {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
        
        for (let i = 1; i <= pageCount; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayItems(getPaginatedItems());
                
                // Update active state
                document.querySelectorAll('.page-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                pageBtn.classList.add('active');
            });
            pagination.appendChild(pageBtn);
        }
    }
    
    function getPaginatedItems() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredItems.slice(startIndex, endIndex);
    }
    
    // Admin Panel Functions
    function toggleAdminModal() {
        if (adminModal.style.display === 'flex') {
            adminModal.style.display = 'none';
        } else {
            adminModal.style.display = 'flex';
            updateAdminStats();
            loadAdminItems();
        }
    }
    
    function updateAdminStats() {
        document.getElementById('totalItems').textContent = allItems.length;
        document.getElementById('lostItems').textContent = allItems.filter(item => item.type === 'lost').length;
        document.getElementById('foundItems').textContent = allItems.filter(item => item.type === 'found').length;
        document.getElementById('resolvedItems').textContent = allItems.filter(item => item.resolved).length;
    }
    
    function loadAdminItems() {
        const adminItemsGrid = document.getElementById('adminItemsGrid');
        adminItemsGrid.innerHTML = '';
        
        // Show last 10 items
        const recentItems = [...allItems].slice(0, 10);
        
        if (recentItems.length === 0) {
            adminItemsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No submissions yet</p></div>';
            return;
        }
        
        recentItems.forEach(item => {
            const adminItemCard = document.createElement('div');
            adminItemCard.className = `item-card ${item.resolved ? 'resolved' : ''}`;
            
            const dateObj = new Date(item.timestamp);
            const formattedDate = dateObj.toLocaleDateString();
            
            adminItemCard.innerHTML = `
                <div class="item-body">
                    <span class="item-badge ${item.type}">${item.type.toUpperCase()}</span>
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-text">${item.description}</p>
                    <p class="item-text"><small>Reported on ${formattedDate}</small></p>
                    
                    <div class="item-actions">
                        <button class="action-btn delete-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        ${!item.resolved ? `
                        <button class="action-btn resolve-btn" data-id="${item.id}">
                            <i class="fas fa-check"></i> Resolve
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            adminItemsGrid.appendChild(adminItemCard);
        });
        
        // Add event listeners to admin buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('button').dataset.id;
                deleteItem(itemId);
            });
        });
        
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('button').dataset.id;
                markItemResolved(itemId);
            });
        });
    }
    
    function deleteItem(itemId) {
        if (confirm('Permanently delete this item?')) {
            database.ref(`lostAndFound/${itemId}`).remove()
                .then(() => {
                    showNotification('Item deleted successfully');
                })
                .catch(error => {
                    console.error("Error deleting item:", error);
                    showNotification('Error deleting item', 'error');
                });
        }
    }
    
    // Export Data
    document.getElementById('exportBtn').addEventListener('click', () => {
        const dataStr = JSON.stringify(allItems, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `vidyora-lost-found-${new Date().toISOString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Data exported successfully');
    });
    
    // Cleanup Old Items
    document.getElementById('cleanupBtn').addEventListener('click', () => {
        if (confirm('Delete all items older than 30 days?')) {
            const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const updates = {};
            
            allItems.forEach(item => {
                if (item.timestamp < cutoff) {
                    updates[`lostAndFound/${item.id}`] = null;
                }
            });
            
            database.ref().update(updates)
                .then(() => {
                    showNotification('Cleanup completed');
                })
                .catch(error => {
                    console.error("Cleanup error:", error);
                    showNotification('Cleanup failed', 'error');
                });
        }
    });
    
    // Global Notification
    document.getElementById('globalNotifyBtn').addEventListener('click', () => {
        const message = prompt('Enter notification message for all users:');
        if (message) {
            database.ref('notifications').push({
                message: message,
                timestamp: Date.now()
            }).then(() => {
                showNotification('Notification sent to all users');
            });
        }
    });
    
    // Notification System
    function showNotification(message, type = 'success') {
        notification.style.backgroundColor = type === 'error' ? 'var(--danger)' : 
                                         type === 'warning' ? 'var(--warning)' : 'var(--success)';
        notificationMessage.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
    
    // Listen for global notifications
    database.ref('notifications').orderByChild('timestamp').limitToLast(1).on('child_added', (snapshot) => {
        const notificationData = snapshot.val();
        showNotification(notificationData.message, 'info');
    });
});
