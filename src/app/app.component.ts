import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('board') board!: ElementRef
  showMenu = false

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  toggleMenu() {
    this.showMenu = true
    let menuItems = document.getElementsByClassName("menu-item")
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].classList.toggle("show")
      menuItems[i].classList.toggle("hide")
    }
  }
}
