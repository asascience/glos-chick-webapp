import openSocket from 'socket.io-client';

function subscribeToStream(cb) {
    // const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
    // // const url = 'wss://echo.websocket.org';
    // const connection = new WebSocket(url)

    // connection.onopen = () => {
    //   console.log('OnOpen')
    // }
    // connection.onmessage = e => {
    //   console.log(e.data)
    // }
}
// const  socket = openSocket('wss://gdjcxvsub6.execute-api.us-east-2.amazona.com/testing');
// const  socket = openSocket('http://localhost:8000');
// function subscribeToTimer(cb) {
//   socket.on('timer', timestamp => cb(null, timestamp));
//   socket.emit('subscribeToTimer', 1000);
// }
export { subscribeToStream };