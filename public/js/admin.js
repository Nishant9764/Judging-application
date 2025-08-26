document.addEventListener('DOMContentLoaded', function() {
    // --- View Switching Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const viewToShow = this.getAttribute('data-view');

            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            views.forEach(view => {
                if (view.id === viewToShow) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });

    // --- Student Search/Filter Logic ---
    const studentSearchInput = document.getElementById('studentSearchInput');
    // Check if the search input exists on the current view
    if (studentSearchInput) {
        const studentTableRows = document.querySelectorAll('#students .data-table tbody tr');

        studentSearchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();

            studentTableRows.forEach(row => {
                // Get all text content from the row and convert to lowercase
                const rowText = row.textContent.toLowerCase();

                // If the row's text includes the search term, show it, otherwise hide it
                if (rowText.includes(searchTerm)) {
                    row.style.display = ''; // Show matching row
                } else {
                    row.style.display = 'none'; // Hide non-matching row
                }
            });
        });
    }


    // --- Modal Logic ---
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalFormFields = document.getElementById('modalFormFields');
    const closeModalBtn = document.querySelector('.close-btn');

    function openModal(title, formFieldsHTML) {
        modalTitle.textContent = title;
        modalFormFields.innerHTML = formFieldsHTML;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // NOTE: The event listener for 'addStudentBtn' has been removed.
    // The other modal triggers are kept in case they are used on other pages.
    const addSchoolBtn = document.getElementById('addSchoolBtn');
    if(addSchoolBtn) {
        addSchoolBtn.addEventListener('click', () => {
            const fields = `
                <input type="text" name="schoolName" placeholder="School Name" required>
                <input type="text" name="location" placeholder="Location">
                <textarea name="description" placeholder="Description" rows="4"></textarea>
            `;
            openModal('Add New School', fields);
        });
    }

    const addEventBtn = document.getElementById('addEventBtn');
    if(addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            const fields = `
                <input type="text" name="eventName" placeholder="Event Name" required>
                <input type="text" name="school" placeholder="Associated School">
                <input type="text" name="category" placeholder="Category">
            `;
            openModal('Add New Event', fields);
        });
    }
    
    const addJudgeBtn = document.getElementById('addJudgeBtn');
    if(addJudgeBtn) {
        addJudgeBtn.addEventListener('click', () => {
            const fields = `
                <input type="text" name="judgeName" placeholder="Judge Name" required>
                <input type="email" name="email" placeholder="Email Address">
                <input type="text" name="expertise" placeholder="Expertise (comma-separated)">
            `;
            openModal('Add New Judge', fields);
        });
    }

    // Close modal events
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Handle form submission
    document.getElementById('modalForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        closeModal();
    });
});