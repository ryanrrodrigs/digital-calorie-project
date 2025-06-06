// App data and configuration
const appData = {
    "Instagram": { calories_per_minute: 8, category: "Social Media" },
    "TikTok": { calories_per_minute: 10, category: "Social Media" },
    "Twitter/X": { calories_per_minute: 7, category: "Social Media" },
    "Facebook": { calories_per_minute: 6, category: "Social Media" },
    "YouTube": { calories_per_minute: 5, category: "Entertainment" },
    "Netflix": { calories_per_minute: 3, category: "Entertainment" },
    "Gaming": { calories_per_minute: 4, category: "Entertainment" },
    "Email": { calories_per_minute: 2, category: "Productivity" },
    "Reading Apps": { calories_per_minute: 1, category: "Educational" },
    "Fitness Apps": { calories_per_minute: 0, category: "Health" }
};

const dailyLimits = {
    "Social Media": 120,
    "Entertainment": 180,
    "Productivity": 300,
    "Educational": 480,
    "Health": 60
};

const recommendedTotalScreenTime = 480;

const healthWarnings = [
    "Excessive social media consumption may lead to anxiety and depression",
    "High digital calorie intake linked to poor sleep quality",
    "May cause digital addiction and reduced real-world social interaction",
    "Associated with decreased attention span and productivity"
];

// Form field mapping to app names
const fieldMapping = {
    'instagram': 'Instagram',
    'tiktok': 'TikTok',
    'twitter': 'Twitter/X',
    'facebook': 'Facebook',
    'youtube': 'YouTube',
    'netflix': 'Netflix',
    'gaming': 'Gaming',
    'email': 'Email',
    'reading': 'Reading Apps',
    'fitness': 'Fitness Apps'
};

// DOM elements
const form = document.getElementById('screenTimeForm');
const totalCaloriesElement = document.getElementById('totalCalories');
const nutrientsSection = document.getElementById('nutrientsSection');
const warningsSection = document.getElementById('warningsSection');
const warningsList = document.getElementById('warningsList');
const nutritionLabel = document.getElementById('digitalFactsLabel');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    form.addEventListener('submit', handleFormSubmission);
});

function handleFormSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(form);
    const usage = {};
    
    // Collect form data
    for (let [fieldName, appName] of Object.entries(fieldMapping)) {
        const minutes = parseInt(formData.get(fieldName)) || 0;
        usage[appName] = minutes;
    }
    
    // Calculate digital calories and update label
    const results = calculateDigitalCalories(usage);
    updateNutritionLabel(results);
}

function calculateDigitalCalories(usage) {
    const results = {
        totalCalories: 0,
        totalMinutes: 0,
        categoryBreakdown: {},
        appBreakdown: [],
        dailyValuePercentages: {},
        shouldShowWarnings: false
    };
    
    // Initialize category breakdown
    Object.keys(dailyLimits).forEach(category => {
        results.categoryBreakdown[category] = {
            minutes: 0,
            calories: 0,
            dailyValuePercent: 0
        };
    });
    
    // Calculate for each app
    Object.entries(usage).forEach(([appName, minutes]) => {
        if (minutes > 0) {
            const app = appData[appName];
            const calories = minutes * app.calories_per_minute;
            
            results.totalCalories += calories;
            results.totalMinutes += minutes;
            
            // Add to category breakdown
            results.categoryBreakdown[app.category].minutes += minutes;
            results.categoryBreakdown[app.category].calories += calories;
            
            // Add to app breakdown
            results.appBreakdown.push({
                name: appName,
                minutes: minutes,
                calories: calories,
                category: app.category
            });
        }
    });
    
    // Calculate daily value percentages
    Object.entries(results.categoryBreakdown).forEach(([category, data]) => {
        if (dailyLimits[category]) {
            data.dailyValuePercent = Math.round((data.minutes / dailyLimits[category]) * 100);
            results.dailyValuePercentages[category] = data.dailyValuePercent;
        }
    });
    
    // Check if warnings should be shown
    results.shouldShowWarnings = results.totalCalories > 2000 || 
                                results.dailyValuePercentages["Social Media"] > 100 ||
                                results.totalMinutes > recommendedTotalScreenTime;
    
    return results;
}

