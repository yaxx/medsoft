import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Socket } from '../models/socket';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
// io: Socket = socketIo('http://localhost:5000');
io: Socket = socketIo('http://18.221.76.96:5000');
  constructor() { }
}
