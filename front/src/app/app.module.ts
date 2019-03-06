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
import { AccountsComponent } from './components/accounts/accounts.component';
import { LoginComponent } from './components/login/login.component';
import { AccountComponent } from './components/account/account.component';
import { NavComponent } from './components/nav/nav.component';
import { PatientComponent } from './components/patient/patient.component';

import { ProductComponent } from './components/product/product.component';
import { MessagesComponent } from './components/messages/messages.component';
import { SingupComponent } from './components/singup/singup.component';
import { DobPipe } from './pipes/dob.pipe';
import { AppointmentsComponent } from './components/appointments/appointments.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'account', component: AccountComponent},
  {path: 'signup', component: SingupComponent},
  {path: 'inpatients', component: PatientComponent},
  {path: 'products', component: InventoryComponent},
  {path: 'messages', component: MessagesComponent},
  {path: 'department', component: MessagesComponent},
  {path: 'department/information', component: RegistrationComponent},
  {path: 'department/pharmacy', component: PharmacyComponent},
  {path: 'department/:mode/ward', component: WardComponent},
  {path: 'department/:mode/consultation', component: ConsultationComponent},
  {path: 'department/:mode/consultation/inpatients', component: PatientComponent},
  {path: 'history/:id', component: HistoryComponent},
  // {path: 'consultation/:mode/:id', component: HistoryComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'}

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
    AccountsComponent,
    LoginComponent,
    NotePipe,
    AccountComponent,
    NavComponent,
    PatientComponent,
    
    ProductComponent,
    MessagesComponent,
    SingupComponent,
    DobPipe,
    AppointmentsComponent

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