function updateNutritionLabel(results) {
    // Update total calories
    totalCaloriesElement.textContent = results.totalCalories;
    
    // Update calorie level styling
    updateCaloriesStyling(results.totalCalories);
    
    // Clear existing nutrients section
    nutrientsSection.innerHTML = '';
    
    // Add category breakdowns
    Object.entries(results.categoryBreakdown).forEach(([category, data]) => {
        if (data.minutes > 0) {
            const categoryLine = createNutrientLine(
                `${category} Time`,
                `${data.minutes}min`,
                `${data.dailyValuePercent}%`,
                true
            );
            nutrientsSection.appendChild(categoryLine);
            
            // Add individual apps in this category
            results.appBreakdown
                .filter(app => app.category === category)
                .forEach(app => {
                    const appLine = createNutrientLine(
                        `  ${app.name}`,
                        `${app.minutes}min`,
                        `${app.calories} cal`
                    );
                    nutrientsSection.appendChild(appLine);
                });
        }
    });
    
    // Add total screen time
    if (results.totalMinutes > 0) {
        const totalPercent = Math.round((results.totalMinutes / recommendedTotalScreenTime) * 100);
        const totalLine = createNutrientLine(
            'Total Screen Time',
            `${results.totalMinutes}min`,
            `${totalPercent}%`,
            true
        );
        nutrientsSection.appendChild(totalLine);
    }
    
    // Show warnings if needed
    if (results.shouldShowWarnings) {
        showWarnings(results);
    } else {
        warningsSection.style.display = 'none';
    }
    
    // Scroll to the label
    nutritionLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createNutrientLine(name, value, percentage, isMajor = false) {
    const line = document.createElement('div');
    line.className = `nutrient-line ${isMajor ? 'major' : ''}`;
    
    line.innerHTML = `
        <span class="nutrient-name">${name}</span>
        <span class="nutrient-value">${value}</span>
        <span class="nutrient-value">${percentage}</span>
    `;
    
    return line;
}

function updateCaloriesStyling(totalCalories) {
    // Remove existing calorie level classes
    nutritionLabel.classList.remove('low-calories', 'moderate-calories', 'high-calories');
    
    // Add appropriate class based on calorie level
    if (totalCalories > 3000) {
        nutritionLabel.classList.add('high-calories');
    } else if (totalCalories > 1500) {
        nutritionLabel.classList.add('moderate-calories');
    } else {
        nutritionLabel.classList.add('low-calories');
    }
}

function showWarnings(results) {
    warningsList.innerHTML = '';
    
    // Show relevant warnings based on usage patterns
    const warningsToShow = [];
    
    if (results.dailyValuePercentages["Social Media"] > 100) {
        warningsToShow.push(healthWarnings[0]);
    }
    
    if (results.totalCalories > 2500) {
        warningsToShow.push(healthWarnings[1]);
    }
    
    if (results.totalMinutes > recommendedTotalScreenTime) {
        warningsToShow.push(healthWarnings[2]);
    }
    
    if (results.totalCalories > 3000) {
        warningsToShow.push(healthWarnings[3]);
    }
    
    // If no specific warnings, show a general one
    if (warningsToShow.length === 0 && results.shouldShowWarnings) {
        warningsToShow.push("Consider moderating your digital consumption for better wellness");
    }
    
    warningsToShow.forEach(warning => {
        const listItem = document.createElement('li');
        listItem.textContent = warning;
        warningsList.appendChild(listItem);
    });
    
    warningsSection.style.display = 'block';
}

// Helper function to reset the form
function resetForm() {
    form.reset();
    totalCaloriesElement.textContent = '0';
    nutrientsSection.innerHTML = `
        <div class="nutrient-line default-message">
            <span>Enter your screen time below to see your digital nutrition breakdown</span>
        </div>
    `;
    warningsSection.style.display = 'none';
    nutritionLabel.classList.remove('low-calories', 'moderate-calories', 'high-calories');
}

// Add reset functionality (could be triggered by a reset button if added)
window.resetDigitalFacts = resetForm;