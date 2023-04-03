import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Board, Piece, Player, Tile } from '../class/chess';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @Input() size: number = 11
  @Input() freeGame: boolean = false
  board!: Board
  activeTile: Tile | null = null
  hexagonSize: number = 100
  @Output() move = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
    if (this.size == 11) {
      this.board = new Board()
    } else {
      this.board = new Board(null, this.size)
    }
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
        this.activateTile(tile)
      }
    } else {
      this.board.highlightMoves(this.activeTile)
      if ((tile.targetAction == 'move' || tile.targetAction == 'attack') && (this.activeTile.piece!.player == this.board.currentPlayer || this.freeGame)) {
        this.board.move(this.activeTile.piece!, tile)
        this.move.emit()
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

  activateTile(tile: Tile) {
    this.activeTile = tile
    this.board.highlightMoves(tile)
  }

  pieceX(piece: Piece) {
    return `${piece.positionOffset.x + 14}px`
  }

  pieceY(piece: Piece) {
    return `${piece.positionOffset.y + 7}px`
  }

  public restart() {
    this.board = new Board()
    this.activeTile = null
  }

  public undo() {
    this.board.undo()
    this.activeTile = null
  }
}
