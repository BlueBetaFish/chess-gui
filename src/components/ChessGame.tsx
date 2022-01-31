import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate, getIndexinMoveList, GameStatus } from '../chess-board/chessUtility'
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
    game: Game,


    askForPromotion: boolean,
    movesList: Move[],
    currentSelected: Coordinate
    promoteToPiece: PieceType,
    promoteToIndex: Coordinate,
    promotionColor: Color,

}


export default class ChessGame extends Component<GameProps, GameState> {

    state: Readonly<GameState> = {
        game: this.props.gameObj,

        movesList: [],
        askForPromotion: false, //Can be denoted by index
        currentSelected: new Coordinate(),
        promoteToPiece: PieceType.NONE,
        promoteToIndex: new Coordinate(),
        promotionColor: Color.UNDEFINED,
    }

    constructor(props: GameProps) {
        super(props)
        this.dropListener = this.dropListener.bind(this);
        this.dragStartListener = this.dragStartListener.bind(this);
        this.promotionClickListener = this.promotionClickListener.bind(this);
    }

    moveClickListener = (event: any, index: Coordinate) => {
        const move = getIndexinMoveList(index, this.state.movesList);

        if (this.state.askForPromotion || this.state.game.gameStatus === GameStatus.CHECKMATE || this.state.game.gameStatus === GameStatus.STALEMATE) {
            //Freeze UI
        }
        else if (index.equals(this.state.currentSelected)) {
            this.setState({
                movesList: [],
                currentSelected: new Coordinate()
            })
        }
        else if (move !== undefined) {

            if (!(move.promotedPiece.equals(new Piece(PieceType.NONE, move.promotedPiece.pieceColor)))) {
                this.setState({
                    askForPromotion: true,
                    promoteToIndex: move.toSquare,
                    promotionColor: move.promotedPiece.pieceColor
                })
            }
            else {
                this.state.game.executeMoveAndMutateGame(move);
                this.setState({
                    game: this.state.game,
                    movesList: [],
                })
                console.log("click set", this.props.gameObj.getGameStatus())
            }
        }
        else {
            this.setState({
                movesList: this.state.game.getLegalMovesOfGivenSquare(index),
                currentSelected: index
            })
        }
    }

    promotionClickListener = (event: any, pieceType: PieceType) => {
        this.setState({
            promoteToPiece: pieceType
        })
    }

    dragStartListener = (event: any, index: Coordinate) => {

        if (!this.state.askForPromotion) {
            this.setState({
                movesList: this.state.game.getLegalMovesOfGivenSquare(index),
                currentSelected: index
            })
        }
    }

    dropListener = (event: any, index: Coordinate) => {
        const move = getIndexinMoveList(index, this.state.movesList);

        if (move !== undefined && !this.state.askForPromotion) {
            if (!(move.promotedPiece.equals(new Piece(PieceType.NONE, move.promotedPiece.pieceColor)))) {
                this.setState({
                    askForPromotion: true,
                    promoteToIndex: move.toSquare,
                    promotionColor: move.promotedPiece.pieceColor
                })
            }
            else {
                this.props.gameObj.executeMoveAndMutateGame(move);

                this.setState({
                    game: this.state.game,
                    movesList: [],
                    currentSelected: new Coordinate()
                })
                console.log("drop set", this.props.gameObj.getGameStatus())
            }
        }
    }



    componentDidUpdate = (prevProps: GameProps) => {
        if (prevProps.gameObj !== this.props.gameObj) {
            this.setState({
                game: this.props.gameObj,

                movesList: [],
                askForPromotion: false, //Can be denoted by index
                currentSelected: new Coordinate(),
                promoteToPiece: PieceType.NONE,
                promoteToIndex: new Coordinate(),
                promotionColor: Color.UNDEFINED,
            })
        }
        if (this.state.askForPromotion && this.state.promoteToPiece !== PieceType.NONE) {
            const move = this.state.movesList.find(move =>
                move.toSquare.equals(this.state.promoteToIndex) &&
                move.promotedPiece.pieceType === this.state.promoteToPiece
            )
            if (move !== undefined) {
                this.props.gameObj.executeMoveAndMutateGame(move);
                this.setState({
                    game: this.props.gameObj,

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
                        index={this.state.promoteToIndex}
                        boardFlipped={this.props.flipGame ?? false}
                        peiceColor={this.state.promotionColor}
                        promotionClickListener={this.promotionClickListener}
                    />
                    :
                    <></>
                }
                <ChessBoard
                    boardObj={this.state.game.board}
                    gameClickListener={this.moveClickListener}
                    gameDropListener={this.dragStartListener}
                    gameDragOverListener={this.dropListener}
                    showMoveinSquare={this.state.movesList}
                    flipBoard={this.props.flipGame}
                    checkIndex={this.state.game.kingInCheckCoordinate ?? new Coordinate()}
                />
                {(this.state.game.gameStatus === GameStatus.CHECKMATE || this.state.game.gameStatus === GameStatus.STALEMATE) ?
                    <span >{this.state.game.gameStatus}! <a href='/'>Reload.</a></span> :
                    <></>
                }
            </div>



        )
    }
}
