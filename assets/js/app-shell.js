// assets/js/app-shell.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PersonalStudyPlan from './personal-study-plan';

/**
 * AppShell component configures the main routes for the application.
 * Includes route for the Personal Study Plan component.
 */
const AppShell = () => (
    <Router>
        <Switch>
            {/* Other routes */}
            <Route path="/personal-study-plan/:domain" component={PersonalStudyPlan} />
        </Switch>
    </Router>
);

export default AppShell;