/* socket.emit = invia echo solo al client interessato. / io.emit = invia echo a tutti i client (compreso il soggetto inviante) */

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var info = require('./info.json');
var app = express();
var port = 5000;

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var User = require('./class/User');
var Message = require('./class/Message');
var http = require('http').createServer(app); 
var io = require('socket.io')(http);

var client_users = [];

app.get('/', (req, res) => {
    res.render('index.html', {
        version: info.version,
        developer: info.developer,
        number: client_users.length,
        rooms: info.rooms
    });
})

app.post('/room', (req, res) => {
    res.render('room.html', {
        version: info.version,
        developer: info.developer,
        number: 0,
        username: (req.body.username.length < 1) ? "User" : req.body.username,
        room: (req.body.custom_room.length < 1) ? req.body.room_id : req.body.custom_room
    });
})

app.get('/room', (req, res) => {
    res.redirect('/');
})

io.on('connection', function(socket) {
    var user = new User("User", socket.id, null);
    client_users.push(user);
    socket.emit('get_data');
    socket.send(socket.id);

    socket.on('disconnect', function() {
        var client = client_users.findIndex(x => x.id === socket.id);
        var room = client_users[client].room;
        io.to(room).emit("left_user", {users: client_users, user: client_users[client]});
        client_users.splice(client, 1);
        socket.leave(room);
    })
    socket.on('update_user', function(data) {
        var client = client_users.findIndex(x => x.id === socket.id);
        client_users[client].username = (data.username.length < 1) ? "User" : data.username;
        client_users[client].room = data.room;
        socket.join(data.room);
        io.to(data.room).emit("new_user", {users: client_users, user: client_users[client]});
    })
    socket.on('add_message', function(data) {
        var client = client_users.findIndex(x => x.id === socket.id);
        var message = new Message(data.username, data.message, socket.id);
        socket.to(client_users[client].room).emit("update_chat", {message: message});   
    })
});

http.listen(port, function() {
    console.log('Server avviato sulla porta: ' + port)
})