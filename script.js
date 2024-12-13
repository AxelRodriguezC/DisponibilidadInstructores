document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#availabilityTable tbody");
    const selectAllCheckboxes = document.querySelectorAll(".select-all");
    const searchButton = document.getElementById("searchButton");
    const instructorNameDisplay = document.getElementById("instructorName");
    const startTime = 7; // Hora de inicio: 7:00 AM
    const endTime = 23; // Hora de fin: 23:00 PM

    // Base de datos simulada
    const instructorDatabase = {
        "12345": "Juan Pérez",
        "67890": "María López",
        "11223": "Carlos García"
    };

    // Crear filas dinámicamente con intervalos de 30 minutos
    for (let hour = startTime; hour < endTime; hour++) {
        for (let half = 0; half < 2; half++) {
            const row = document.createElement("tr");
            const timeCell = document.createElement("td");
            const minutes = half === 0 ? "00" : "30";
            const nextMinutes = half === 0 ? "30" : "00";
            const nextHour = half === 0 ? hour : hour + 1;
            timeCell.textContent = `${hour}:${minutes} - ${nextHour}:${nextMinutes}`;
            row.appendChild(timeCell);

            // Crear celdas para cada día
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement("td");
                cell.classList.add("unavailable");
                cell.addEventListener("click", () => toggleAvailability(cell));
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        }
    }

    // Manejar "100% de disponibilidad"
    selectAllCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", (event) => {
            const dayIndex = parseInt(event.target.dataset.day);
            toggleAllForDay(dayIndex, event.target.checked);
        });
    });

    // Buscar el nombre del instructor al ingresar ID
    searchButton.addEventListener("click", () => {
        const instructorID = document.getElementById("instructorID").value;
        if (instructorDatabase[instructorID]) {
            instructorNameDisplay.textContent = `Nombre del Instructor: ${instructorDatabase[instructorID]}`;
        } else {
            instructorNameDisplay.textContent = "ID no encontrado.";
        }
    });
});

function toggleAvailability(cell) {
    if (cell.classList.contains("unavailable")) {
        cell.classList.remove("unavailable");
        cell.classList.add("available");
    } else if (cell.classList.contains("available")) {
        cell.classList.remove("available");
        cell.classList.add("unavailable");
    }
}

function toggleAllForDay(dayIndex, isChecked) {
    const rows = document.querySelectorAll("#availabilityTable tbody tr");
    rows.forEach(row => {
        const cell = row.cells[dayIndex];
        if (isChecked) {
            cell.classList.remove("unavailable");
            cell.classList.add("available");
        } else {
            cell.classList.remove("available");
            cell.classList.add("unavailable");
        }
    });
}

function submitAvailability() {
    const instructorID = document.getElementById("instructorID").value;
    if (!instructorID) {
        alert("Por favor, ingrese el ID del instructor.");
        return;
    }

    const table = document.querySelector("#availabilityTable");
    const availability = [];

    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const timeSlot = row.cells[0].textContent;
        const days = Array.from(row.cells).slice(1).map(cell => cell.classList.contains("available") ? "X" : "");
        availability.push({ timeSlot, days });
    }

    console.log("Instructor ID:", instructorID);
    console.log("Disponibilidad:", availability);

    alert("Disponibilidad enviada. Revisa la consola para más detalles.");
}
