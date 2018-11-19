import { Component, OnInit } from '@angular/core';
import {Patient, Personal, Contact, Insurance, Visit, Record} from '../../models/data.model';
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  personal: Personal = new Personal();
  patients: Patient[] = new Array<Patient>();
  patient: Patient = new Patient(new Personal(), new Contact(), new Insurance(), new Record());
  constructor() { }

  ngOnInit() {
  }

}
