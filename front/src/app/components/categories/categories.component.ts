import { Component, OnInit } from '@angular/core';
import {Category} from '../../models/data.model';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
view = '';
categories: Category[] = new Array<Category>();
newCategories: Category[] = new Array<Category>();
category: Category = new Category();
  constructor() { }

  ngOnInit() {
    this.categories = new Array<Category>(new Category(1, 'Drugs', 0, 0,
    'for external use ony', new Date()), new Category(1, 'Podiatrics', 0, 0,
    'for external use ony', new Date()), new Category(1, 'Device', 0, 0,
    'for external use ony', new Date()), new Category(1, 'Container', 0, 0,
    'for external use ony', new Date()));
  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
  addCategory() {
    this.newCategories.push(this.category);
    this.category = new Category();
    this.switchViews();

  }



}
