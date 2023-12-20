//--------------------------------------------------------------baner-------------------------------------------------------------------
let baneData;
let holdTyper;
    //hent court to drop down 
fetch("/hentbaner")
    .then(response => response.json())
    .then(data => {
        baneData = data;
        populateSelectOptions(baneData);
    })
    .catch(error => console.error("Fejl ved hentning af baner:", error));

fetch('/bookingType')
    .then(response => response.json())
    .then(data => {
        holdTyper= data;
        //console.log(holdTyper);
        populateHoldTypesOptions(holdTyper);
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
function populateHoldTypesOptions(holdTyper) {
    const selectHoldTypes = document.getElementById("holdName");
    if (holdTyper && holdTyper.length > 0) {
        selectHoldTypes.innerHTML = ""; // Clear the options first


        // Create the default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "Vælg";
        defaultOption.textContent = "Vælg Hold";
        selectHoldTypes.appendChild(defaultOption);
        //add court if courte macthe the sellectede sport
        holdTyper.forEach(type => {
            // console.log(bane.Banetype=== selectBaneType.value);
            //if (bane.Sport === selectSport.value && bane.Banetype=== selectBaneType.value) {
                if(type.BookingType !== "privat spil"){
                    const option = document.createElement("option");
                    //option.value = ;
                    option.textContent = type.BookingType;
                    selectHoldTypes.appendChild(option);
                }
        });
    
    
    }else {
        // Handle case where baneData is empty or undefined
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No Hold exist";
        option.disabled = true;
        selectHoldTypes.appendChild(option);
    }



    //populateSelectOptions(baneData)
};
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
        if (selectedBaneName && selectedBaneName !== 'Vælg' && selectedBaneName !== 'vælg') {
            const selectbaner = document.getElementById('listBaner');
            const selectedBaneName = selectElement.value;
            
            // Check if an element with the same value already exists in the list
            const existingElements = selectbaner.querySelectorAll(`li[value="${selectedBaneName}"]`);
            if (existingElements.length === 0) {
                // If no element with the same value exists, add the new one
                selectbaner.innerHTML += `<li class="chooseBane card-content" value="${selectedBaneName}">
                    <p class="card-content">${selectElement.options[selectElement.selectedIndex].textContent}</p>
                    <button class="slet-knap-bane card-content" id="deleteBane">Slet</button>
                </li>`;
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

        if (selectedTime && selectedTime !== 'Vælg' && selectedTime !== 'vælg') {
            console.log(selectedTime);
            const selectTimes = document.getElementById('listTimes');
            const existingElements = selectTimes.querySelectorAll(`li[value="${selectedTime}"]`);

            if (existingElements.length === 0) {
                // If no element with the same value exists, add the new one
                selectTimes.innerHTML += `
                <li class="chooseTimes card-content" value="${selectedTime}">
                    <p class ="card-content">${selectElement.options[selectElement.selectedIndex].textContent}</p>
                    <button class="slet-knap-time card-content" id="deleteBane">Slet</button>
                </li>`;
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
    
    // Event delegation for delete buttons
    const listBaner = document.getElementById('listBaner');
    const listTimes = document.getElementById('listTimes');

    listBaner.addEventListener('click', function(event) {
        if (event.target.classList.contains('slet-knap-bane')) {
            const listItem = event.target.closest('.chooseBane');
            if (listItem) {
                listItem.remove();
            }
        }
    });

    listTimes.addEventListener('click', function(event) {
        if (event.target.classList.contains('slet-knap-time')) {
            const listItem = event.target.closest('.chooseTimes');
            if (listItem) {
                listItem.remove();
            }
        }
    });
    //add hold names 
    const holdButom = document.getElementById('newHoldName');
    holdButom.addEventListener('click', function(event) {
        event.preventDefault(); // Prevents the default form submission behavior
        const holdElement = document.getElementById('Hold');
        const existingHoldNameInput = document.getElementById('HoldNameString');
        if(!existingHoldNameInput){
            const inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'text');
            inputElement.setAttribute('id', 'HoldNameString');
            inputElement.setAttribute('placeholder', 'Skriv Navn');
            
            const buttonToInput = document.createElement('button');
            buttonToInput.textContent = 'Tilføj';
    
            holdElement.appendChild(inputElement);
            holdElement.appendChild(buttonToInput);
    
            inputElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addNewOption();
                }
            });
    
            buttonToInput.addEventListener('click', function(evnt) {
                evnt.preventDefault();
                addNewOption();
            });
    
            function addNewOption() {
                const selectElement = document.getElementById('holdName');
                const enteredHoldName = inputElement.value.trim();
    
                if (enteredHoldName) {
                    // Create a new option element
                    const option = document.createElement('option');
                    option.value = enteredHoldName;
                    option.textContent = enteredHoldName;
    
                    // Add the new option to the select element
                    selectElement.appendChild(option);
    
                    // Remove the HoldNameString input element and button
                    inputElement.remove();
                    buttonToInput.remove();
                } else {
                    console.log('Please enter a valid name.');
                }
            }
        } 
    });

    const form = document.getElementById('myForm');
    //const listBaner = document.getElementById('listBaner');
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get selected holdName /booking type
        const holdNameSelect = document.getElementById('holdName');
        const selectedHoldName = holdNameSelect.value;
        // Get selected Sport
        const sportSelect = document.getElementById('Sport');
        const selectedSport= sportSelect.value;

        // Get selected Baner from the list 
        const selectedBaneItems = listBaner.querySelectorAll('li');
        const selectedBanerValues = Array.from(selectedBaneItems).map(item => item.getAttribute('value'));

        // Get selected date
        const dateSelect = document.getElementById('date');
        const selectedDate= dateSelect.value;
        
        // Get selected Periode
        const periodeStartDateSelect = document.getElementById('PeriodeStartDate');
        const selectedPeriodeStartDate= periodeStartDateSelect.value;

        const periodeEndDateSelect = document.getElementById('PeriodeEndDate');
        const selectedPeriodeEndDate= periodeEndDateSelect.value;

        // Get selected Baner from the list 
        const selectedTimesItems = listTimes.querySelectorAll('li');
        const selectedTimesValues = Array.from(selectedTimesItems).map(item => item.getAttribute('value'));

        // Creating an object with the selected values
        const formData = {
            BookingType: selectedHoldName,
            Sport: selectedSport,
            BanersID: selectedBanerValues,
            Dato: selectedDate,
            PeriodeStartDate: selectedPeriodeStartDate,
            PeriodeEndDate: selectedPeriodeEndDate,
            Times: selectedTimesValues
        };
        // Convert the object to a JSON string
        const jsonString = JSON.stringify(formData);
        console.log(jsonString);


        // Custom validation logic
        if (selectedHoldName === 'Vælg'||  selectedSport=== 'Vælg' ||selectedBanerValues.length === 0 ||selectedTimesValues.length ===0) {
            console.log('Please select all required fields.'); // Display error message or handle validation logic here
            window.alert('Please select all required fields.'); // Display error message as a popup
        } else {
            /* // All required fields are filled, proceed with form submission
            console.log('Form submitted successfully!');
            form.submit(); // Uncomment this line to submit the form */

            try {
              const response = await fetch('/OpretHoldSide/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              });
          
              const data = await response.json();
              displayResponseMessage(data.message);
            } catch (error) {
              console.error('Error:', error);
            }


        }
        
    });

    function displayResponseMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('response-message');
      
        document.body.appendChild(messageElement);
      
        // Automatically remove the message after a certain time (e.g., 5 seconds)
        /* setTimeout(() => {
            messageElement.remove();
            location.reload(); // Reload the page after the message disappears
        }, 5000); // Adjust the time as needed (in milliseconds) */
    }


});

//---------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------Banetype-------------------------------------------------------