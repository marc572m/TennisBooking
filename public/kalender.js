function showModal(formattedCellDate, cellHour, bookingID) {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    // Set the content of the popup
    popupContent.innerHTML = `
        <p>Date: ${formattedCellDate}</p>
        <p>Time: ${cellHour}:00</p>
        <p>Booking ID: ${bookingID}</p>
    `;

    overlay.style.display = 'block';
    popup.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('calendar-table');
    let currentWeekStart = new Date();  // Gem den aktuelle uges startdato

    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let currentDay = currentDate.getDate();
    let firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1);

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }


    window.prevWeek = function () {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        firstDayOfWeek = currentWeekStart.getDate() - currentWeekStart.getDay() + (currentWeekStart.getDay() === 0 ? -6 : 1);
        updateCalendar(table, currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate(), calendarData);

    };

    window.nextWeek = function () {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        firstDayOfWeek = currentWeekStart.getDate() - currentWeekStart.getDay() + (currentWeekStart.getDay() === 0 ? -6 : 1);
        updateCalendar(table, currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate(), calendarData);

    };

    function getWeekNumber(date) {
        date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        var weekNumber = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
        return weekNumber;
    }
    
    function formatDateWithWeekday(year, month, day) {
        const weekdays = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        const months = [
            "Januar", "Februar", "Marts", "April", "Maj", "Juni",
            "Juli", "August", "September", "Oktober", "November", "December"
        ];
    
        const date = new Date(Date.UTC(year, month, day));
        const weekday = weekdays[date.getUTCDay()];
        const dayNumber = date.getUTCDate();
        const monthName = months[(date.getUTCMonth() + 12) % 12];
    
        return { weekday, formattedDate: `${dayNumber}. ${monthName}` };
    }
    

    function updateCalendar(table, year, month, day, data) {
        const updatedDate = new Date(year, month, day);
        currentYear = updatedDate.getFullYear();
        currentMonth = updatedDate.getMonth();
        currentDay = updatedDate.getDate();
        table.innerHTML = ''; // Ryd indholdet af tabellen
        generateCalendar(table, data);
    }

    function generateCalendar(table, data) {
        // Generer kalendertabellen igen
    
        // Opret overskriftsrad
        const headerRow = document.createElement('tr');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `<th class="time-column">Uge ${getWeekNumber(currentWeekStart)}</th>`;

        // Opret kolonner for hver dag i ugen
        for (let i = 1; i <= 7; i++) {
            const currentDateInfo = formatDateWithWeekday(currentYear, currentMonth, currentDay + i - currentDate.getDay());
            headerRow.innerHTML += `<th >${currentDateInfo.weekday}<br>${currentDateInfo.formattedDate}</th>`;
            
        }
    
        // Tilføj overskriftsrad til tabellen
        table.appendChild(headerRow);
    
        // Generer rækker for hver time
        for (let hour = 8; hour < 21; hour++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="time-column">${hour}:00 - ${hour + 1}:00</td>`;
    
            for (let day = 0; day < 7; day++) {
                // Eksisterende kode for hver celle
                startDay = undefined;
                dayCount = 1;
    
                const cellDate = new Date(currentYear, currentMonth, firstDayOfWeek + day, hour);
                const formattedCellDate = formatDateWithWeekday(currentYear, currentMonth, firstDayOfWeek + day).formattedDate;
                const cellHour = cellDate.getHours();
    
                const tableData = document.createElement('td');
                tableData.setAttribute('data-day', dayCount);
                tableData.setAttribute('data-hour', hour);
                tableData.setAttribute('data-court', 1);
                tableData.onclick = function() {
                    showModal(formattedCellDate, cellHour);
                };
    
                const bookedTime = data.find(item => {
                    const itemHour = parseInt(item.Klokkeslet.split(':')[0], 10);
                    const itemDate = new Date(item.Dato);
                    return itemDate.toDateString() === cellDate.toDateString() && itemHour === cellHour;
                });
    
                // Opdateret kode for at vise korrekt dato og måned i cellen
                if (bookedTime) {
                    const bookingDate = new Date(bookedTime.Dato);
                    tableData.innerHTML = `Booket ${bookingDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })} ${hour}`;
                } else {
                    tableData.innerHTML = `Ledig`;
                    //tableData.innerHTML = `Ledig ${formattedCellDate} ${hour}`;
                }
    
                row.appendChild(tableData);
    
                dayCount++;
            }
    
            table.appendChild(row);
        }
    }
    

    function showModal(formattedCellDate, cellHour, bookingID) {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
    
        // Set the content of the popup
        popupContent.innerHTML = `
            <p>Date: ${formattedCellDate}</p>
            <p>Time: ${cellHour}:00</p>
            <p>Booking ID: ${bookingID}</p>
        `;
    
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }
    
    function hideModal() {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup');
    
        overlay.style.display = 'none';
        popup.style.display = 'none';
    }

    // Kald af den indledende generering af kalenderen
    generateCalendar(table, calendarData);
});