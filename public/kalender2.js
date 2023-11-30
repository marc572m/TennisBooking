let baneData;

function updateCourtList(baneData) {
    const courtList = document.getElementById('courtList');
    const selectedSport = document.getElementById('sportSelector').value;

    // Ryd alle eksisterende elementer i courtList
    while (courtList.firstChild) {
        courtList.removeChild(courtList.firstChild);
    }

    for (let i = 0; i < baneData.length; i++) {
        if (selectedSport == baneData[i].Sport) {
            const listItem = document.createElement('li');
            listItem.textContent = baneData[i].Navn;
            courtList.appendChild(listItem);
        }
        console.log(baneData[i].Sport);
    }
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
}

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('calendar-table');
    let currentWeekStart = new Date();
    let currentYear, currentMonth, currentDay;

    const currentDate = new Date();
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    currentDay = currentDate.getDate();

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    function getWeekNumber(date) {
        const copiedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        copiedDate.setDate(copiedDate.getDate() + 4 - (copiedDate.getDay() || 7));
        const yearStart = new Date(copiedDate.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((copiedDate - yearStart) / 86400000 + 1) / 7);
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
        table.innerHTML = '';

        const headerRow = document.createElement('tr');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `<th class="time-column">Uge ${getWeekNumber(new Date(currentYear, currentMonth, currentDay))}</th>`;

        const courtList = document.getElementById('courtList');
        const selectedSport = document.getElementById('sportSelector').value;

        for (let i = 0; i < data.length; i++) {
            if(selectedSport == data[i].Sport) {
                const listItem = document.createElement('li');
                listItem.innerText = data[i].Sport;
                courtList.appendChild(listItem);

                console.log(data[i].Sport + " " + selectedSport);
    
                const courtName = courtList.children[i].innerText;
                headerRow.innerHTML += `<th>${courtName}</th>`;
            }
            console.log(courtList)
        }

        updateCourtList(data);

        table.appendChild(headerRow);

        for (let hour = 8; hour < 21; hour++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="time-column">${hour}:00 - ${hour + 1}:00</td>`;

            for (let i = 0; i < courtList.children.length; i++) {
                const courtId = parseInt(courtList.children[i].value, 10);

                let startDay = undefined;
                let dayCount = 1;

                const cellDate = new Date(currentYear, currentMonth, currentDay, hour);
                const formattedCellDate = formatDateWithWeekday(currentYear, currentMonth, currentDay).formattedDate;
                const cellHour = cellDate.getHours();

                const tableData = document.createElement('td');
                tableData.setAttribute('data-day', dayCount);
                tableData.setAttribute('data-hour', hour);
                tableData.setAttribute('data-court', courtId);

                tableData.addEventListener('click', function () {
                    showModal(formattedCellDate, cellHour, null, null, null);
                });

                const bookedTime = data.find(item => {
                    const itemHour = item.Klokkeslæt ? parseInt(item.Klokkeslæt.split(':')[0], 10) : null;
                    const itemDate = new Date(item.Dato);
                    return itemDate.toDateString() === cellDate.toDateString() && itemHour === cellHour && item.BaneID === courtId;
                });

                if (bookedTime) {
                    tableData.innerHTML = `Booket`;
                    tableData.classList.add('booked');
                    tableData.addEventListener('click', function () {
                        showModal(formattedCellDate, cellHour, bookedTime.BrugerID, bookedTime.Klokkeslæt, bookedTime.BaneID);
                    });
                } else {
                    tableData.innerHTML = `Ledig`;
                    tableData.classList.add('available');
                }

                row.appendChild(tableData);

                dayCount++;
            }

            table.appendChild(row);
        }
    }

    function formatDate(year, month, day) {
        const months = [
            "Januar", "Februar", "Marts", "April", "Maj", "Juni",
            "Juli", "August", "September", "Oktober", "November", "December"
        ];
        return `${day}. ${months[(month + 12) % 12]}`;
    }

    window.prevDay = function () {
        currentDay--;
        if (currentDay < 1) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            currentDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        }
        updateCalendar(table, currentYear, currentMonth, currentDay, bookingData);
        updateHeaderText();
    };

    window.nextDay = function () {
        currentDay++;
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        if (currentDay > lastDayOfMonth) {
            currentDay = 1;
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        updateCalendar(table, currentYear, currentMonth, currentDay, bookingData);
        updateHeaderText();
    };

    function updateHeaderText() {
        const headerText = document.querySelector('.date-info h1');
        headerText.textContent = `Booking kalender for: den ${formatDate(currentYear, currentMonth, currentDay)}`;
    }

    window.changeSelector = function () {
        const courtList = document.getElementById('courtList');
        const sportSelector = document.getElementById('sportSelector');
        const selectedSport = sportSelector.value;
    
        if (baneData) {
            const headerRow = document.querySelector('.header-row');
            headerRow.innerHTML = `<th class="time-column">Uge ${getWeekNumber(new Date(currentYear, currentMonth, currentDay))}</th>`;
    
            // Gem banenavnene baseret på den valgte sport
            const courtNames = [];
            for (let i = 0; i < baneData.length; i++) {
                if (selectedSport == baneData[i].Sport) {
                    courtNames.push(baneData[i].Navn);
                }
            }
    
            // Opdater headeren med de gemte banenavne
            courtNames.forEach(courtName => {
                headerRow.innerHTML += `<th>${courtName}</th>`;
            });
    
            generateCalendar(table, baneData);
    
            updateHeaderText();
    
            updateCourtList(baneData);
        }
    };
    

    fetch('/hentbaner')
        .then(response => response.json())
        .then(data => {
            baneData = data;
            updateCourtList(baneData);
            generateCalendar(table, baneData);
        })
        .catch(error => console.error('Fejl ved hentning af baner:', error));
        
    window.updateCalendarView = function () {
        const selectedDay = document.getElementById('selectedDay').value;
        const selectedCategory = document.getElementById('selectedCategory').value;
        const updatedDate = new Date();
        updatedDate.setDate(updatedDate.getDate() - updatedDate.getDay() + selectedDay);
        updateCalendar(table, updatedDate.getFullYear(), updatedDate.getMonth(), updatedDate.getDate(), bookingData, selectedCategory);
    };
});
