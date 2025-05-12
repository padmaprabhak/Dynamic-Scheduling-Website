// Constants
const SPREADSHEET_ID = '1dPCEX-H2RhxhkVC5kr6nXzaYXRrBhlbpR3Gf62fNIvE'; // Replace with your actual Google Spreadsheet ID
let API_KEY;
console.log(API_KEY);

const SHEET_NAME = 'Master'; // Name of the sheet to fetch data from

document.addEventListener('DOMContentLoaded', async () => {
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    let currentMonthIndex = (new Date()).getMonth();
    let currentYear = (new Date()).getFullYear(); 
    
    
    
    
    try {
        const response = await fetch('/api/secretkey');
        const data = await response.json();
        API_KEY = data.secretkey; // Assign the API key from the response
        console.log(API_KEY); // Log the API key

        // Fetch data from Google Sheets after retrieving the API key
        const spreadsheetData = await fetchSpreadsheetData();
        console.log('Spreadsheet Data:', spreadsheetData);
    } catch (error) {
        console.error('Error fetching the secret key:', error);
    }
    
    
    
    
    
    // Function to fetch data from Google Sheets API
    async function fetchSpreadsheetData() {
        try {
            const range = `${SHEET_NAME}!A2:F`;
            const SPREADSHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
            
            const response = await fetch(SPREADSHEET_URL);
            const data = await response.json();
            console.log('Fetched data:', data);
            return data.values || [];
        } catch (error) {
            console.error('Error fetching the spreadsheet data:', error);
            return [];
        }
    }
    // Function to display today's schedule
function displayTodaySchedule(data) {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const formattedTodayDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const selectedDateElement = document.getElementById('selected-date');
    selectedDateElement.textContent = `Daily schedule of ${formattedTodayDate}`;

    const scheduleContainer = document.getElementById('daily-schedule');
    scheduleContainer.innerHTML = ''; // Clear previous schedule

    let eventsCount = 0; // Counter to check if any events are displayed

    data.forEach(row => {
        const [date, category, time, eventName, note, priority] = row;

        if (date === todayDateString) {
            eventsCount++;

            const listItem = document.createElement('li');

            const timeElement = document.createElement('span');
            timeElement.classList.add('time');
            timeElement.textContent = time;

            const eventNameElement = document.createElement('span');
            eventNameElement.classList.add('event');
            eventNameElement.textContent = eventName;

            listItem.appendChild(timeElement);
            listItem.appendChild(eventNameElement);

            scheduleContainer.appendChild(listItem);
        }
    });

    if (eventsCount === 0) {
        const noEventsMessage = document.createElement('li');
        noEventsMessage.textContent = 'No events scheduled for today.';
        scheduleContainer.appendChild(noEventsMessage);
    }
}


    // Function to display the daily schedule
    function displayDailySchedule(data, dateToShow) {
        const scheduleContainer = document.getElementById('daily-schedule');
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        let eventsCount = 0; // Counter to check if any events are displayed

        data.forEach(row => {
            const [date, category, time, eventName, note, priority] = row;

            if (date === dateToShow) {
                eventsCount++;

                const listItem = document.createElement('li');

                const timeElement = document.createElement('span');
                timeElement.classList.add('time');
                timeElement.textContent = time;

                const eventNameElement = document.createElement('span');
                eventNameElement.classList.add('event');
                eventNameElement.textContent = eventName;

                listItem.appendChild(timeElement);
                listItem.appendChild(eventNameElement);

                scheduleContainer.appendChild(listItem);
            }
        });

        if (eventsCount === 0) {
            const noEventsMessage = document.createElement('li');
            noEventsMessage.textContent = 'No events scheduled for selected date.';
            scheduleContainer.appendChild(noEventsMessage);
        }
    }

    // Function to highlight today's date on the calendar
    function highlightToday() {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // Format today's date as YYYY-MM-DD

        // Find today's date element in the calendar
        const dateElement = document.querySelector(`#calendar-dates .current-month[data-date="${todayDateString}"]`);
        
        if (dateElement) {
            dateElement.style.backgroundColor = '#cac9c9'; // Highlight today's date
        }
    }

// Fetch and display today's schedule initially
fetchSpreadsheetData().then(data => {
    displayTodaySchedule(data);
}).catch(error => {
    console.error('Error fetching and displaying daily schedule:', error);
});

// Function to update calendar with event indicators
function updateCalendarWithEvents(data) {
    const datesContainer = document.getElementById('calendar-dates');
    if (!datesContainer) {
        console.error('Calendar dates container not found!');
        return;
    }

    // Clear existing event indicators
    datesContainer.querySelectorAll('.event-indicator').forEach(indicator => {
        indicator.remove();
    });

    // Count events for each date
    const eventsMap = {};
    data.forEach(row => {
        const [date, category, time, eventName, note, priority] = row;
        const eventDate = new Date(date);
        const formattedDate = eventDate.toISOString().split('T')[0];
        if (!eventsMap[formattedDate]) {
            eventsMap[formattedDate] = 0;
        }
        eventsMap[formattedDate]++;
    });

    // Update date elements in the calendar with event counts
    datesContainer.querySelectorAll('.current-month').forEach(dateElement => {
        const date = dateElement.dataset.date;
        if (eventsMap[date]) {
            const eventCountIndicator = document.createElement('span');
            eventCountIndicator.classList.add('event-indicator');
            eventCountIndicator.textContent = eventsMap[date];
            dateElement.appendChild(eventCountIndicator);
        }
    });
}



    // Function to handle click on a date in the calendar
    function handleDateClick(dateElement) {
        const selectedDate = dateElement.dataset.date;

        // Update the header text with the selected date
        const selectedDateElement = document.getElementById('selected-date');
        const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        selectedDateElement.textContent = `Daily schedule of ${formattedSelectedDate}`;

        // Fetch and display events for the selected date
        fetchSpreadsheetData().then(data => {
            displayDailySchedule(data, selectedDate);
        }).catch(error => {
            console.error('Error fetching and displaying schedule for selected date:', error);
        });
    }

    // Function to display today's schedule initially
    fetchSpreadsheetData().then(data => {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];
        const formattedTodayDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const selectedDateElement = document.getElementById('selected-date');
        selectedDateElement.textContent = `Daily schedule of ${formattedTodayDate}`;

        displayDailySchedule(data, todayDateString);
    }).catch(error => {
        console.error('Error fetching and displaying today\'s schedule:', error);
    });

    // Function to display the monthly schedule
    function displayMonthlySchedule(data) {
        const scheduleContainer = document.getElementById('daily-schedule');
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        const monthYearElement = document.querySelector('.month span');
        const selectedMonthYear = monthYearElement.textContent;

        // Update the header text to indicate monthly schedule
        const selectedDateElement = document.getElementById('selected-date');
        selectedDateElement.textContent = `Monthly schedule of ${selectedMonthYear}`;

        let eventsCount = 0; // Counter to check if any events are displayed

        data.forEach(row => {
            const [date, category, time, eventName, note, priority] = row;
            const eventDate = new Date(date);

            // Check if the event is in the current month and year
            if (eventDate.getMonth() === currentMonthIndex && eventDate.getFullYear() === currentYear) {
                eventsCount++;

                const listItem = document.createElement('li');

                const dateElement = document.createElement('span');
                dateElement.classList.add('date');
                dateElement.textContent = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const timeElement = document.createElement('span');
                timeElement.classList.add('time');
                timeElement.textContent = time;

                const eventNameElement = document.createElement('span');
                eventNameElement.classList.add('event');
                eventNameElement.textContent = eventName;

                listItem.appendChild(dateElement);
                listItem.appendChild(timeElement);
                listItem.appendChild(eventNameElement);

                scheduleContainer.appendChild(listItem);
            }
        });

        if (eventsCount === 0) {
            const noEventsMessage = document.createElement('li');
            noEventsMessage.textContent = 'No events scheduled for this month.';
            scheduleContainer.appendChild(noEventsMessage);
        }
    }

    // Function to update the calendar based on month and year
    function updateCalendar(monthIndex, year) {
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
    
        const firstDayIndex = firstDay.getDay();
        const lastDate = lastDay.getDate();
    
        const monthYearElement = document.querySelector('.month span');
        monthYearElement.textContent = `${months[monthIndex]}, ${year}`;
    
        const datesContainer = document.getElementById('calendar-dates');
        datesContainer.innerHTML = '';
    
        // Add previous month's dates
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const prevDate = new Date(year, monthIndex, -i);
            const prevDateElement = document.createElement('div');
            prevDateElement.textContent = prevDate.getDate();
            prevDateElement.classList.add('prev-month');
            datesContainer.appendChild(prevDateElement);
        }
    
        // Add current month's dates
        for (let i = 1; i <= lastDate; i++) {
            const dateElement = document.createElement('div');
            dateElement.textContent = i;
            dateElement.dataset.date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dateElement.classList.add('current-month');
            datesContainer.appendChild(dateElement);
        }
    
        // Add next month's dates
        const totalDays = datesContainer.children.length;
        const remainingDays = 42 - totalDays; // 6 rows of 7 days
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, monthIndex + 1, i);
            const nextDateElement = document.createElement('div');
            nextDateElement.textContent = nextDate.getDate();
            nextDateElement.classList.add('next-month');
            datesContainer.appendChild(nextDateElement);
        }

        // Highlight today's date
        highlightToday();
    
        // Fetch data from Google Sheets and update calendar with event indicators
        fetchSpreadsheetData().then(data => {
            updateCalendarWithEvents(data);
        }).catch(error => {
            console.error('Error fetching and updating calendar with events:', error);
        });

        datesContainer.querySelectorAll('.current-month').forEach(dateElement => {
            dateElement.addEventListener('click', () => {
                handleDateClick(dateElement);
            });
        });
    }

    // Add event listener to the month name for displaying monthly schedule
    const monthYearElement = document.querySelector('.month span');
    monthYearElement.addEventListener('click', () => {
        fetchSpreadsheetData().then(data => {
            displayMonthlySchedule(data);
        }).catch(error => {
            console.error('Error fetching and displaying monthly schedule:', error);
        });
    });

    // Initial calendar setup
    updateCalendar(currentMonthIndex, currentYear);
    
    // Button event listeners for navigation
    const prevButton = document.getElementById('prevMonth');
    const nextButton = document.getElementById('nextMonth');
    
    prevButton.addEventListener('click', () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) {
            currentMonthIndex = 11;
            currentYear--;
        }
        updateCalendar(currentMonthIndex, currentYear);
    });
    
    nextButton.addEventListener('click', () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) {
            currentMonthIndex = 0;
            currentYear++;
        }
        updateCalendar(currentMonthIndex, currentYear);
    });

    // Fetch and display today's schedule initially
    fetchSpreadsheetData().then(data => {
        displayTodaySchedule(data);
    }).catch(error => {
        console.error('Error fetching and displaying daily schedule:', error);
    });

    async function setLastModified() {
        const lastModifiedElement = document.getElementById('last-modified');
    
        try {
            // Define your API Key and Spreadsheet ID
            const API_KEY = await fetch('/api/secretkey').then(response => response.json()).then(data => data.secretkey);
            const FILE_ID = '1dPCEX-H2RhxhkVC5kr6nXzaYXRrBhlbpR3Gf62fNIvE'; // Replace with your actual Spreadsheet ID
    
            // Define the URL to fetch the file metadata using Drive API
            const DRIVE_METADATA_URL = `https://www.googleapis.com/drive/v3/files/${FILE_ID}?fields=modifiedTime&key=${API_KEY}`;
    
            console.log('Fetching URL:', DRIVE_METADATA_URL); // Log the URL being fetched for debugging
    
            // Fetch the file metadata using API Key
            const response = await fetch(DRIVE_METADATA_URL);
    
            if (!response.ok) {
                const errorDetails = await response.text(); // Capture response text for more details
                throw new Error(`Failed to fetch file metadata. Status: ${response.status} - ${response.statusText}. Details: ${errorDetails}`);
            }
    
            const data = await response.json();
    
            // Log the entire response data to inspect the correct fields
            console.log('File Metadata:', data);
    
            if (data.modifiedTime) {
                const modifiedTime = data.modifiedTime;
    
                // Create a Date object from the modified time
                const lastModifiedDate = new Date(modifiedTime);
    
                // Check if the date object is valid
                if (isNaN(lastModifiedDate)) {
                    throw new Error('Invalid date format for modifiedTime');
                }
    
                // Format the date and time to a readable string
                const options = { 
                    hour: '2-digit', minute: '2-digit', 
                    year: 'numeric', month: '2-digit', day: '2-digit' 
                };
                const formattedDateTime = lastModifiedDate.toLocaleString('en-GB', options);
    
                // Set the text content to the formatted date and time
                lastModifiedElement.textContent = `Last modified at ${formattedDateTime}`;
            } else {
                // Log available fields for further investigation
                console.log('Available Fields:', data);
    
                // If modifiedTime is not found, throw an error
                throw new Error('modifiedTime field is missing from the metadata');
            }
        } catch (error) {
            console.error('Error fetching the last modified time:', error);
            lastModifiedElement.textContent = 'Unable to fetch the last modified time';
        }
    }

    // Call setLastModified function when your page loads or as needed
    setLastModified();
});
