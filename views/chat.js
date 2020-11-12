document.addEventListener("DOMContentLoaded", function() {
    /* Socket part */
    var socket = io();
    var id = undefined;
    var username = document.getElementById("socket.id").getAttribute("username");
    var room = document.getElementById("socket.id").getAttribute("room");
    socket.on('message', (data) => {
        id = data;
    })
    socket.on('new_user', (data) => {
        updateCount(data.users);
        sendNotify(data.user, "si è unito alla chat.");
    })
    socket.on('left_user', (data) => {
        updateCount(data.users);
        sendNotify(data.user, "ha abbandonato la chat.");
    })
    socket.on('get_data', () => {
        socket.emit('update_user', {
            username: username,
            room: room
        });
    })
    socket.on('update_chat', (data) => {
        updateChat(data.message.id, data.message.by, data.message.text);
    })
    /* JS Part */
    updateCount = (users) => {
        var count = 0;
        for(var i = 0; i < users.length; i++) {
            if(users[i].room === room) count++;
        }
        document.getElementById("count_users").innerHTML = count;
    }
    updateChat = (user_id, by, text) => {
        var message =  '<i class="fa fa-user-circle-o tooltip" aria-hidden="true" socket=' + user_id + '></i> ' + '<strong>' + by +  '</strong>' + '<br />' + text;
        var li = document.createElement("li");
        var position = (user_id === id) ? "right" : "left";
        li.className = "message " + position;
        li.innerHTML = message;
        document.getElementById("messages").prepend(li);
    }
    sendNotify = (who, reason) => {
        var message = who.username + '#' + who.id + ' ' + reason;
        var li = document.createElement("div");
        li.className = "alert";
        var text = document.createTextNode(message);
        li.appendChild(text);
        document.getElementById("messages").prepend(li);  
    }
    document.getElementById("exit").addEventListener('click', function() {
        window.location.href = "/";
    });
    document.querySelector('#messages').addEventListener('mouseover', function(e) {
        if (e.target.tagName.toLowerCase() === 'i') {
            var icon_socket = e.target.getAttribute("socket");
            var span = document.createElement("span");
            span.className = "tooltiptext";
            span.innerHTML = icon_socket;
            e.target.append(span);
        }
    })
    document.getElementById("send").addEventListener('submit', function(e) {
        e.preventDefault();
        var message_id = document.getElementById("message");
        var text = message_id.value;
        if(text.length > 0){
            message_id.value = '';
            socket.emit('add_message', {username: username, message: text});
            updateChat(id, username, text);
            message_id.disabled = true;
            document.getElementById("message_send").disabled = true;
            setTimeout(function() { 
                message_id.disabled = false;
                document.getElementById("message_send").disabled = false;
            }, 2000);
        }
    });
});