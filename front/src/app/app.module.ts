import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CookieService } from 'ngx-cookie-service';
import {DataService} from './services/data.service';
import {SocketService} from './services/socket.service';
import {Patient} from './models/data.model';
import {RouterModule, Routes} from '@angular/router';
import { RegistrationComponent } from './components/registration/registration.component';
import { ConsultationComponent } from './components/consultation/consultation.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { HistoryComponent } from './components/history/history.component';
import { PharmacyComponent } from './components/pharmacy/pharmacy.component';

import { CategoriesComponent } from './components/categories/categories.component';
import { WardComponent } from './components/ward/ward.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { LoginComponent } from './components/login/login.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: AccountsComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'registration', component: RegistrationComponent},
  {path: 'consultation', component: ConsultationComponent},
  {path: 'pharmacy', component:  PharmacyComponent},
  {path: 'categories', component: CategoriesComponent},
  {path: 'inventory', component: InventoryComponent},
  {path: 'ward', component: WardComponent},
  {path: 'history', component: HistoryComponent},
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
    CategoriesComponent,
    WardComponent,
    AccountsComponent,
    LoginComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [DataService, CookieService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {}
