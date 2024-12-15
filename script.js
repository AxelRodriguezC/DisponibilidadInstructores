document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#availabilityTable tbody");
    const selectAllCheckboxes = document.querySelectorAll(".select-all");
    const searchButton = document.getElementById("searchButton");
    const instructorNameDisplay = document.getElementById("instructorName");
    const API_URL = "https://prod-34.westus.logic.azure.com:443/workflows/1810fb0a4c304b84a287dc209eb4c420/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SxNbEwBb1h5y42jXtk96JjksR8GBVdL8jAibz8RfJkc"; // Reemplaza con la URL del flujo de Power Automate
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
        const instructorID = document.getElementById("instructorID").value.trim();
        if (instructorDatabase[instructorID]) {
            instructorNameDisplay.textContent = `Nombre del Instructor: ${instructorDatabase[instructorID]}`;
        } else {
            instructorNameDisplay.textContent = "ID no encontrado.";
        }
    });
});

// Alternar disponibilidad de una celda
function toggleAvailability(cell) {
    if (cell.classList.contains("unavailable")) {
        cell.classList.remove("unavailable");
        cell.classList.add("available");
    } else if (cell.classList.contains("available")) {
        cell.classList.remove("available");
        cell.classList.add("unavailable");
    }
}

// Marcar o desmarcar todas las celdas de un día
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

// Enviar disponibilidad al flujo de Power Automate
async function submitAvailability() {
    const instructorID = document.getElementById("instructorID").value.trim();
    if (!instructorID) {
        alert("Por favor, ingresa el ID del instructor.");
        return;
    }

    const table = document.querySelector("#availabilityTable");
    const disponibilidades = [];

    // Recorrer filas de la tabla
    for (let i = 0; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const timeSlot = row.cells[0].textContent; // Ejemplo: "08:00 - 08:30"
        const [horaInicio, horaFin] = timeSlot.split(" - ");

        // Recorrer columnas (días de la semana)
        Array.from(row.cells).slice(1).forEach((cell, index) => {
            if (cell.classList.contains("available")) {
                disponibilidades.push({
                    dia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index],
                    hora_inicio: horaInicio,
                    hora_fin: horaFin,
                    fecha_hora_carga: new Date().toISOString()
                });
            }
        });
    }

    // Validar que haya disponibilidades seleccionadas
    if (disponibilidades.length === 0) {
        alert("Por favor, selecciona al menos un bloque de disponibilidad.");
        return;
    }

    // Construir el objeto para enviar
    const datosInstructor = {
        id_instructor: instructorID,
        nombre_instructor: instructorDatabase[instructorID] || "Nombre no encontrado",
        disponibilidades: disponibilidades
    };

    // Enviar datos al flujo
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosInstructor)
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message || "Disponibilidad enviada correctamente.");
        } else {
            alert("Error al enviar la disponibilidad. Intenta nuevamente.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
}
