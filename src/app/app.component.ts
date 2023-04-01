import { Component, ElementRef, ViewChild } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { Player } from './class/chess';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('board') board!: any
  showMenu = false

  get playerColor() {
    if (this.board == null) return 'white'
    return this.board.board.currentPlayer == Player.White ? 'white' : 'black'
  }

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

  restart() {
    this.board.restart()
  }

  undo() {
    this.board.undo()
  }
}
