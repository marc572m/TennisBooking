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
    }
}

function showModal(formattedCellDate, cellHour, bookingID, baneID, bookingType) {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const userDataElement = document.getElementById('userData');
    const username = userDataElement ? userDataElement.dataset.username : null;

    console.log(username);
    console.log(cellHour);

    let contentHTML = `
        <p>Dato: ${formattedCellDate}</p>
        <p>Tid: ${cellHour}:00 - ${cellHour + 1}:00</p>
    `;

    if (bookingID !== null && username != null) {
        contentHTML += `<p>${bookingType}</p>`;
        contentHTML += `<p>Booking ID: ${bookingID}</p>`;
        //contentHTML += `<p>${bookedTime}</p>`;
    }
    else if (bookingID == null && username != null) {
        contentHTML += `<button class="book-button" onclick="makeBooking('${username}', ${cellHour}, '${formattedCellDate}', ${baneID}, '${baneData[baneID-1].Navn}')">Book Tid</Button>`;
    }
    else if (bookingID !== null && username == null) {
        contentHTML += `<p>Tiden er allerede booket</p>`;
    }
    else{
        contentHTML += `<p>Log ind for at booke</p>`;
        contentHTML += '<br>';
        contentHTML += `<button class="login-button" onclick="window.location.href = '/login'">Log ind</button>`;
    }

    popupContent.innerHTML = contentHTML;

    overlay.style.display = 'block';
    popup.style.display = 'block';
}

const months = [
    "Januar", "Februar", "Marts", "April", "Maj", "Juni",
    "Juli", "August", "September", "Oktober", "November", "December"
];


function makeBooking(username, cellHour, formattedCellDate, courtId, courtName) {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const userDataElement = document.getElementById('userData');
    console.log('Tid: ', cellHour);
    console.log('Dato: ', formattedCellDate);

    const dateArray = formattedCellDate.split('.');
    const day = parseInt(dateArray[0], 10); // Konverter til heltal
    const month = dateArray[1]; // Lad måneden være som en streng
    const year = new Date().getFullYear();
    console.log(year, month, day);
    const bookingDate = new Date(year, getMonthIndex(month), day);

    const formattedDate = formatDateForInput(bookingDate);
    console.log(formattedDate);

    const bookingCourt = courtId;
    const bookingSport = document.getElementById('sportSelector').value;
    const bookingCourtType = document.getElementById('courtTypeSelector').value;

    let contentHTML = `
    <div class="booking-form">
    <div class="form-group">
        <label for="bookingUsername">Brugernavn:</label>
        <input type="text" id="bookingUsername" value="${username}" disabled>
    </div>

    <div class="form-group">
        <label for="bookingDate">Dato:</label>
        <input type="date" id="bookingDate" value="${formattedDate}" disabled>
    </div>

    <div class="form-group">
        <label for="bookingDate">Tidsrum: ${cellHour}:00 - ${cellHour+1}:00</label>
    </div>

    <div class="form-group">
        <label for="bookingCourt">Bane:</label>
        <input type="text" id="bookingCourt" value="${courtName}, ID: ${bookingCourt}" disabled>
    </div>

    <div class="form-group">
        <label for="bookingSport">Sport:</label>
        <input type="text" id="bookingSport" value="${bookingSport}" disabled>
    </div>

    <div class="form-group">
        <label for="bookingSport">Banetype:</label>
        <input type="text" id="bookingSport" value="${bookingCourtType}" disabled>
    </div>

    <div class="form-group">
        <label for="medspiller">Medspiller:</label>
        <select id="medspiller" name="medspiller" onchange="teammateType()" required>
            <option value="Gæst">Gæst</option>
            <option value="Medlem">Medlem</option>
        </select>
            
        <div id="medspiller-search" style="display: none;">
            <label for="teammate">Søg efter medspiller:</label>
            <input type="text" id="teammate" name="teammate">
            <ul id="search-results"></ul>
        </div>

        <div id="team-list">
            <label for="team-list">Medspillere:</label>
            <ul id="team-list"></ul>
        </div>

    <div class="form-group">
        <button class="confirm-button" onclick="completeBooking()">Færdig</button>
    </div>

    
</div>
    `;
    popupContent.innerHTML = contentHTML;
}

