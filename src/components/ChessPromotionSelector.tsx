import { Component } from 'react'
import { Coordinate } from '../chess-board/chessUtility'
import Piece, { PieceType, Color } from '../chess-board/Pieces'
import ChessPromotionSelectorSquare from './ChessPromotionSelectorSquare'
import styles from "../styles/ChessPromotionSelector.module.css"


type ChessPromotionSelectorProps = {
    peiceColor: Color,
    index: Coordinate,
    boardFlipped: boolean,
    promotionClickListener: any
}

type ChessPromotionSelectorState = {
    translateString: string
}


const PIECE_ARRAY_WHITE: Piece[] = [new Piece(PieceType.QUEEN, Color.WHITE),
new Piece(PieceType.ROOK, Color.WHITE),
new Piece(PieceType.BISHOP, Color.WHITE),
new Piece(PieceType.KNIGHT, Color.WHITE),
]
const PIECE_ARRAY_BLACK: Piece[] = [new Piece(PieceType.QUEEN, Color.BLACK),
new Piece(PieceType.ROOK, Color.BLACK),
new Piece(PieceType.BISHOP, Color.BLACK),
new Piece(PieceType.KNIGHT, Color.BLACK),
]
export default class ChessPromotionSelector extends Component<ChessPromotionSelectorProps, ChessPromotionSelectorState> {

    state: ChessPromotionSelectorState = {
        translateString: ""
    }



    private flip = () => (this.props.index.x == 0 !== this.props.boardFlipped) !== (this.props.peiceColor === Color.BLACK)
    private getAbsoluteIndexfromIndex = (): Coordinate => {
        if (this.props.boardFlipped) {
            return new Coordinate(this.props.index.x, 7 - this.props.index.y)

        }
        else {
            return new Coordinate(7 - this.props.index.x, this.props.index.y)
        }
    }

    getTranslateFromIndex = () => {
        const index = this.getAbsoluteIndexfromIndex()

        return `translate(${(index.y) * 10}vmin, ${(this.flip()) ? "40min" : "0vmin"})`
    }

    boardClickListener = () => { }

    componentDidMount() {
        this.setState({
            translateString: this.getTranslateFromIndex()
        })
    }


    componentDidUpdate(prevProps: ChessPromotionSelectorProps) {
        if (this.props.boardFlipped !== prevProps.boardFlipped) {
            console.log("updated")
            this.setState({
                translateString: this.getTranslateFromIndex()
            })
        }
    }

    render() {
        console.log(this.state.translateString)
        return (
            <div
                className={styles.selector}
                style={
                    {
                        transform: this.state.translateString
                    }
                }>{
                    (this.props.peiceColor === Color.WHITE) ?
                        ((this.flip()) ?
                            PIECE_ARRAY_WHITE.reverse().map((piece, index) =>
                                <ChessPromotionSelectorSquare
                                    piece={piece}
                                    key={index}
                                    boardClickListener={this.props.promotionClickListener}
                                />
                            )
                            :
                            PIECE_ARRAY_WHITE.map((piece, index) =>
                                <ChessPromotionSelectorSquare
                                    piece={piece}
                                    key={index}
                                    boardClickListener={this.props.promotionClickListener}
                                />
                            )) :
                        ((this.flip()) ?
                            PIECE_ARRAY_BLACK.reverse().map((piece, index) =>
                                <ChessPromotionSelectorSquare
                                    piece={piece}
                                    key={index}
                                    boardClickListener={this.props.promotionClickListener}

                                />
                            )
                            :
                            PIECE_ARRAY_BLACK.map((piece, index) =>
                                <ChessPromotionSelectorSquare
                                    piece={piece}
                                    key={index}
                                    boardClickListener={this.props.promotionClickListener}
                                />
                            ))
                }
            </div>
        )



    }
}
