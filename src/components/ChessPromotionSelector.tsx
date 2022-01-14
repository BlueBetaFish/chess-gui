import  { Component } from 'react'
import { Coordinate } from '../chess-board/chessUtility'
import Piece, { PieceType, Color } from '../chess-board/Pieces'
import ChessSquare from './ChessSquare'
import styles from "../styles/ChessPromotionSelector.module.css"


type ChessPromotionSelectorProps = {
    peiceColor:Color,
    promotionClickListener:any
}

type ChessPromotionSelectorState = any


const PIECE_ARRAY_WHITE : Piece[] = [   new Piece(PieceType.QUEEN,Color.WHITE),
                                        new Piece(PieceType.ROOK,Color.WHITE),
                                        new Piece(PieceType.BISHOP,Color.WHITE),
                                        new Piece(PieceType.KNIGHT,Color.WHITE),
                                        ]
const PIECE_ARRAY_BLACK : Piece[] = [   new Piece(PieceType.QUEEN,Color.BLACK),
                                        new Piece(PieceType.ROOK,Color.BLACK),
                                        new Piece(PieceType.BISHOP,Color.BLACK),
                                        new Piece(PieceType.KNIGHT,Color.BLACK),
                                        ]
export default class ChessPromotionSelector extends Component<ChessPromotionSelectorProps,ChessPromotionSelectorState> {
    
    constructor(props:ChessPromotionSelectorProps){
        super(props)

    }
    
    
    
    render() {
        
        if(this.props.peiceColor===Color.WHITE){
            return (
                <div className={styles.selector}>
                {PIECE_ARRAY_WHITE.map((piece,index)=>
                    <ChessSquare
                        piece={piece}
                        key={index}
                        index={new Coordinate(0, index)}
                        colorIndex={new Coordinate(1, index)}
                        boardClickListener={(event: any)=>{this.props.promotionClickListener(event,piece.pieceType)}}
                        showMoveIndicator={false}
                        boardDropListener={()=>{}}
                        boardDragStartListener={()=>{}}
                    />
                    )}
                </div>
            )
        }
        else if(this.props.peiceColor===Color.BLACK){
            return (
                <></>
            )
        }
        else
        return (
            <></>
        )
    }
}
