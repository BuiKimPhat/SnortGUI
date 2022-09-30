// import { Server } from 'Socket.IO'
var net = require('net');

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    var server = net.createServer(function(connection) { 
      console.log('Ket noi voi Client');
      connection.on('end', function() {
         console.log('Mat ket noi voi Client');
      });
      // gui du lieu den client
      connection.write('Hello World!\r\n');
      connection.pipe(connection);
   });
   
    res.socket.server.io = server

    server.listen(7777, function() { 
      console.log('Server dang lang nghe tren cong 7777');
    });
  }
  res.end()
}

export default SocketHandler
