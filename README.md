# Chex - hexagonal chess
<b>Chex</b> is a variant of chess played on a hexagonal board.

## Rules
The rules are the same as in normal chess, except for the movement of the pieces.
Piece movements are explained here: [rule](https://chex.starfree.app/rules)

## FEN encoding
The board state can be encoded using a FEN-like notation.
Use the "Copy board URL" button to copy the encoding of the current board.
The FEN describes the state of the board as follows:
- The board is divided into rows corresponding to vertically aligned hexagons. Rows are separated by "_".
- A row is itself divided into tiles. Tiles are separated by "-".
    - A set of one or more empty tile is denoted by the number of empty tiles.
    - A piece is identified by a single letter (pawn = "P/p", rook = "R/r", knight = "N/n", bishop = "B/b", queen = "Q/q" and king = "K/k"). Uppercase letters for White and lowercase for Black.
    - If a letter is followed by "m", it means that the piece has moved. This is used to indicate weather a pawn can advance two hexagons.
- The end of the board description is marked with a "$" sign followed by a letter indicating which player is to move: "w" for White and "b" for Black.

*Examples:* 
- the starting position is encoded by ``6_p-5-P_r-p-4-P-R_1-n-p-3-P-N-1_q-b-p-4-P-B-Q_3-p-3-P-3_k-b-p-4-P-B-K_1-n-p-3-P-N-1_r-p-4-P-R_p-5-P_6$w``
- smaller board ``4_p-3-P_b-p-2-P-B_k-r-p-1-P-R-K_n-p-2-P-N_p-3-P_4$w``

Use ``https://chex.starfree.app/?fen=[FEN]`` to start a game with a custom fen.