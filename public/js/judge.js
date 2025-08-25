document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element Selections ---
    const sliders = document.querySelectorAll('.score-slider');
    const totalScoreElement = document.getElementById('total-score');
    const studentItems = document.querySelectorAll('.student-item');
    const scoringStudentNameElement = document.getElementById('scoring-student-name');
    const generateFeedbackBtn = document.getElementById('generate-feedback-btn');
    const commentsTextarea = document.getElementById('comments');
    const loadingSpinner = document.getElementById('loading-spinner');
    const eventNameElement = document.getElementById('event-name');

    // --- Core Functions ---

    /**
     * Updates the displayed score next to a slider and recalculates the total score.
     * @param {HTMLInputElement} slider - The range input element that was changed.
     */
    function updateScore(slider) {
        const scoreDisplay = slider.nextElementSibling;
        if (scoreDisplay && scoreDisplay.classList.contains('score-value')) {
            scoreDisplay.textContent = `${slider.value} / ${slider.max}`;
        }
        updateTotalScore();
    }

    /**
     * Calculates the sum of all slider values and updates the total score display.
     */
    function updateTotalScore() {
        let total = 0;
        sliders.forEach(slider => {
            total += parseInt(slider.value, 10);
        });
        totalScoreElement.textContent = total;
    }
    
    /**
     * Updates the main scoring header with the currently selected student's name.
     * @param {string} studentName - The name of the student to display.
     */
    function updateCurrentStudent(studentName) {
        scoringStudentNameElement.textContent = `Scoring: ${studentName}`;
    }

    // --- Gemini API Integration ---

    /**
     * Fetches feedback from the Gemini API based on current scores.
     */
    async function generateFeedback() {
        // 1. Show loading indicator and disable button
        loadingSpinner.style.display = 'flex';
        generateFeedbackBtn.disabled = true;
        commentsTextarea.value = ''; // Clear previous comments

        // 2. Collect data for the prompt
        const studentName = document.querySelector('.student-item.active').dataset.studentName;
        const eventName = eventNameElement.textContent;
        const scores = Array.from(sliders).map(slider => {
            return {
                criterion: slider.dataset.criterion,
                score: slider.value,
                max: slider.max
            };
        });

        const scoresText = scores.map(s => `- ${s.criterion}: ${s.score}/${s.max}`).join('\n');

        // 3. Construct the prompt
        const prompt = `You are a helpful assistant for a judge at a school competition. Your task is to provide constructive feedback for a student based on their scores.

Event: ${eventName}
Student: ${studentName}

Scoring Criteria:
${scoresText}

Based on these scores, please generate a short, encouraging feedback paragraph for ${studentName}. Start by highlighting a positive aspect, then provide specific, actionable advice for areas of improvement. Keep the tone supportive and constructive. Do not just list the scores.`;

        // 4. Call the Gemini API with exponential backoff
        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // This will be handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetchWithBackoff(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
              const text = result.candidates[0].content.parts[0].text;
              commentsTextarea.value = text;
            } else {
              throw new Error("Invalid response structure from API.");
            }

        } catch (error) {
            console.error("Error generating feedback:", error);
            commentsTextarea.value = "Sorry, an error occurred while generating feedback. Please try again.";
        } finally {
            // 5. Hide loading indicator and re-enable button
            loadingSpinner.style.display = 'none';
            generateFeedbackBtn.disabled = false;
        }
    }
    
    /**
     * A wrapper for fetch that includes exponential backoff for retries.
     * @param {string} url - The URL to fetch.
     * @param {object} options - The options for the fetch request.
     * @param {number} retries - The maximum number of retries.
     * @param {number} backoff - The initial backoff delay in ms.
     * @returns {Promise<Response>}
     */
    async function fetchWithBackoff(url, options, retries = 3, backoff = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.status !== 429) { // Not a rate limiting error
                    return response;
                }
                // If rate limited, wait and retry
            } catch (error) {
                if (i === retries - 1) throw error; // Rethrow last error
            }
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
        }
    }


    // --- Event Listeners ---

    // Update scores in real-time as sliders are moved
    sliders.forEach(slider => {
        slider.addEventListener('input', () => updateScore(slider));
    });

    // Handle student selection from the sidebar
    studentItems.forEach(item => {
        item.addEventListener('click', () => {
            studentItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            updateCurrentStudent(item.dataset.studentName);
            // In a real app, you would also fetch and display this student's saved scores.
        });
    });
    
    // Trigger Gemini API call on button click
    generateFeedbackBtn.addEventListener('click', generateFeedback);


    // --- Initial Page Load Setup ---
    updateTotalScore();
});
