import { Component, OnInit, ViewChild } from '@angular/core';
import { Bishop, Board, King, Piece, PieceType, Player, Queen, Rook, Knight, Pawn } from '../class/chess';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {
  @ViewChild('kingBoard') kingBoard!: any
  @ViewChild('queenBoard') queenBoard!: any
  @ViewChild('rookBoard') rookBoard!: any
  @ViewChild('bishopBoard') bishopBoard!: any
  @ViewChild('knightBoard') knightBoard!: any
  @ViewChild('pawnBoard') pawnBoard!: any

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.kingBoard.board.tiles[3][3].piece = new King(Player.White, this.kingBoard.board.tiles[3][3])
      this.kingBoard.activateTile(this.kingBoard.board.tiles[3][3])

      this.queenBoard.board.tiles[3][3].piece = new Queen(Player.White, this.queenBoard.board.tiles[3][3])
      this.queenBoard.activateTile(this.queenBoard.board.tiles[3][3])

      this.rookBoard.board.tiles[3][3].piece = new Rook(Player.White, this.rookBoard.board.tiles[3][3])
      this.rookBoard.activateTile(this.rookBoard.board.tiles[3][3])

      this.bishopBoard.board.tiles[3][3].piece = new Bishop(Player.White, this.bishopBoard.board.tiles[3][3])
      this.bishopBoard.activateTile(this.bishopBoard.board.tiles[3][3])

      this.knightBoard.board.tiles[3][3].piece = new Knight(Player.White, this.knightBoard.board.tiles[3][3])
      this.knightBoard.activateTile(this.knightBoard.board.tiles[3][3])

      this.pawnBoard.board.tiles[3][4].piece = new Pawn(Player.White, this.pawnBoard.board.tiles[3][4])
      this.pawnBoard.board.tiles[2][4].piece = new Pawn(Player.White, this.pawnBoard.board.tiles[2][4])
      this.pawnBoard.board.tiles[4][4].piece = new Pawn(Player.White, this.pawnBoard.board.tiles[4][4])
      this.pawnBoard.activateTile(this.pawnBoard.board.tiles[3][4])
    }, 100)
  }
}
