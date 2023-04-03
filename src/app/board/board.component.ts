import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    if (this.size == 11) {
      console.log('11')
      // this.board = Board.fromFEN('6/p-5-P/r-p-4-P-R/1-n-p-3-P-N-1/q-b-p-4-P-B-Q/3-p-3-P-3/k-b-p-4-P-B-K/1-n-p-3-P-N-1/r-p-4-P-R/p-5-P/6 w')
      this.board = Board.fromFEN('6/p-5-P/r-p-4-P-R/1-n-p-3-P-N-1/q-b-p-4-P-B-Q/11/k-b-2-p-2-P-B-K/1-n-p-3-P-N-1/r-p-4-P-R/p-5-P/6 w')
    } else {
      this.board = new Board(this.size)
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
        console.log(Board.toFEN(this.board))
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
