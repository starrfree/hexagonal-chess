import { Component, OnInit, ViewChild } from '@angular/core';
import { Board, Player } from '../class/chess';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  @ViewChild('board') board!: any
  showMenu = false
  confirmingRestart = false
  getPlayerBackgroundColor = () => {}
  copied = false

  get playerColor() {
    return this.getPlayerBackgroundColor()
  }

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      let fen: string | null
      if (window.location.search) {
        fen = window.location.search.split('=')[1]
        window.history.replaceState({}, document.title, window.location.pathname)
        localStorage.setItem('fen', fen)
      } else {
        fen = localStorage.getItem('fen')
      }
      if (fen != null) {
        this.board.board = Board.fromFEN(fen)
        this.board.setHexSize()
      }
      this.getPlayerBackgroundColor = () => {
        if (this.board == null) return 'white'
        return this.board.board.currentPlayer == Player.White ? 'white' : 'black'
      }
    }, 0)
  }

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
      localStorage.removeItem('fen')
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

  onMove() {
    this.board.board.gameStatus()
    this.save()
  }

  save() {
    let fen = Board.toFEN(this.board.board)
    localStorage.setItem('fen', fen)
  }

  copy() {
    let fen = Board.toFEN(this.board.board)
    let url = `http://chex.starfree.app/?fen=${fen}`

    let copyElement = document.createElement('textarea')
    copyElement.value = url
    document.body.appendChild(copyElement)
    copyElement.select()
    navigator.clipboard.writeText(url)
    document.body.removeChild(copyElement)
    
    this.copied = true
    setTimeout(() => { this.copied = false }, 2000)
  }
}
