// assets/js/tutor.js
/* 
    Tutor JavaScript Logic
    This script handles the user interaction for the Tutor section, loading dynamic content 
    based on user-selected topics for both High School and University domains.
*/

document.addEventListener("DOMContentLoaded", function () {
    const topicSelector = document.getElementById('topics');
    const tutorFeedback = document.getElementById('tutor-feedback');

    topicSelector.addEventListener('change', handleTopicChange);

    function handleTopicChange() {
        const selectedTopic = topicSelector.value;
        if (selectedTopic) {
            // Load content related to the selected topic
            fetchTutoringContent(selectedTopic);
        } else {
            tutorFeedback.innerHTML = ''; // Reset feedback if no selection
        }
    }

    function fetchTutoringContent(topic) {
        // Simulated fetch for demonstration: In reality, this would fetch data asynchronously
        const mockResponses = {
            math: 'You selected Mathematics. Here are some resources...',
            science: 'You selected Science. Here are some resources...',
            history: 'You selected History. Here are some resources...',
            literature: 'You selected Literature. Here are some resources...',
            physics: 'You selected Physics. Here are some resources...',
            philosophy: 'You selected Philosophy. Here are some resources...'
        };
        // Update the feedback section with information
        tutorFeedback.innerHTML = mockResponses[topic] || '';
    }
});
