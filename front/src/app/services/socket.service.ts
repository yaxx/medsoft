import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Socket } from '../models/socket';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
 io: Socket = socketIo('http://localhost:5000');
  // io: Socket = socketIo('http://192.168.1.101:5000');
  constructor() { }
}
