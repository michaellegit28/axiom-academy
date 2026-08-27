// assets/js/personal-study-plan.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './personal-study-plan.css';

/**
 * PersonalStudyPlan component displays the user's study plan based on the selected domain.
 * It uses domain isolation to ensure the correct content is displayed.
 * 
 * @param {string} userId - The user's unique ID.
 * @param {string} domain - The domain type (High School, University, Extras).
 * @param {Array} availableSubjects - List of subjects available in the current domain.
 */
const PersonalStudyPlan = ({ userId, domain, availableSubjects }) => {
    const [goals, setGoals] = useState([]);
    const [progress, setProgress] = useState({});
    const [pathways, setPathways] = useState([]);
    
    useEffect(() => {
        // Fetching user data based on userId and domain
        // Note: Example fetch function to be replaced with actual API call
        const fetchUserData = async (id) => {
            // Simulated data fetching logic
            const userData = await fetch(`/api/user/${id}`).then(res => res.json());
            setGoals(userData.goals || []);
            setProgress(userData.progress || {});
            setPathways(userData.pathways || []);
        };

        fetchUserData(userId);
    }, [userId]);

    const saveGoals = () => {
        // Function to save goals when user clicks the save button
        console.log('Goals saved:', goals);
        // Implement saving logic here
    };

    return (
        <div className="personal-study-plan">
            <h2>Your Personal Study Plan</h2>
            <section className="study-goals">
                <h3>Your Goals</h3>
                <input 
                    type="text" 
                    placeholder="Set your study goals" 
                    onChange={(e) => setGoals(e.target.value.split(','))} 
                />
                <button onClick={saveGoals}>Save Goals</button>
            </section>
            <section className="progress-tracker">
                <h3>Your Progress</h3>
                <div id="progress-chart">
                    {/* Render progress chart based on progress state */}
                    {Object.entries(progress).map(([subject, value]) => (
                        <div key={subject} className="progress-item">
                            {subject}: {value}%
                        </div>
                    ))}
                </div>
            </section>
            <section className="recommended-pathways">
                <h3>Recommended Pathways</h3>
                <ul id="pathway-list">
                    {pathways.map((pathway, index) => (
                        <li key={index}>{pathway}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

// PropTypes for validating data types received by the component
PersonalStudyPlan.propTypes = {
    userId: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    availableSubjects: PropTypes.array.isRequired,
};

export default PersonalStudyPlan;