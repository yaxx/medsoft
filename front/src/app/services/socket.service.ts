import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Socket } from '../models/socket';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
io: Socket = socketIo('http://localhost');
  // io: Socket = socketIo('http://13.59.243.243');
  constructor() { }
}
