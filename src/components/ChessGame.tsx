import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate, getIndexinMoveList, GameStatus } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'
import styles from "../styles/ChessGame.module.css"
import ChessPromotionSelector from './ChessPromotionSelector'
import Piece, { Color, PieceType } from '../chess-board/Pieces'
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../state/store"
import { updateGame } from '../state/slices/gameSlice'
import { boardToFEN } from '../chess-board/FEN'



type PropsFromRedux = ConnectedProps<typeof connector>

interface GameProps extends PropsFromRedux {
    propGameObj: Game
    flipGame?: boolean
}

interface DispatchProps {
    updateGame: () => void
}

type GameState = {

    askForPromotion: boolean,
    movesList: Move[],
    currentSelected: Coordinate
    promoteToPiece: PieceType,
    promoteToIndex: Coordinate,
    promotionColor: Color,

}


export class ChessGame extends Component<GameProps, GameState> {

    state: Readonly<GameState> = {

        movesList: [],
        askForPromotion: false, //Can be denoted by index
        currentSelected: new Coordinate(),
        promoteToPiece: PieceType.NONE,
        promoteToIndex: new Coordinate(),
        promotionColor: Color.UNDEFINED,
    }

    moveClickListener = (event: any, index: Coordinate) => {

        const move = getIndexinMoveList(index, this.state.movesList);

        if (this.state.askForPromotion || this.props.gameObj.gameStatus === GameStatus.CHECKMATE || this.props.gameObj.gameStatus === GameStatus.STALEMATE) {
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
                this.props.gameObj.executeMoveAndMutateGame(move);
                if (this.props.gameObj.board) this.props.dispatch(updateGame(new Game(boardToFEN(this.props.gameObj.board) ?? "")));

                this.setState({
                    movesList: [],
                })
                console.log("click set", this.props.gameObj.getGameStatus())
            }
        }
        else {
            this.setState({
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
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
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
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
                if (this.props.gameObj.board) this.props.dispatch(updateGame(new Game(boardToFEN(this.props.gameObj.board) ?? "")));

                this.setState({
                    movesList: [],
                    currentSelected: new Coordinate()
                })
                console.log("drop set", this.props.gameObj.getGameStatus())
            }
        }
    }

    componentDidUpdate = (prevProps: GameProps) => {
        if (prevProps.propGameObj !== this.props.propGameObj) {
            console.log("called cdu")

            this.props.dispatch(updateGame(this.props.propGameObj))

            this.setState({
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
                if (this.props.gameObj.board) this.props.dispatch(updateGame(new Game(boardToFEN(this.props.gameObj.board) ?? "")));

                this.setState({
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
                    boardObj={this.props.gameObj.board}
                    gameClickListener={this.moveClickListener}
                    gameDropListener={this.dragStartListener}
                    gameDragOverListener={this.dropListener}
                    showMoveinSquare={this.state.movesList}
                    flipBoard={this.props.flipGame}
                    checkIndex={this.props.gameObj.kingInCheckCoordinate ?? new Coordinate()}
                />
                {(this.props.gameObj.gameStatus === GameStatus.CHECKMATE || this.props.gameObj.gameStatus === GameStatus.STALEMATE) ?
                    <span >{this.props.gameObj.gameStatus}! <a href='/'>Reload.</a></span> :
                    <></>
                }
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => state.game

const connector = connect(mapStateToProps)

export default connector(ChessGame)