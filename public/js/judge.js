// --- DOM ELEMENTS ---
const dashboardView = document.getElementById('dashboard-view');
const scoringView = document.getElementById('scoring-view');
const scoringEventTitle = document.getElementById('scoring-event-title');
const scoringEventSubtitle = document.getElementById('scoring-event-subtitle');
const studentListUl = document.getElementById('student-list-ul');
const studentListHeader = document.getElementById('student-list-header');
const studentProgressBar = document.getElementById('student-progress-bar');
const studentProgressText = document.getElementById('student-progress-text');
const scoringPanel = document.getElementById('scoring-panel');

let currentEvent = null;
let currentStudent = null;

// --- FUNCTIONS ---

/**
 * Shows the main dashboard view and hides the scoring view.
 */
function showDashboardView() {
    dashboardView.classList.remove('hidden');
    scoringView.classList.add('hidden');
    currentEvent = null;
    currentStudent = null;
}

/**
 * Shows the scoring view for a specific event.
 * @param {string} eventId - The ID of the event to display.
 */
function showScoringView(eventId) {
    currentEvent = judgeData.events.find(e => e.id === eventId);
    if (!currentEvent) {
        console.error("Event not found!");
        return;
    }

    // Update header
    scoringEventTitle.textContent = currentEvent.title;
    scoringEventSubtitle.textContent = currentEvent.subtitle;

    // Populate student list
    populateStudentList();

    // Find the first unscored student to display, or the first student if all are scored
    const firstUnscoredStudent = currentEvent.students.find(s => !s.scored);
    currentStudent = firstUnscoredStudent || (currentEvent.students.length > 0 ? currentEvent.students[0] : null);

    if (currentStudent) {
        renderScoringPanel(currentStudent.id);
    } else {
        scoringPanel.innerHTML = `<div class="text-center p-12 text-gray-500"><p>No students assigned to this event yet.</p></div>`;
    }
    
    updateStudentListActiveState();

    // Switch views
    dashboardView.classList.add('hidden');
    scoringView.classList.remove('hidden');
}

/**
 * Populates the student list for the current event.
 */
function populateStudentList() {
    studentListUl.innerHTML = ''; // Clear existing list
    if (!currentEvent || !currentEvent.students) return;

    currentEvent.students.forEach(student => {
        const li = document.createElement('li');
        li.innerHTML = `
            <button data-student-id="${student.id}" class="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="flex items-center gap-3">
                    <i data-feather="user" class="w-5 h-5 text-gray-500"></i>
                    <span class="font-medium">${student.name}</span>
                </span>
                ${student.scored ? '<i data-feather="check-circle" class="w-5 h-5 text-green-500"></i>' : ''}
            </button>
        `;
        studentListUl.appendChild(li);
    });
    
    // Add click listeners to new student buttons
    studentListUl.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const studentId = button.dataset.studentId;
            renderScoringPanel(studentId);
        });
    });

    updateStudentProgress();
    feather.replace(); // Re-render icons
}

/**
 * Renders the main scoring panel for a given student.
 * @param {string} studentId - The ID of the student to score.
 */
