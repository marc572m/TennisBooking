function processBookings(bookings) {
    // Gør noget med bookingerne
    return bookings.map((booking, index) => {
        return {
            index: index + 1,
            bookingDetails: JSON.stringify(booking),
            // Tilføj andre nødvendige transformationer eller bearbejdning her
        };
    });
}

// Gør det muligt at importere funktionen i andre filer, hvis det er nødvendigt
if (typeof module !== 'undefined' && module.exports) {
    module.exports = processBookings;
}
