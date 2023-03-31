import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Board, Piece, Player, Tile } from '../class/chess';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Board = new Board()
  activeTile: Tile | null = null
  hexagonSize: number = 100

  constructor() { }

  ngOnInit(): void {
    let setSize = () => {
      this.hexagonSize = Math.min(window.innerWidth / 9, window.innerHeight / 10)
    }
    window.addEventListener('resize', () => {setSize()})
    setSize()
  }

  xOffset(tile: Tile): string {
    if (tile.position.x > 0) {
      return `${-this.hexagonSize / 4}px`
    }
    return '0px'
  }

  clickTile(tile: Tile) {
    if (this.activeTile == null) {
      if (tile.piece != null) {
        this.activeTile = tile
        this.board.highlightMoves(tile)
      }
    } else {
      this.board.highlightMoves(this.activeTile)
      if ((tile.targetAction == 'move' || tile.targetAction == 'attack') && this.activeTile.piece!.player == this.board.currentPlayer) {
        this.board.move(this.activeTile.piece!, tile)
        console.log(this.board.gameStatus())
        this.activeTile = null
      } else {
        if (tile == this.activeTile || tile.piece == null) {
          this.activeTile = null
          this.board.clearHighlighted()
        } else {
          this.activeTile = tile
          this.board.highlightMoves(tile)
        }
      }
    }
  }

  pieceX(piece: Piece) {
    return `calc(15% + ${piece.positionOffset.x}px)`
  }

  pieceY(piece: Piece) {
    return `calc(10% + ${piece.positionOffset.y}px)`
  }

  public restart() {
    this.board = new Board()
    this.activeTile = null
  }
}