function renderScoringPanel(studentId) {
    currentStudent = currentEvent.students.find(s => s.id === studentId);
    if (!currentStudent) return;

    const totalScore = Object.values(currentStudent.scores).reduce((sum, val) => sum + val, 0);

    scoringPanel.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-xl font-bold">Scoring: ${currentStudent.name}</h3>
                <p class="text-gray-500">Rate each parameter from 1-10 points</p>
            </div>
            <div class="text-right">
                <p id="total-score" class="text-3xl font-bold">${totalScore}/30</p>
                <p class="text-gray-500">Total Score</p>
            </div>
        </div>

        <div class="space-y-8">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="font-semibold">Clarity</label>
                    <span class="font-bold"><span id="clarity-value">${currentStudent.scores.clarity}</span> / 10</span>
                </div>
                <p class="text-sm text-gray-500 mb-3">How clear and understandable was the presentation?</p>
                <input type="range" data-criteria="clarity" min="1" max="10" value="${currentStudent.scores.clarity}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1"><span>Poor (1)</span><span>Average (5)</span><span>Excellent (10)</span></div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="font-semibold">Confidence</label>
                    <span class="font-bold"><span id="confidence-value">${currentStudent.scores.confidence}</span> / 10</span>
                </div>
                <p class="text-sm text-gray-500 mb-3">How confident and composed was the student?</p>
                <input type="range" data-criteria="confidence" min="1" max="10" value="${currentStudent.scores.confidence}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1"><span>Poor (1)</span><span>Average (5)</span><span>Excellent (10)</span></div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="font-semibold">Creativity</label>
                    <span class="font-bold"><span id="creativity-value">${currentStudent.scores.creativity}</span> / 10</span>
                </div>
                <p class="text-sm text-gray-500 mb-3">How creative and original was the performance?</p>
                <input type="range" data-criteria="creativity" min="1" max="10" value="${currentStudent.scores.creativity}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1"><span>Poor (1)</span><span>Average (5)</span><span>Excellent (10)</span></div>
            </div>
        </div>

        <div class="mt-8">
            <label for="comments" class="font-semibold">Additional Comments (Optional)</label>
            <p class="text-sm text-gray-500 mb-3">Enter any additional feedback or observations...</p>
            <textarea id="comments" rows="4" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition">${currentStudent.comments || ''}</textarea>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
            <button id="skip-button" class="font-semibold text-gray-600 hover:text-gray-900 transition-colors">Skip for Now</button>
            <button id="submit-button" class="bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2">
                <i data-feather="check" class="w-5 h-5"></i>
                Submit Score
            </button>
        </div>
    `;
    
    // Add event listeners to the new elements
    scoringPanel.querySelector('#submit-button').addEventListener('click', handleSubmitScore);
    scoringPanel.querySelector('#skip-button').addEventListener('click', handleSkipStudent);
    scoringPanel.querySelector('#comments').addEventListener('input', (e) => {
        currentStudent.comments = e.target.value;
    });
    scoringPanel.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', handleScoreChange);
    });
    
    updateStudentListActiveState();
    feather.replace(); // Render any new icons
}

/**
 * Handles the change event for a score slider.
 */
function handleScoreChange(event) {
    const slider = event.target;
    const criteria = slider.dataset.criteria;
    const value = parseInt(slider.value, 10);

    currentStudent.scores[criteria] = value;
    document.getElementById(`${criteria}-value`).textContent = value;
    
    const totalScore = Object.values(currentStudent.scores).reduce((sum, val) => sum + val, 0);
    document.getElementById('total-score').textContent = `${totalScore}/30`;
}

/**
 * Finds and navigates to the next student in the list.
 */
function goToNextStudent() {
    const currentIndex = currentEvent.students.findIndex(s => s.id === currentStudent.id);
    const nextStudent = currentEvent.students[currentIndex + 1];

    if (nextStudent) {
        renderScoringPanel(nextStudent.id);
    } else {
        // You've reached the end of the list
        alert("You have scored all students in this event.");
        showDashboardView();
    }
}

/**
 * Handles submitting a score and moving to the next student.
 */
function handleSubmitScore() {
    currentStudent.scored = true;
    // In a real app, you would save the data to the server here.
    console.log('Submitting score for:', currentStudent.name, currentStudent.scores, currentStudent.comments);
    populateStudentList(); // Update list to show checkmark
    goToNextStudent();
}

/**
 * Handles skipping a student and moving to the next one.
 */
function handleSkipStudent() {
    goToNextStudent();
}

/**
 * Updates the active state styling in the student list.
 */
function updateStudentListActiveState() {
    studentListUl.querySelectorAll('button').forEach(button => {
        if (currentStudent && button.dataset.studentId === currentStudent.id) {
            button.classList.add('bg-gray-200');
        } else {
            button.classList.remove('bg-gray-200');
        }
    });
}

/**
 * Updates the student progress bar and text.
 */
function updateStudentProgress() {
    const totalStudents = currentEvent.students.length;
    const scoredStudents = currentEvent.students.filter(s => s.scored).length;
    const progressPercentage = totalStudents > 0 ? (scoredStudents / totalStudents) * 100 : 0;

    studentListHeader.textContent = `Students (${totalStudents})`;
    studentProgressBar.style.width = `${progressPercentage}%`;
    studentProgressText.textContent = `${Math.round(progressPercentage)}% complete`;
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    feather.replace(); // Initial render for all icons

    // Add event listeners to the main action buttons on the dashboard
    const actionButtons = document.querySelectorAll('#dashboard-view [data-event-id]');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.currentTarget.dataset.eventId;
            showScoringView(eventId);
        });
    });
});