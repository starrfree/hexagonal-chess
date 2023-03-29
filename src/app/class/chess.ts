// Hexagonal Chess Classes

export class Board {
    size: number
    tiles: Tile[][]
    lastMove: [Tile, Tile] | null = null
    currentPlayer: Player = Player.White

    constructor(size: number = 11) {
        this.size = size
        this.tiles = []
        for (let i = 0; i < size; i++) {
            this.tiles.push([])
            var rowCount = size - Math.abs(i - (size - 1) / 2)
            for (let j = 0; j < rowCount; j++) {
                var color: Color
                if (i <= (size - 1) / 2) {
                    color = [Color.White, Color.Gray, Color.Black][(i + j) % 3]
                } else {
                    color = [Color.White, Color.Gray, Color.Black][(2*i + j - Math.floor(size / 2)) % 3]
                }
                var tile = new Tile(this, color, {x: i, y: j})
                this.tiles[i].push(tile)
            }
        }
        // White
        // Pawn
        this.tiles[1][6].piece = new Pawn(Player.White, this.tiles[1][6])
        this.tiles[2][6].piece = new Pawn(Player.White, this.tiles[2][6])
        this.tiles[3][6].piece = new Pawn(Player.White, this.tiles[3][6])
        this.tiles[4][7].piece = new Pawn(Player.White, this.tiles[4][7])
        this.tiles[5][7].piece = new Pawn(Player.White, this.tiles[5][7])
        this.tiles[6][7].piece = new Pawn(Player.White, this.tiles[6][7])
        this.tiles[7][6].piece = new Pawn(Player.White, this.tiles[7][6])
        this.tiles[8][6].piece = new Pawn(Player.White, this.tiles[8][6])
        this.tiles[9][6].piece = new Pawn(Player.White, this.tiles[9][6])

        // Rook
        this.tiles[2][7].piece = new Rook(Player.White, this.tiles[2][7])
        this.tiles[8][7].piece = new Rook(Player.White, this.tiles[8][7])

        // Knight
        this.tiles[3][7].piece = new Knight(Player.White, this.tiles[3][7])
        this.tiles[7][7].piece = new Knight(Player.White, this.tiles[7][7])

        // Bishop
        this.tiles[4][8].piece = new Bishop(Player.White, this.tiles[4][8])
        this.tiles[6][8].piece = new Bishop(Player.White, this.tiles[6][8])

        // Queen
        this.tiles[4][9].piece = new Queen(Player.White, this.tiles[4][9])

        // King
        this.tiles[6][9].piece = new King(Player.White, this.tiles[6][9])

        // Black
        // Pawn
        this.tiles[1][0].piece = new Pawn(Player.Black, this.tiles[1][0])
        this.tiles[2][1].piece = new Pawn(Player.Black, this.tiles[2][1])
        this.tiles[3][2].piece = new Pawn(Player.Black, this.tiles[3][2])
        this.tiles[4][2].piece = new Pawn(Player.Black, this.tiles[4][2])
        this.tiles[5][3].piece = new Pawn(Player.Black, this.tiles[5][3])
        this.tiles[6][2].piece = new Pawn(Player.Black, this.tiles[6][2])
        this.tiles[7][2].piece = new Pawn(Player.Black, this.tiles[7][2])
        this.tiles[8][1].piece = new Pawn(Player.Black, this.tiles[8][1])
        this.tiles[9][0].piece = new Pawn(Player.Black, this.tiles[9][0])

        // Rook
        this.tiles[2][0].piece = new Rook(Player.Black, this.tiles[2][0])
        this.tiles[8][0].piece = new Rook(Player.Black, this.tiles[8][0])

        // Knight
        this.tiles[3][1].piece = new Knight(Player.Black, this.tiles[3][1])
        this.tiles[7][1].piece = new Knight(Player.Black, this.tiles[7][1])

        // Bishop
        this.tiles[4][1].piece = new Bishop(Player.Black, this.tiles[4][1])
        this.tiles[6][1].piece = new Bishop(Player.Black, this.tiles[6][1])

        // Queen
        this.tiles[4][0].piece = new Queen(Player.Black, this.tiles[4][0])

        // King
        this.tiles[6][0].piece = new King(Player.Black, this.tiles[6][0])
    }

    isInside(x: number, y: number): boolean {
        var maxY = this.size - Math.abs(x - (this.size - 1) / 2)
        return x >= 0 && x < this.size && y >= 0 && y < maxY
    }

