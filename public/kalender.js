document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('calendar-table');
    let currentWeekStart = new Date();

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
        const months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
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
        table.innerHTML = '';
        generateCalendar(table, data);
    }

    function generateCalendar(table, data) {
        const headerRow = document.createElement('tr');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `<th class="time-column">Uge ${getWeekNumber(currentWeekStart)}</th>`;
        const courtSelector = document.getElementById('courtSelector');
        const selectedCourt = parseInt(courtSelector.value, 10);

        for (let i = 1; i <= 7; i++) {
            const currentDateInfo = formatDateWithWeekday(currentYear, currentMonth, currentDay + i - currentDate.getDay());
            headerRow.innerHTML += `<th >${currentDateInfo.weekday}<br>${currentDateInfo.formattedDate}</th>`;
        }

        table.appendChild(headerRow);

        for (let hour = 8; hour < 21; hour++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="time-column">${hour}:00 - ${hour + 1}:00</td>`;

            for (let day = 0; day < 7; day++) {
                startDay = undefined;
                dayCount = 1;

                const cellDate = new Date(currentYear, currentMonth, firstDayOfWeek + day, hour);
                const formattedCellDate = formatDateWithWeekday(currentYear, currentMonth, firstDayOfWeek + day).formattedDate;
                const cellHour = cellDate.getHours();

                const tableData = document.createElement('td');
                tableData.setAttribute('data-day', dayCount);
                tableData.setAttribute('data-hour', hour);
                tableData.setAttribute('data-court', 1);

                tableData.addEventListener('click', function () {
                    showModal(formattedCellDate, cellHour, null, null, null);
                });

                const bookedTime = data ? data.find(item => {
                    const itemHour = item.Klokkeslæt ? parseInt(item.Klokkeslæt.split(':')[0], 10) : null;
                    const itemDate = new Date(item.Dato);
                    const itemCourt = parseInt(item.BaneID, 10);
                    return itemDate.toDateString() === cellDate.toDateString() && itemHour === cellHour && itemCourt !== null;
                }) : null;

                if (bookedTime && bookedTime.BaneID === selectedCourt) {
                    const bookingDate = new Date(bookedTime.Dato);
                    tableData.innerHTML = `Booket`;
                    tableData.classList.add('booked');  // Add a class to indicate it's booked
                } else {
                    tableData.innerHTML = `Ledig`;
                    tableData.classList.add('available');  // Add a class to indicate it's available
                }

                row.appendChild(tableData);

                dayCount++;
            }

            table.appendChild(row);
        }
    }

    window.changeCourt = function () {
        const courtSelector = document.getElementById('courtSelector');
        const selectedCourt = parseInt(courtSelector.value, 10);
        const updatedDate = new Date(currentYear, currentMonth, currentDay);
        currentWeekStart.setDate(currentWeekStart.getDate());
        firstDayOfWeek = currentWeekStart.getDate() - currentWeekStart.getDay() + (currentWeekStart.getDay() === 0 ? -6 : 1);
        updateCalendar(table, currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate(), calendarData);
    }

    function showModal(formattedCellDate, cellHour, bookingID, bookedTime, bookedCourt) {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');

        let contentHTML = `
            <p>Dato: ${formattedCellDate}</p>
            <p>Tid: ${cellHour}:00 - ${cellHour + 1}:00</p>
        `;

        if (bookingID !== null) {
            contentHTML += `<p>Booking ID: ${bookingID}</p>`;
            contentHTML += `<p>${bookedTime}</p>`;
            contentHTML += `<p>Bane: ${bookedCourt}</p>`;
        }

        popupContent.innerHTML = contentHTML;

        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    function hideModal() {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup');

        overlay.style.display = 'none';
        popup.style.display = 'none';
    };

    fetch('/hentbaner')
        .then(response => response.json())
        .then(data => {
            updateCourtSelector(data);
            generateCalendar(table, calendarData);
        })
        .catch(error => console.error('Fejl ved hentning af baner:', error));

    function updateCourtSelector(data) {
        const courtSelector = document.getElementById('courtSelector');
        for (let i = 0; i < data.length; i++) {
            const option = document.createElement('option');
            option.value = data[i].id;
            option.text = data[i].Navn;
            courtSelector.add(option);
        }
    }
});
