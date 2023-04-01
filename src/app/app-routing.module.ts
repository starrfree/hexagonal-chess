import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayComponent } from './play/play.component';
import { RulesComponent } from './rules/rules.component';

const routes: Routes = [
  { path: 'rules', component: RulesComponent },
  { path: '', component: PlayComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }