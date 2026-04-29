import { io } from 'socket.io-client';
import { BASE_URL } from './apiClient';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io(BASE_URL, {
    auth: {
      token: token
    }
  });

  socket.on('connect', () => {
    console.log('Connected to Backend Socket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Backend Socket');
  });

  socket.on('security-alert', (data) => {
    console.log('Security Alert received:', data);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
