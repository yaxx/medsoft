import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dob',
  pure: false
})
export class DobPipe implements PipeTransform {

  transform(dob: Date, args?: any): any {
    let age = null;
    let then = new Date(2000, 0, 11);
    let today = new Date();
    if(today.getMonth() === new Date(dob).getMonth()) {
      if(today.getDate() >= new Date(dob).getDate()){
        age = today.getFullYear() -new Date(dob).getFullYear();
      } else {
        age = (today.getFullYear() - new Date(dob).getFullYear()) - 1;
      }
    } else if(today.getMonth() > new Date(dob).getMonth()) {
      age = today.getFullYear() - new Date(dob).getFullYear();
    } else {
      age = (today.getFullYear() - new Date(dob).getFullYear()) - 1;
    }
    return age;
  }

}
