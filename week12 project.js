// creating classes in order to be able to perform AJAX + (send AJAX/http request to the preexisting API)
class Condo {
    constructor(name) {
        this.name = name;
        this.rooms = [];
    }

    // method to add a room
    addRoom(name, area) {
        this.rooms.push(new Room(name, area));
    }
}

// class to be able to create a room and define area
class Room {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}

// root url for all endpoints that are being called on the API
class CondoService {
    // static url = 'https://ancient-taiga-31359.herokuapp.com/api/houses'; (from class, no longer works?)
    // static url ='https://64449f04b80f57f581a86a64.mockapi.io/' (tried using this resource but CORS policy error.. tried using live server but same error)
    static url = 'https://62c85d578c90491c2cb47da3.mockapi.io/Promineo_Tech_API/houses';
     
    // creating "CRUD (create, read, update, delete)
    // one below has no parameters because it is targeting all condos
    static getAllCondos() {
        return $.get(this.url);
    }

    // below is targeting 1 specific condo based on id
    static getCondo(id) {
        return $.get(this.url + `/${id}`);
    }

    // instance of class Condo to create new condo 
    static createCondo(condo) {
        return $.post(this.url, condo);
    }

    // update existing condo
    static updateCondo(condo) {
        return $.ajax({
            // '_id' = value automatically created by (mongo) database for the condo
            url: this.url + `/${condo._id}`,
            dataType: 'json',
            // take object and convert it to json string before sending it to http request
            data: JSON.stringify(condo),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    // only needs id to select which condo to target/delete
    static deleteCondo(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

// rerender the DOM each time when a new class is created 
class DOMManager {
    static condos;

    // after method, returns a promise, use the promise and what we get back, call 'condos'
    static getAllCondos() {
        CondoService.getAllCondos().then(condos => this.render(condos));
    }

    // creating a new condo based on 'name', send http request, then rerender condos
    static createCondo(name) {
        CondoService.createCondo(new Condo(name))
            .then(() => {
                return CondoService.getAllCondos();
            })
            .then((condos) => this.render(condos));
    }

    //created another method to delete condo (delete condo, send another http request, then rerender condos) 
    static deleteCondo(id) {
        CondoService.deleteCondo(id)
            .then(() => {
                return CondoService.getAllCondos();
            })
            .then((condos) => this.render(condos));
    }

    //using a for loop to be able to find the condo to add a room 
    static addRoom(id) {
        for (let condo of this.condos) {
            if (condo._id == id) {
                // since the 2 parameters (name + area) both have 'condo._id', referencing that to target/identify the value
                condo.rooms.push(new Room($(`#${condo._id}-room-name`).val(), $(`#${condo._id}-room-area`).val()));
                CondoService.updateCondo(condo)
                    //send update request to the API (new data that represents the condo)
                    .then(() => {
                        return CondoService.getAllCondos();
                    })
                    // after retrieving, rerender
                    .then((condos) => this.render(condos)); 
            }
        }
    }

    // 2 parameters - to be able to identify which condo and room to delete
    static deleteRoom(condoId, roomId) {
        for (let condo of this.condos) {
            if (condo._id = condoId) {
                for (let room of condo.rooms) {
                    if (room._id == roomId) {
                        // using splice method to remove 1 element that is targeted
                        condo.rooms.splice(condo.rooms.indexOf(room), 1);
                        CondoService.updateCondo(condo)
                            .then(() => {
                                return CondoService.getAllCondos();
                            })
                            .then((condos) => this.render(condos));
                    }
                }
            }
        }
    }

    // manages the DOM (repaints/rerender)
    static render(condos) {
        this.condos = condos;
        // referencing the div 'application' on html
        $('#application').empty();
        // loop through all condos
        for (let condo of condos) {
            // prepend to add at the top
            $('#application').prepend(
                // writing html in javascript - create delete button, create a card to show rows of room name + area, create add button
                `<div id="${condo._id}" class="card">
                    <div class="card-header">
                        <h2>${condo.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteCondo('${condo._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${condo._id}-room-name" class="form-control" placeholder="Room Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${condo._id}-room-area" class="form-control" placeholder="Room Area">
                                </div>
                            </div>
                            <button id="${condo._id}-new-room" onclick="DOMManager.addRoom('${condo._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            // nested loop to render each room within each condo(s) that are rendered
            for (let room of condo.rooms) {
                $(`${condo._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                        <span id="area-${room._id}"><strong>Area: </strong> ${room.area}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${condo._id}', '${room._id}')">Delete Room</button>`
                );      // added delete room button above
            }
        }
    }
}

// referencing the create new condo button from html file 
$('#create-new-condo').click(() => {
    DOMManager.createCondo($('#new-condo-name').val());
    $('#new-condo-name').val('');
})

// to test/run the application
DOMManager.getAllCondos();