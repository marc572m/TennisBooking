//--------------------------------------------------------------baner-------------------------------------------------------------------
let baneData;
    //hent court to drop down 
fetch("/hentbaner")
    .then(response => response.json())
    .then(data => {
        baneData = data;
        populateSelectOptions(baneData);
    })
    .catch(error => console.error("Fejl ved hentning af baner:", error));

function populateSelectOptions(baneData) {
    console.log("run populateSelectOptions()");
    const selectElement = document.getElementById("baner");
    const selectSport = document.getElementById("Sport");
    const selectBaneType = document.getElementById("BaneType");

    if (baneData && baneData.length > 0) {
        selectElement.innerHTML = ""; // Clear the options first

        // Create the default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "Vælg";
        defaultOption.textContent = "Vælg Bane";
        selectElement.appendChild(defaultOption);
        //add court if courte macthe the sellectede sport
        baneData.forEach(bane => {
            // console.log(bane.Banetype=== selectBaneType.value);
            if (bane.Sport === selectSport.value && bane.Banetype=== selectBaneType.value) {
                const option = document.createElement("option");
                option.value = bane.id;
                option.textContent = bane.Navn;
                selectElement.appendChild(option);
            }
        });
    } else {
        // Handle case where baneData is empty or undefined
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No baner available";
        option.disabled = true;
        selectElement.appendChild(option);
    }
}
// Event listener when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {

    const selectSport = document.getElementById("Sport");
    const selectBaneType = document.getElementById("BaneType");
    const addBaneButton = document.getElementById('addBane');
    const addTimeButton = document.getElementById('addTime');
    // Listen for changes in the 'Sport' select element
    selectSport.addEventListener("change", function() {
        const selectbaner = document.getElementById('listBaner');
        selectbaner.innerHTML="";
        populateSelectOptions(baneData);
    });

    selectBaneType.addEventListener("change", function() {
        populateSelectOptions(baneData);
    });
    //add baner
    addBaneButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevents the default form submission behavior
        const selectElement = document.getElementById('baner');
        const selectedBaneName = selectElement.value;
        // Check if a bane has been selected
        if (selectedBaneName && selectedBaneName !== 'Vælg') {
            const selectbaner = document.getElementById('listBaner');
            const selectedBaneName = selectElement.value;
            
            // Check if an element with the same value already exists in the list
            const existingElements = selectbaner.querySelectorAll(`li[value="${selectedBaneName}"]`);
            if (existingElements.length === 0) {
                // If no element with the same value exists, add the new one
                selectbaner.innerHTML += `<li class="chooseBane" value="${selectedBaneName}">${selectElement.options[selectElement.selectedIndex].textContent}</li>`;
            } else {
                console.log('Element already exists in the list.');
                // Handle the case where the element already exists (e.g., display an error message)
            }

        } else {
            console.log('Please select a valid bane.'); // Show a message if no bane is selected
        }
    });
    //    Shift+Alt+A Toggle block comment

    //add time
    addTimeButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevents the default form submission behavior
        const selectElement = document.getElementById('time');
        const selectedTime = selectElement.value;
        //listTimes

        if (selectedTime && selectedTime !== 'Vælg') {
            const selectTimes = document.getElementById('listTimes');
            const existingElements = selectTimes.querySelectorAll(`li[value="${selectedTime}"]`);

            if (existingElements.length === 0) {
                // If no element with the same value exists, add the new one
                selectTimes.innerHTML += `<li class="chooseBane" value="${selectedTime}">${selectElement.options[selectElement.selectedIndex].textContent}</li>`;
            } else {
                console.log('Element already exists in the list.');
                // Handle the case where the element already exists (e.g., display an error message)
            }

        } else {
            console.log('Please select a valid time.'); // Show a message if no bane is selected
        }

    });

    //input todays dato in input tag
    let listOfToday = ["date", "PeriodeStartDate", "PeriodeEndDate"];
    for (let index = 0; index < listOfToday.length; index++) {
        const dateInput = document.getElementById(listOfToday[index]);
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;  
    }
    

});
//---------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------Banetype-------------------------------------------------------------------