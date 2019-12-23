import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Socket } from '../models/socket';
import {host} from '../util/url';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  io: Socket = socketIo(host);
  constructor() { }
}
