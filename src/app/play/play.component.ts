import { Component, OnInit, ViewChild } from '@angular/core';
import { Player } from '../class/chess';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  @ViewChild('board') board!: any
  showMenu = false
  confirmingRestart = false

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
    this.confirmingRestart = false
  }

  restart() {
    if (this.confirmingRestart) {
      this.board.restart()
      this.toggleMenu()
      this.confirmingRestart = false
    } else {
      this.confirmingRestart = true
      setTimeout(() => { this.confirmingRestart = false }, 3000)
    }
  }

  undo() {
    this.board.undo()
  }
}
