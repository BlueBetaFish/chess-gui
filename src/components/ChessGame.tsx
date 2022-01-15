import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate, getIndexinMoveList } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'
import { Board } from '../chess-board/Board'
import styles from "../styles/ChessGame.module.css"
import ChessPromotionSelector from './ChessPromotionSelector'
import Piece, { Color, PieceType } from '../chess-board/Pieces'

type GameProps = {
    gameObj: Game
    flipGame?: boolean
}

type GameState = {
    movesList: Move[]
    currentSelected: Coordinate
    gameBoard: Board | null,
    promoteToPiece: PieceType,
    promoteToIndex: Coordinate,
    askForPromotion: boolean

}


export default class ChessGame extends Component<GameProps, GameState> {

    state: Readonly<GameState> = {
        movesList: [],
        currentSelected: new Coordinate(),
        gameBoard: this.props.gameObj.board,
        promoteToPiece: PieceType.NONE,
        promoteToIndex: new Coordinate(),
        askForPromotion: false
    }

    constructor(props: GameProps) {
        super(props)
        this.moveClickListener = this.moveClickListener.bind(this);
        this.dropListener = this.dropListener.bind(this);
        this.dragStartListener = this.dragStartListener.bind(this);
        this.promotionClickListener = this.promotionClickListener.bind(this);
    }

    moveClickListener(event: any, index: Coordinate) {
        const move = getIndexinMoveList(index, this.state.movesList);

        if (this.state.askForPromotion) {

        }
        else if (index.equals(this.state.currentSelected)) {
            console.log("toggle")
            this.setState({
                movesList: [],
                currentSelected: new Coordinate()
            })
        }
        else if (move !== undefined) {

            if (!(move.promotedPiece.equals(new Piece(PieceType.NONE, move.promotedPiece.pieceColor)))) {
                this.setState({
                    askForPromotion: true,
                    promoteToIndex: move.toSquare
                })
            }
            else {
                this.props.gameObj.executeMoveAndMutateGame(move);
                this.setState({
                    gameBoard: this.props.gameObj.board,
                    movesList: [],
                })
            }
        }
        else {
            this.setState({
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
                currentSelected: index
            })
        }
    }

    promotionClickListener(event: any, pieceType: PieceType) {
        this.setState({
            promoteToPiece: pieceType
        })
    }

    dragStartListener(event: any, index: Coordinate) {

        if (!this.state.askForPromotion) {
            this.setState({
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
                currentSelected: index
            })
        }
    }

    dropListener(event: any, index: Coordinate) {
        const move = getIndexinMoveList(index, this.state.movesList);

        if (move !== undefined && !this.state.askForPromotion) {
            if (!(move.promotedPiece.equals(new Piece(PieceType.NONE, move.promotedPiece.pieceColor)))) {
                this.setState({
                    askForPromotion: true,
                    promoteToIndex: move.toSquare
                })
            }
            else {
                this.props.gameObj.executeMoveAndMutateGame(move);

                this.setState({
                    gameBoard: this.props.gameObj.board,
                    movesList: [],
                    currentSelected: new Coordinate()
                })
            }
        }
    }



    componentDidUpdate(prevProps: GameProps) {
        if (prevProps.gameObj !== this.props.gameObj) {
            this.setState({
                gameBoard: this.props.gameObj.board,
                movesList: [],
            })
        }
        if (this.state.askForPromotion && this.state.promoteToPiece !== PieceType.NONE) {
            const move = this.state.movesList.find(move =>
                move.toSquare.equals(this.state.promoteToIndex) &&
                move.promotedPiece.pieceType === this.state.promoteToPiece
            )
            if (move !== undefined){
                this.props.gameObj.executeMoveAndMutateGame(move);
                this.setState({
                    gameBoard: this.props.gameObj.board,
                    movesList: [],
                    askForPromotion: false,
                    promoteToPiece: PieceType.NONE,
                    promoteToIndex: new Coordinate()
                })
            }

        }
    }

    render() {
        return (
            <div className={styles.container}>
                {(this.state.askForPromotion) ?
                    <ChessPromotionSelector
                        peiceColor={Color.WHITE}
                        promotionClickListener={this.promotionClickListener}
                    />
                    :
                    <></>
                }
                <ChessBoard
                    boardObj={this.state.gameBoard}
                    gameClickListener={this.moveClickListener}
                    gameDropListener={this.dragStartListener}
                    gameDragOverListener={this.dropListener}
                    showMoveinSquare={this.state.movesList}
                    flipBoard={this.props.flipGame} />
            </div>
        )
    }
}
