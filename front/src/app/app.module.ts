import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CookieService } from 'ngx-cookie-service';
import {DataService} from './services/data.service';
import {SocketService} from './services/socket.service';
import {NotePipe} from './pipes/note.pipe';
import {FileUploadModule} from 'ng2-file-upload';
import {RouterModule, Routes} from '@angular/router';
import { RegistrationComponent } from './components/registration/registration.component';
import { ConsultationComponent } from './components/consultation/consultation.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { HistoryComponent } from './components/history/history.component';
import { PharmacyComponent } from './components/pharmacy/pharmacy.component';
import { WardComponent } from './components/ward/ward.component';
import { LoginComponent } from './components/login/login.component';
import { AccountComponent } from './components/account/account.component';
import { PatientComponent } from './components/patient/patient.component';
import { MessagesComponent } from './components/messages/messages.component';
import { SingupComponent } from './components/singup/singup.component';
import { DobPipe } from './pipes/dob.pipe';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { MainComponent } from './components/navs/main/main.component';
import SimpleBar from 'SimpleBar';
const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: LoginComponent},
  {path: 'pharmacy', component: PharmacyComponent},
  {path: 'admin', component: MainComponent,
          children: [
            {path: 'appointments', component: AppointmentsComponent},
            { path: 'consultations', component: ConsultationComponent},
            {path: 'addmisions', component: PatientComponent},
            { path: 'discharged', component: RegistrationComponent},
            {path: 'pharmacy', component: PharmacyComponent},
            {path: 'inventory', component: InventoryComponent},
            {path: 'dashbord', component: InventoryComponent},
            { path: 'me', component: MessagesComponent},
            {path: 'settings', component: AccountComponent},
            { path: '', component: RegistrationComponent}
          ]
        },
  {path: 'information', component: MainComponent,
          children: [
             {path: 'appointments', component: AppointmentsComponent},
             {path: 'addmisions', component: PatientComponent},
             { path: 'consultations', component: ConsultationComponent},
             {path: 'pharmacy', component: PharmacyComponent},
             { path: 'me', component: MessagesComponent},
             { path: '', component: RegistrationComponent}
          ]
        },
  {path: ':dept/consultation', component: MainComponent,
          children: [
            {path: 'appointments', component: AppointmentsComponent},
            { path: 'addmisions', component: PatientComponent},
            { path: 'history/:id', component: HistoryComponent},
            { path: 'me', component: MessagesComponent},
            { path: '', component: ConsultationComponent}
          ]
        },
  {path: ':dept/ward', component: MainComponent,
        children: [
          { path: 'discharged', component: RegistrationComponent},
          { path: 'me', component: MessagesComponent},
          { path: '', component: WardComponent}
        ]
      },
  {path: 'pharmacy', component: MainComponent,
          children: [
            { path: 'me', component: MessagesComponent},
          
            { path: '', component: PharmacyComponent}
          ]
        },
 
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: '**', component: LoginComponent}

 ];
@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    ConsultationComponent,
    InventoryComponent,
    HistoryComponent,
    PharmacyComponent,
    WardComponent,
    LoginComponent,
    NotePipe,
    AccountComponent,
    PatientComponent,
    MessagesComponent,
    SingupComponent,
    DobPipe,
    AppointmentsComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FileUploadModule,
    RouterModule.forRoot(routes)
  ],
  providers: [DataService, CookieService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {}