    clearHighlighted() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].targetAction = null
            }
        }
    }

    clearLastMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].isLastMove = false
            }
        }
    }

    coordToIndex(position: [number, number]): [number, number] {
        let middle = (this.size - 1) / 2
        if (position[0] > middle) {
            return [position[0], position[1] - (position[0] - middle)]
        } else {
            return position
        }
    }

    indexToCoord(position: [number, number]): [number, number] {
        let middle = (this.size - 1) / 2
        if (position[0] > middle) {
            return [position[0], position[1] + (position[0] - middle)]
        } else {
            return position
        }
    }

    isEmptyAtCoord(position: [number, number]): boolean {
        let index = this.coordToIndex(position)
        if (this.isInside(index[0], index[1])) {
            return this.tiles[index[0]][index[1]].isEmpty
        }
        return false
    }

    isOtherPlayerAtCoord(position: [number, number], player: Player): boolean {
        let index = this.coordToIndex(position)
        if (this.isInside(index[0], index[1])) {
            let tile = this.tiles[index[0]][index[1]]
            if (tile.piece != null) {
                return tile.piece.player != player
            }
        }
        return false
    }

    isInsideAtCoord(position: [number, number]): boolean {
        let index = this.coordToIndex(position)
        return this.isInside(index[0], index[1])
    }

    move(piece: Piece, to: Tile) {
        let from = piece.tile
        from.piece = null
        to.piece = piece
        piece.tile = to
        if (piece instanceof Pawn) {
            piece.hasMoved = true
        }
        this.clearHighlighted()
        this.clearLastMove()
        to.isLastMove = true
        from.isLastMove = true
        this.currentPlayer = this.currentPlayer == Player.White ? Player.Black : Player.White
    }

    highlightMoves(tile: Tile) {
        if (tile.piece != null) {
            this.clearHighlighted()
            tile.piece.getPossibleMoves(this).forEach(move => {
                move.targetAction = move.isEmpty ? 'move' : 'attack'
            })
        }
    }
}

export class Tile {
    board: Board
    piece: Piece | null
    color: Color
    position: {x: number, y: number}
    targetAction: 'move' | 'attack' | null = null
    isLastMove: boolean = false

    get isEmpty(): boolean {
        return this.piece == null
    }

    constructor(board: Board, color: Color, position: {x: number, y: number}) {
        this.board = board
        this.piece = null
        this.color = color
        this.position = position
    }

    hexColor(): string {
        if (this.isLastMove) {
            switch(this.color) {
                case Color.White:
                    return '#F0F0C0'
                case Color.Gray:
                    return '#D0D0A0'
                case Color.Black:
                    return '#B0B080'
            }
        } else {
            switch(this.color) {
                case Color.White:
                    return '#A8E7A5'
                case Color.Gray:
                    return '#80C580'
                case Color.Black:
                    return '#59A85F'
            }
        }
    }
}

export class Piece {
    player: Player
    type: PieceType
    tile: Tile
    hasMoved: boolean = false
    get imageFile(): string {return ''}
    positionOffset: {x: number, y: number} = {x: 0, y: 0}

    constructor(player: Player, type: PieceType, tile: Tile) {
        this.player = player
        this.type = type
        this.tile = tile
    }

    getPossibleMoves(board: Board): Tile[] {
        return []
    }
}

export class Pawn extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/pawn_w.svg'
        } else {
            return 'black/pawn_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.Pawn, tile)
        this.positionOffset = {x: 0, y: -3.5}
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let direction = this.player == Player.White ? -1 : 1
        let targetMoves: [number, number][] = []
        if (board.isEmptyAtCoord([x, y + direction])) {
            targetMoves.push([x, y + direction])
        }
        if (!this.hasMoved && x != 3 && x != 5 && x != 7) {
            targetMoves.push([x, y + 2 * direction])
        }
        if (this.player == Player.White) {
            if (board.isOtherPlayerAtCoord([x - 1, y + direction], this.player)) {
                targetMoves.push([x - 1, y + direction])
            }
            if (board.isOtherPlayerAtCoord([x + 1, y], this.player)) {
                targetMoves.push([x + 1, y])
            }
        } else {
            if (board.isOtherPlayerAtCoord([x - 1, y], this.player)) {
                targetMoves.push([x - 1, y])
            }
            if (board.isOtherPlayerAtCoord([x + 1, y + direction], this.player)) {
                targetMoves.push([x + 1, y + direction])
            }
        }
        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })

        return possibleMoves
    }
}