window.teammateType = function () {
    const medspillerSelect = document.getElementById('medspiller');
    const teammateSearch = document.getElementById('medspiller-search');
    const teammateInput = document.getElementById('teammate');
    const searchResults = document.getElementById('search-results');
    const teamList = document.getElementById('team-list');
    const userDataElement = document.getElementById('userData');
    const username = userDataElement ? userDataElement.dataset.username : null;

        if (medspillerSelect.value === 'Gæst') {
            teammateSearch.style.display = 'none';
        } else {
            teammateSearch.style.display = 'block';
        }

        teammateInput.addEventListener('input', function () {
        if (medspillerSelect.value === 'Medlem') {
            const searchQuery = teammateInput.value;
            if(searchQuery != null && searchQuery.length > 0) {
            fetch(`/search?query=${searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    displaySearchResults(data);
                })
                .catch(error => console.error('Fejl under hentning af søgeresultater:', error));
            }
            else {
                searchResults.innerHTML = '';
                console.log('Ingen resultater');
            }
        }
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = '';

        results.forEach(result => {
            if(result.Brugernavn != username){
            const listItem = document.createElement('li');
            listItem.textContent = result.Brugernavn; // Tilpas dette baseret på din databasestruktur
            searchResults.appendChild(listItem);
            }
        });
    }

    searchResults.addEventListener('click', function (event) {
        // Kontroller om det klikkede element er en <li> (listeobjekt)
        if (event.target.tagName === 'LI') {
            // Hent teksten fra det klikkede listeobjekt
            const selectedPlayer = event.target.textContent;

            if(selectedPlayer != username) {
            // Tilføj den valgte spiller til din spillerliste (her skal du tilføje din egen logik)
            window.addPlayerToTeam(selectedPlayer);

            // Ryd søgeresultaterne efter valg
            }
            else {
                //Kan helt fjernes
                alert("Du kan ikke tilføje dig selv til medspillere.");
            }
        }
    });

    window.addPlayerToTeam = function (playerName) {
        // Tjek om spilleren allerede er på holdet
        const isPlayerAlreadyAdded = Array.from(teamList.children).some(player => player.textContent === playerName);

        if (!isPlayerAlreadyAdded) {
            // Spilleren er ikke allerede på holdet, så tilføj den
            const listItem = document.createElement('li');
            listItem.textContent = playerName;
            listItem.addEventListener('click', function () {
                removePlayerFromTeam(playerName);
            });
            teamList.appendChild(listItem);
        }
        else {
            alert("Spilleren er allerede tilføjet.");
        }
    };

    function removePlayerFromTeam(playerName) {
        // Fjern spilleren fra holdet ved at filtrere listen for at beholde alle undtagen den valgte spiller
        const updatedTeamList = Array.from(teamList.children).filter(player => player.textContent !== playerName);
        // Opdater holdlisten med den nye liste uden den valgte spiller
        teamList.innerHTML = '';
        updatedTeamList.forEach(player => {
            teamList.appendChild(player);
        });
    };   
}

//Når datoen indsættes i databasen, skal den være i formatet YYYY-MM-DD
//Samt vises year og month som året og måneden før, så derfor +1

function formatDateForInput(date) {
    const year = date.getFullYear()+1;
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthIndex(monthName) {
    const months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
    return months.indexOf(monthName);
}

function hideModal() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    popupContent.innerHTML = '';

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
        generateCalendar(table, data);
    }

    function generateCalendar(table, baneData) {
        table.innerHTML = '';
    
        const headerRow = document.createElement('tr');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `<th class="time-column">Uge ${getWeekNumber(new Date(currentYear, currentMonth, currentDay))}</th>`;
    
        const courtList = document.getElementById('courtList');
        courtList.style.display = 'none';
        const selectedSport = document.getElementById('sportSelector').value;
        const selectedCourtType = document.getElementById('courtTypeSelector').value;
    
        console.log(baneData, "BaneData", selectedSport);
        console.log(bookingData, "BookingData");
        console.log(selectedCourtType, "CourtType", baneData[0].Banetype);
    
        courtList.innerHTML = '';
    
        for (let i = 0; i < baneData.length; i++) {
            if (selectedSport == baneData[i].Sport && selectedCourtType == baneData[i].Banetype) {
                const listItem = document.createElement('li');
                listItem.innerText = baneData[i].Navn;
                courtList.appendChild(listItem);
    
                const courtId = baneData[i].id;
    
                const courtName = baneData[i].Navn;
                headerRow.innerHTML += `<th>${courtName}</th>`;
            }
        }
    
        table.appendChild(headerRow);
    
        for (let hour = 8; hour < 21; hour++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="time-column">${hour}:00 - ${hour + 1}:00</td>`;
    
            let dayCount = 1;
    
            for (let i = 0; i < baneData.length; i++) {
                if (selectedSport == baneData[i].Sport && selectedCourtType == baneData[i].Banetype) {
                    const courtId = baneData[i].id;
    
                    const cellDate = new Date(currentYear, currentMonth, currentDay, hour);
                    const formattedCellDate = formatDateWithWeekday(currentYear, currentMonth, currentDay).formattedDate;
                    const cellHour = cellDate.getHours();
    
                    const tableData = document.createElement('td');
                    tableData.setAttribute('data-day', dayCount);
                    tableData.setAttribute('data-hour', hour);
                    tableData.setAttribute('data-court', courtId);
    
                    tableData.addEventListener('click', function () {
                        showModal(formattedCellDate, cellHour, null, courtId, null);
                    });
    
                    const bookedTime = bookingData.find(item => {
                        const itemHour = item.Klokkeslæt ? parseInt(item.Klokkeslæt.split(':')[0], 10) : null;
                        const itemDate = new Date(item.Dato);
                        return itemDate.toDateString() === cellDate.toDateString() && itemHour === cellHour && item.BaneID === courtId;
                    });

                    tableData.style.textShadow = '1px 2px 4px black';
    
                    if (bookedTime) {
                        tableData.innerHTML = `Booket`;
                        tableData.classList.add('booked');
                        tableData.style.backgroundColor = '#ff3333';
                        tableData.style.color = 'white';
                        tableData.addEventListener('click', function () {
                            showModal(formattedCellDate, cellHour, bookedTime.BrugerID, bookedTime.BaneID, bookedTime.BookingType);
                        });
                    } else {
                        tableData.innerHTML = `Ledig`;
                        tableData.classList.add('available');
                        tableData.style.backgroundColor = '#82F45C';
                        tableData.style.color = 'white';
                    }
    
                    row.appendChild(tableData);
    
                    dayCount++;
                }
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
        updateCalendar(table, currentYear, currentMonth, currentDay, baneData);
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
        updateCalendar(table, currentYear, currentMonth, currentDay, baneData);
        updateHeaderText();
    };

    function updateHeaderText() {
        const headerText = document.querySelector('.date-info h1');
        headerText.textContent = `Kalender: Den ${formatDate(currentYear, currentMonth, currentDay)}`;
    }

    window.changeSelector = function () {
        const courtList = document.getElementById('courtList');
        const sportSelector = document.getElementById('sportSelector');
        const selectedCourtType = document.getElementById('selectedCourtType');
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
