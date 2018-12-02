import { Pipe, PipeTransform } from '@angular/core';
import {Note} from '../models/data.model';
@Pipe({
  name: 'note',
  pure: false
})
export class NotePipe implements PipeTransform {

  transform(note: Note, args?: any): string {
    return note.full ? note.note : note.note.substr(0, 50);
  }

}