export class Rook extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/rook_w.svg'
        } else {
            return 'black/rook_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.Rook, tile)
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let targetMoves: [number, number][] = []

        let i: number
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]].forEach(direction => {
            i = 1
            while (i <= 2 || direction[0] == 0) {
                let targetX = x + direction[0] * i
                let targetY = y + direction[1] * i
                if (board.isEmptyAtCoord([targetX, targetY])) {
                    targetMoves.push([targetX, targetY])
                    i++
                } else if (board.isInsideAtCoord([targetX, targetY]) && board.isOtherPlayerAtCoord([targetX, targetY], this.player)) {
                    targetMoves.push([targetX, targetY])
                    break
                } else {
                    break
                }
            }
        })

        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }
}

export class Knight extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/knight_w.svg'
        } else {
            return 'black/knight_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.Knight, tile)
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let targetMoves: [number, number][] = [
            [x+1, y-2],
            [x-1, y-3],
            [x+2, y-1],
            [x+3, y+1],
            [x+3, y+2],
            [x+2, y+3],
            [x-1, y+2],
            [x+1, y+3],
            [x-2, y+1],
            [x-3, y-1],
            [x-3, y-2],
            [x-2, y-3],
        ]
        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }
}

export class Bishop extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/bishop_w.svg'
        } else {
            return 'black/bishop_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.Bishop, tile)
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let targetMoves: [number, number][] = [
            [x+1, y],
            [x-1, y],
            [x+1, y+1],
            [x-1, y-1],
            [x, y+1],
            [x, y-1],
        ]
        if (board.isEmptyAtCoord([x-1, y]) || board.isEmptyAtCoord([x, y+1])) {
            targetMoves.push([x-1, y+1])
        }
        if (board.isEmptyAtCoord([x+1, y+1]) || board.isEmptyAtCoord([x, y+1])) {
            targetMoves.push([x+1, y+2])
        }
        if (board.isEmptyAtCoord([x+1, y]) || board.isEmptyAtCoord([x, y-1])) {
            targetMoves.push([x+1, y-1])
        }
        if (board.isEmptyAtCoord([x-1, y-1]) || board.isEmptyAtCoord([x, y-1])) {
            targetMoves.push([x-1, y-2])
        }
        if (board.isEmptyAtCoord([x-1, y]) || board.isEmptyAtCoord([x-1, y-1])) {
            targetMoves.push([x-2, y-1])
        }
        if (board.isEmptyAtCoord([x+1, y]) || board.isEmptyAtCoord([x+1, y+1])) {
            targetMoves.push([x+2, y+1])
        }
        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }
}

export class Queen extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/queen_w.svg'
        } else {
            return 'black/queen_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.Queen, tile)
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let targetMoves: [number, number][] = []

        let i: number
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]].forEach(direction => {
            i = 1
            while (true) {
                let targetX = x + direction[0] * i
                let targetY = y + direction[1] * i
                if (board.isEmptyAtCoord([targetX, targetY])) {
                    targetMoves.push([targetX, targetY])
                    i++
                } else if (board.isInsideAtCoord([targetX, targetY]) && board.isOtherPlayerAtCoord([targetX, targetY], this.player)) {
                    targetMoves.push([targetX, targetY])
                    break
                } else {
                    break
                }
            }
        })

        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }
}

export class King extends Piece {
    override get imageFile(): string {
        if (this.player == Player.White) {
            return 'white/king_w.svg'
        } else {
            return 'black/king_b.svg'
        }
    }

    constructor(player: Player, tile: Tile) {
        super(player, PieceType.King, tile)
    }

    override getPossibleMoves(board: Board): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let targetMoves: [number, number][] = [
            [x+1, y],
            [x-1, y],
            [x+1, y+1],
            [x-1, y-1],
            [x, y+1],
            [x, y-1],
        ]
        targetMoves.forEach(move => {
            move = board.coordToIndex(move)
            if (board.isInside(move[0], move[1]) && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }
}

export enum Player {
    White,
    Black
}

export enum Color {
    White,
    Gray,
    Black
}

export enum PieceType {
    Pawn,
    Rook,
    Knight,
    Bishop,
    Queen,
    King
}
