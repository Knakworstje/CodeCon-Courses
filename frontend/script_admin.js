// admin.js

document.addEventListener("DOMContentLoaded", function() {
    // Fetch contact data from the API endpoint
    fetch('https://codeconcourses.duckdns.org:5555/getContacts')
        .then(response => response.json())
        .then(data => {
            // Call a function to render the contact data in the table
            renderContacts(data);
        })
        .catch(error => console.error('Error fetching contacts:', error));
});

function renderContacts(contacts) {
    const contactTable = document.getElementById('contact-table');

    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.message}</td>
        `;
        contactTable.querySelector('tbody').appendChild(row);
    });
}