// Hexagonal Chess Classes

export class Board {
    size: number
    tiles: Tile[][]
    currentPlayer: Player = Player.White
    history: {piece: Piece, to: Tile, capturedPiece: Piece | null, promotedPiece: boolean}[] = []
    indexInHistory: number = -1

    constructor(fen: string | null = '6_p-5-P_r-p-4-P-R_1-n-p-3-P-N-1_q-b-p-4-P-B-Q_3-p-3-P-3_k-b-p-4-P-B-K_1-n-p-3-P-N-1_r-p-4-P-R_p-5-P_6$w', size: number | null = null) {
        if (fen != null) {
            let board = Board.fromFEN(fen)
            this.size = board.size
            this.tiles = board.tiles
            this.currentPlayer = board.currentPlayer
        } else {
            if (size == null) {
                throw new Error('Either FEN or size must be provided')
            }
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
        }
    }

    move(piece: Piece, to: Tile) {
        let originalPiece = piece.deepCopy(piece.tile)
        let from = piece.tile
        from.piece = null
        let capturedPiece = to.piece?.deepCopy(to) ?? null
        to.piece = piece
        piece.tile = to
        let promotedPiece = false
        if (piece instanceof Pawn) {
            piece.hasMoved = true
            if (to.position.y == 0 && piece.player == Player.White) {
                to.piece = new Queen(piece.player, to)
                promotedPiece = true
            }
            if (to.position.y == this.tiles[to.position.x].length-1 && piece.player == Player.Black) {
                to.piece = new Queen(piece.player, to)
                promotedPiece = true
            }
        }
        this.clearHighlighted()
        this.clearLastMove()
        to.isLastMove = true
        from.isLastMove = true
        this.currentPlayer = this.currentPlayer == Player.White ? Player.Black : Player.White
        this.history.push(
            {
                piece: originalPiece,
                to: to,
                capturedPiece: capturedPiece,
                promotedPiece: promotedPiece,
            }
        )
    }

    undo() {
        let lastMove = this.history.pop()
        if (lastMove) {
            lastMove.to.piece = lastMove.capturedPiece
            if (lastMove.promotedPiece) {
                lastMove.piece.tile.piece = new Pawn(lastMove.piece.player, lastMove.piece.tile)
            } else {
                lastMove.piece.tile.piece = lastMove.piece
            }
            lastMove.to.isLastMove = false
            lastMove.piece.tile.isLastMove = false
            this.currentPlayer = this.currentPlayer == Player.White ? Player.Black : Player.White
            this.clearHighlighted()
        }
    }

