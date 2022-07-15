const moment = require('moment');

const reservations = require('./reservations.json');
const rooms = require('./rooms.json');
const requests = require('./requests.json');

const getReservedRooms = (request) => {
    return reservations.filter((reservation) => {

        if (moment(reservation.checkout_date).isSameOrAfter(request.checkin_date) && moment(reservation.checkin_date).isSameOrBefore(request.checkout_date)) {
            return reservation.room_id;
        }
    });
};

const getAvailableRooms = (request, reservedRooms) => {
    const { id, min_beds, is_smoker, checkin_date, checkout_date } = request;

    return rooms.filter((room) => {
        if(is_smoker == room.allow_smoking && room.num_beds >= min_beds) {
            let found = false;
            for(let i = 0; i <  reservedRooms.length; i += 1) {
                if(reservedRooms[i].room_id == room.id) {
                    found = true;
                    break;
                }
            }
            if(!found) return room;
        }
    });
};

const assignRoom = (request, availableRooms) => {
    let a = moment(request.checkout_date);
    let b = moment(request.checkin_date);
    const noOfDays = a.diff(b, 'days');

    if (availableRooms.length == 0)
        return;

    let minRoom = availableRooms[0];
    let minPrice = (minRoom.daily_rate * noOfDays) + minRoom.cleaning_fee;

    for (let index = 0; index < availableRooms.length; index++) {
        const room = availableRooms[index];
        const reservationPrice = (room.daily_rate * noOfDays) + room.cleaning_fee;
        if (reservationPrice < minPrice) {
            minPrice = reservationPrice;
            minRoom = room;
        }
    }

    reservations.push({
        room_id: minRoom.id,
        checkin_date: request.checkin_date,
        checkout_date: request.checkout_date,
        total_charge: minPrice
    });

    return minRoom;
};

const reserveRoom = () => {
    for (let index = 0; index < requests.length; index++) {
        const request = requests[index];
        const reservedRooms = getReservedRooms(request)
        const availableRooms = getAvailableRooms(request, reservedRooms);
        assignRoom(request, availableRooms);
    }
}

reserveRoom();

console.log({ reservations });
