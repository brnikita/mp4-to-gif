const io = require('socket.io-client');

// Store socket connections for each virtual user
const sockets = new Map();

module.exports = {
  connectToSocket,
  waitForConversion,
  disconnectSocket
};

function connectToSocket(context, events, done) {
  const socket = io('http://localhost', {
    transports: ['websocket'],
    auth: {
      token: context.vars.token
    }
  });

  socket.on('connect', () => {
    sockets.set(context.vars.token, socket);
    return done();
  });

  socket.on('connect_error', (error) => {
    events.emit('error', 'WebSocket connection failed: ' + error.message);
    return done(error);
  });
}

function waitForConversion(context, events, done) {
  const socket = sockets.get(context.vars.token);
  if (!socket) {
    events.emit('error', 'No socket connection found');
    return done(new Error('No socket connection found'));
  }

  // Subscribe to job status updates
  socket.emit('subscribe', context.vars.jobId);

  let timeoutId;
  const maxWaitTime = 30000; // 30 seconds max wait time

  const statusHandler = (data) => {
    if (data.jobId === context.vars.jobId) {
      context.vars.status = data.status;
      
      if (data.status === 'completed' || data.status === 'failed') {
        clearTimeout(timeoutId);
        socket.off('status_update', statusHandler);
        return done();
      }
    }
  };

  socket.on('status_update', statusHandler);

  // Set timeout to prevent test from hanging
  timeoutId = setTimeout(() => {
    socket.off('status_update', statusHandler);
    events.emit('error', 'Conversion timeout');
    return done(new Error('Conversion timeout'));
  }, maxWaitTime);
}

function disconnectSocket(context, events, done) {
  const socket = sockets.get(context.vars.token);
  if (socket) {
    socket.disconnect();
    sockets.delete(context.vars.token);
  }
  return done();
} 