    gameStatus(): GameStatus {
        let whiteMoves: Tile[] = []
        let whiteKing: King | null = null
        let blackMoves: Tile[] = []
        let blackKing: King | null = null
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j]
                if (tile.piece != null) {
                    if (tile.piece instanceof King) {
                        if (tile.piece.player == Player.White) {
                            whiteKing = tile.piece
                        } else {
                            blackKing = tile.piece
                        }
                    }
                    let moves = tile.piece.getPossibleMoves(this, true)
                    if (tile.piece.player == Player.White) {
                        whiteMoves = whiteMoves.concat(moves)
                    } else {
                        blackMoves = blackMoves.concat(moves)
                    }
                }
            }
        }
        if (whiteKing == null || blackKing == null) {
            return GameStatus.InProgress
        }
        if (whiteMoves.length == 0) {
            if (blackMoves.includes(whiteKing.tile)) {
                whiteKing.tile.gameStatus = GameStatus.BlackWon
                blackKing.tile.gameStatus = GameStatus.BlackWon
                return GameStatus.BlackWon
            } else {
                whiteKing.tile.gameStatus = GameStatus.Draw
                blackKing.tile.gameStatus = GameStatus.Draw
                return GameStatus.Draw
            }
        }
        if (blackMoves.length == 0) {
            if (whiteMoves.includes(blackKing.tile)) {
                whiteKing.tile.gameStatus = GameStatus.WhiteWon
                blackKing.tile.gameStatus = GameStatus.WhiteWon
                return GameStatus.WhiteWon
            } else {
                whiteKing.tile.gameStatus = GameStatus.Draw
                blackKing.tile.gameStatus = GameStatus.Draw
                return GameStatus.Draw
            }
        }
        return GameStatus.InProgress
    }

    kingIsInCheck(player: Player): boolean {
        let otherPlayerMoves: Tile[] = []
        let kingTile: Tile | null = null
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j]
                if (tile.piece != null) {
                    let moves = tile.piece.getPossibleMoves(this, false)
                    if (tile.piece.player != player) {
                        otherPlayerMoves = otherPlayerMoves.concat(moves)
                    } else if (tile.piece instanceof King) {
                        kingTile = tile
                    }
                }
            }
        }
        if (kingTile == null) {
            return false
        }
        return otherPlayerMoves.includes(kingTile)
    }

    movePutsInCheck(piece: Piece, to: Tile): boolean {
        let newBoard: Board = this.deepCopy()
        newBoard.move(newBoard.tiles[piece.tile.position.x][piece.tile.position.y].piece!, newBoard.tiles[to.position.x][to.position.y])
        let kingIsInCheck = newBoard.kingIsInCheck(piece.player)
        return kingIsInCheck
    }

    highlightMoves(tile: Tile) {
        if (tile.piece != null) {
            this.clearHighlighted()
            tile.piece.getPossibleMoves(this).forEach(move => {
                move.targetAction = move.isEmpty ? 'move' : 'attack'
            })
        }
    }

    isInside(x: number, y: number): boolean {
        var maxY = this.size - Math.abs(x - (this.size - 1) / 2)
        return x >= 0 && x < this.size && y >= 0 && y < maxY
    }

    clearHighlighted() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].targetAction = null
                this.tiles[i][j].gameStatus = null
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

    clear() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j]
                tile.piece = null
                tile.targetAction = null
                tile.gameStatus = null
            }
        }
    }
    
    deepCopy(): Board {
        return Board.fromFEN(Board.toFEN(this))
    }

    static toFEN(board: Board): string {
        let fen = ''
        for (let i = 0; i < board.size; i++) {
            let empty = 0
            let didAdd = false
            for (let j = 0; j < board.tiles[i].length; j++) {
                let tile = board.tiles[i][j]
                if (tile.isEmpty) {
                    empty++
                } else {
                    if (didAdd) {
                        fen += '-'
                    }
                    if (empty > 0) {
                        fen += `${empty}-`
                        empty = 0
                    }
                    fen += tile.piece!.toFEN()
                    didAdd = true
                }
            }
            if (empty > 0) {
                if (didAdd) {
                    fen += '-'
                }
                fen += empty
            }
            if (i < board.size - 1) {
                fen += '_'
            }
        }
        fen += '$' + (board.currentPlayer == Player.White ? 'w' : 'b')
        return fen
    }

    static fromFEN(fen: string): Board {
        let fenParts = fen.split('$')
        let player = fenParts[1] == 'w' ? Player.White : Player.Black
        let board = new Board(null, fenParts[0].split('_').length)
        board.currentPlayer = player
        let rows = fenParts[0].split('_')
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            let tiles = row.split('-')
            let x = 0
            for (let j = 0; j < tiles.length; j++) {
                let tile = tiles[j]
                if (isNaN(Number(tile))) {
                    let piece = Piece.fromFEN(tile, board.tiles[i][x])
                    board.tiles[i][x].piece = piece
                    x++
                } else {
                    x += Number(tile)
                }
            }
        }
        return board
    }
}

export class Tile {
    board: Board
    piece: Piece | null
    color: Color
    position: {x: number, y: number}
    targetAction: 'move' | 'attack' | null = null
    gameStatus: GameStatus | null = null
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
        if (this.piece != null && (this.piece instanceof King)) {
            let win = (this.piece?.player == Player.Black && this.gameStatus == GameStatus.BlackWon) || (this.piece?.player == Player.White && this.gameStatus == GameStatus.WhiteWon)
            let lose = (this.piece?.player == Player.Black && this.gameStatus == GameStatus.WhiteWon) || (this.piece?.player == Player.White && this.gameStatus == GameStatus.BlackWon)
            let draw = this.gameStatus == GameStatus.Draw
            if (lose) {
                return 'lightcoral'
            } else if (win) {
                return 'rgb(255, 255, 128)'
            } else if (draw) {
                return 'lightgray'
            }
        }
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

    getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
        return []
    }

    deepCopy(tile: Tile): Piece {
        let newPiece: Piece
        switch(this.constructor) {
            case Pawn:
                newPiece = new Pawn(this.player, tile)
                break
            case Rook:
                newPiece = new Rook(this.player, tile)
                break
            case Knight:
                newPiece = new Knight(this.player, tile)
                break
            case Bishop:
                newPiece = new Bishop(this.player, tile)
                break
            case Queen:
                newPiece = new Queen(this.player, tile)
                break
            case King:
                newPiece = new King(this.player, tile)
                break
            default:
                throw new Error('Unknown piece type')
        }
        newPiece.hasMoved = this.hasMoved
        return newPiece
    }

    toFEN(): string {
        return ''
    }

    static fromFEN(fen: string, tile: Tile): Piece {
        let pieceString: string = fen[0]
        let moveString: string = fen[1]
        let player = pieceString == pieceString.toUpperCase() ? Player.White : Player.Black
        let s = pieceString.toLowerCase()
        let type = s == 'p' ? PieceType.Pawn : s == 'r' ? PieceType.Rook : s == 'n' ? PieceType.Knight : s == 'b' ? PieceType.Bishop : s == 'q' ? PieceType.Queen : PieceType.King
        let piece: Piece
        switch(type) {
            case PieceType.Pawn:
                piece = new Pawn(player, tile)
                break
            case PieceType.Rook:
                piece = new Rook(player, tile)
                break
            case PieceType.Knight:
                piece = new Knight(player, tile)
                break
            case PieceType.Bishop:
                piece = new Bishop(player, tile)
                break
            case PieceType.Queen:
                piece = new Queen(player, tile)
                break
            case PieceType.King:
                piece = new King(player, tile)
                break
            default:
                throw new Error('Unknown piece type')
        }
        piece.hasMoved = moveString == 'm'
        return piece
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

    twoTilesAllowed(): boolean {
        if (this.hasMoved) {
            return false
        }
        let direction = this.player == Player.White ? -1 : 1
        switch(this.player) {
            case Player.White:
                return this.tile.position.y + 2 * direction >= this.tile.board.tiles[this.tile.position.x].length / 2
            case Player.Black:
                return this.tile.position.y + 2 * direction <= this.tile.board.tiles[this.tile.position.x].length / 2 - 1
        }
    }

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
        let possibleMoves: Tile[] = []

        let x = this.tile.position.x
        let y = this.tile.position.y;
        [x, y] = board.indexToCoord([x, y])

        let direction = this.player == Player.White ? -1 : 1
        let targetMoves: [number, number][] = []
        if (board.isEmptyAtCoord([x, y + direction])) {
            targetMoves.push([x, y + direction])
        }
        if (this.twoTilesAllowed()) {//!this.hasMoved && x != 3 && x != 5 && x != 7
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })

        return possibleMoves
    }

    override toFEN(): string {
        let moveString = this.hasMoved ? 'm' : ''
        return (this.player == Player.White ? 'P' : 'p') + moveString
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

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }

    override toFEN(): string {
        return this.player == Player.White ? 'R' : 'r'
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

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }

    override toFEN(): string {
        return this.player == Player.White ? 'N' : 'n'
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

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }

    override toFEN(): string {
        return this.player == Player.White ? 'B' : 'b'
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

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }

    override toFEN(): string {
        return this.player == Player.White ? 'Q' : 'q'
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

    override getPossibleMoves(board: Board, checkCheck: Boolean = true): Tile[] {
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
            if (board.isInside(move[0], move[1]) 
            && (board.tiles[move[0]][move[1]].isEmpty || board.tiles[move[0]][move[1]].piece!.player != this.player)
            && (!checkCheck || !board.movePutsInCheck(this, board.tiles[move[0]][move[1]]))) {
                possibleMoves.push(board.tiles[move[0]][move[1]])
            }
        })
        return possibleMoves
    }

    override toFEN(): string {
        return this.player == Player.White ? 'K' : 'k'
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

export enum GameStatus {
    InProgress,
    WhiteWon,
    BlackWon,
    Draw
}