document.addEventListener('DOMContentLoaded', function() {
    // --- View Switching Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            // Get the view to show from the data-view attribute
            const viewToShow = this.getAttribute('data-view');

            // Update active link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show the selected view and hide others
            views.forEach(view => {
                if (view.id === viewToShow) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalFormFields = document.getElementById('modalFormFields');
    const closeModalBtn = document.querySelector('.close-btn');

    // Function to open the modal with specific content
    function openModal(title, formFieldsHTML) {
        modalTitle.textContent = title;
        modalFormFields.innerHTML = formFieldsHTML;
        modal.style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Event listeners for modal triggers
    document.getElementById('addSchoolBtn').addEventListener('click', () => {
        const fields = `
            <input type="text" name="schoolName" placeholder="School Name" required>
            <input type="text" name="location" placeholder="Location">
            <textarea name="description" placeholder="Description" rows="4"></textarea>
        `;
        openModal('Add New School', fields);
    });

    document.getElementById('addEventBtn').addEventListener('click', () => {
        const fields = `
            <input type="text" name="eventName" placeholder="Event Name" required>
            <input type="text" name="school" placeholder="Associated School">
            <input type="text" name="category" placeholder="Category">
        `;
        openModal('Add New Event', fields);
    });

    document.getElementById('addJudgeBtn').addEventListener('click', () => {
        const fields = `
            <input type="text" name="judgeName" placeholder="Judge Name" required>
            <input type="email" name="email" placeholder="Email Address">
            <input type="text" name="expertise" placeholder="Expertise (comma-separated)">
        `;
        openModal('Add New Judge', fields);
    });
    
    document.getElementById('addStudentBtn').addEventListener('click', () => {
        const fields = `
            <input type="text" name="studentName" placeholder="Student Name" required>
            <input type="text" name="school" placeholder="School Name">
            <input type="text" name="event" placeholder="Event Name">
        `;
        openModal('Add New Student', fields);
    });


    // Close modal events
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Handle form submission (for demonstration)
    document.getElementById('modalForm').addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Form submitted!');
        // In a real application, you would collect form data and send it to the server.
        const formData = new FormData(this);
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        closeModal();
    });
});
