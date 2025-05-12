const API_URL = `http://localhost:8080/car`;

const tableBody = document.querySelector('#car-table tbody');
const modal = document.getElementById('modal');
const form = document.getElementById('car-form');
const closeModalBtn = document.getElementById('close-modal');
const addCarBtn = document.getElementById('add-car');
const message = document.getElementById('message');

function showMessage(text, isError = true) {
    message.textContent = text;
    message.style.color = isError ? '#d32f2f' : 'green';
}

function openModal(car = null) {
    modal.style.display = 'block';
    if (car) {
        form['car-id'].value = car.id;
        form['brand'].value = car.brand;
        form['model'].value = car.model;
        form['electric'].value = car.electric;
        form['fuelUse'].value = car.fuelUse;
        form['dayOfCommission'].value = car.dayOfCommission;
        form['owner'].value = car.owner;
    } else {
        form.reset();
        form['car-id'].value = '';
    }
}

function closeModal() {
    modal.style.display = 'none';
}

async function fetchCars() {
    try {
        const response = await fetch(API_URL);
        const cars = await response.json();
        renderTable(cars);
    } catch (error) {
        showMessage('Nem sikerült betölteni az autókat.');
    }
}

function renderTable(cars) {
    tableBody.innerHTML = '';
    cars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${car.brand}</td>
            <td>${car.model}</td>
            <td>${car.electric ? 'Igen' : 'Nem'}</td>
            <td>${car.fuelUse}</td>
            <td>${car.dayOfCommission}</td>
            <td>${car.owner}</td>
            <td>
                <button onclick='editCar(${car.id})'>Szerkesztés</button>
                <button onclick='deleteCar(${car.id})' style='background-color: #d32f2f;'>Törlés</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function editCar(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const car = await response.json();
        openModal(car);
    } catch (error) {
        showMessage('Nem sikerült betölteni az autó részleteit.');
    }
}

async function deleteCar(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        showMessage('Autó törölve.', false);
        fetchCars();
    } catch (error) {
        showMessage('Nem sikerült törölni az autót.');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = form['car-id'].value;
    const newCar = {
        brand: form['brand'].value,
        model: form['model'].value.trim(),
        electric: form['electric'].value === 'true',
        fuelUse: Number(form['fuelUse'].value),
        dayOfCommission: form['dayOfCommission'].value,
        owner: form['owner'].value.trim()
    };

    if (id) newCar.id = Number(id);

    const ownerPattern = /.+\s.+/;
    const validOwner = ownerPattern.test(newCar.owner);
    const validFuel = newCar.electric ? newCar.fuelUse === 0 : newCar.fuelUse > 0;

    if (!newCar.brand || !newCar.model || !newCar.dayOfCommission || !validOwner || !validFuel) {
        showMessage('Kérlek, adj meg minden mezőt helyesen!');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCar)
        });

        if (!response.ok) throw new Error();
        showMessage(id ? 'Autó módosítva!' : 'Autó létrehozva!', false);
        closeModal();
        fetchCars();
    } catch (error) {
        showMessage('Nem sikerült menteni az autót.');
    }
});

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
addCarBtn.addEventListener('click', () => openModal());

fetchCars();
