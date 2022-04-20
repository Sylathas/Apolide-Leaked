const express = require('express');
const app = express();
const http = require('http').Server(app);
console.log(http);
const io = require('socket.io')(http, {
	rejectUnauthorized: false
});
const fs=require("fs");
const path=require("path");
const startTime = process.argv.slice(2);

console.log(startTime);

var userCounter = 0;

app.use(express.static(__dirname));
app.get('/',function(req, res) {
	res.sendFile(__dirname+ '/index.html');
});

app.get('/video',function(req, res){
	const filepath = "./concert.mp4";
	const stat = fs.statSync(filepath)
	const fileSize = stat.size
	const range = req.headers.range
	
	if (range) {
		//range format is "bytes=start-end", 
		const parts = 
			range.replace(/bytes=/, "").split("-");
		 
		const start = parseInt(parts[0], 10)
		
		const end = 
			 parts[1] ?parseInt(parts[1], 10) :fileSize - 1
		  
		//chunk size is what the part of video we are sending.
		const chunksize = (end - start) + 1
		
		const file = fs.createReadStream(filepath, {start, end})
		  
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4',
		}
	
		// because video is continuosly fetched part by part 
		res.writeHead(206, head);
	  file.pipe(res);
		
	}else{
	  
	   const head = {
		   'Content-Length': fileSize,
		   'Content-Type': 'concert/mp4',
	   }
	   res.writeHead(200, head);
	   fs.createReadStream(path).pipe(res);
	}
});

io.sockets.on('connection', function(socket){
	socket.heartbeatTimeout = 500000;
    socket.closeTimeout = 500000;
	socket.userData = { x:0, y:0, z:0, heading:0 };//Default values;
	if (userCounter >= 200){
		var destination = 'http://theatre2.covohotel.com';
		socket.emit('redirect', destination);
		/*socket.emit('timesync', {
			id: data && 'id' in data ? data.id : null,
			result: Date.now()
		  });*/
	}
	console.log(`${socket.id} connected ` + userCounter);
	socket.emit('setId', { id:socket.id
	});
	
    socket.on('disconnect', function(){
		console.log(`${socket.id} disconnected ` + userCounter);
		socket.broadcast.emit('deletePlayer', { id: socket.id });
		if (userCounter > 0) {userCounter--;}
    });	
	
	socket.on('init', function(data){
		console.log(`socket.init model ${data.model} & texture ${data.colour}`);
		console.log(`socket.init ${data.colour}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = "Idle";
		userCounter++;
	});
	
	socket.on('update', function(data){
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = data.action;
	});
	
	socket.on('chat message', function(data){
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	})
});

http.listen(2002, function(){
  console.log('listening on *:2002');
});

setInterval(function(){
	const nsp = io.of('/');
    let pack = [];
	
    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		if (socket.userData.model!==undefined){
			pack.push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});    
		}
    }
	if (pack.length>0) io.emit('remoteData', pack);
}, 40);