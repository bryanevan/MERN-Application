
let user1 = {
    Username: 'Jon',
    Password: 'changetheseason',
    Email: 'jon@gmail.com',
    Birthday: '10/01/1990',
}

let user2 = {
    Username: 'Bryan',
    Password: '1234567890',
    Email: 'bryan@gmail.com',
    Birthday: '10/07/1990',
}

let user3 = {
    Username: 'Jose',
    Password: 'rrererererere',
    Email: 'jose@gmail.com',
    Birthday: '01/01/1990',
}

let user4 = {
    Username: 'Drew',
    Password: '9876543ertghj',
    Email: 'drew@gmail.com',
    Birthday: '04/01/1990',
}

let user5 = {
    Username: 'Stef',
    Password: 'werfsdfgseason',
    Email: 'stef@gmail.com',
    Birthday: '05/01/1990',
}

db.users.insertMany([user1, user2, user3, user4, user5]);