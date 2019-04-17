import { Pipe, PipeTransform } from '@angular/core';
import {Note} from '../models/record.model';
@Pipe({
  name: 'note',
  pure: false
})
export class NotePipe implements PipeTransform {

  transform(note: Note, args?: any): string {
    return ''
    // return note.note.length < 20 && note.full ? note.note : note.note.substr(0, 149);
    // let reading = null;
    // if(note.note.length > 200||!note.full) {
    //   reading = note.note.substr(0, 197);
    // } else {
    //   note.full = true;
    //   reading = note.note;
    // }
    // return reading;
  }
 
}
