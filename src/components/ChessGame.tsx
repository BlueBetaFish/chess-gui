import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate, getIndexinMoveList } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'
import { Board } from '../chess-board/Board'
import styles from "../styles/ChessGame.module.css"
import ChessPromotionSelector from './ChessPromotionSelector'
import { Color, PieceType } from '../chess-board/Pieces'

type GameProps = {
    gameObj: Game
    flipGame?: boolean
}

type GameState = {
    movesList: Move[]
    currentSelected: Coordinate
    gameBoard:Board |null
}


export default class ChessGame extends Component<GameProps, GameState> {

    state: Readonly<GameState> = {
        movesList: [],
        currentSelected:new Coordinate(),
        gameBoard:this.props.gameObj.board
    }

    constructor(props: GameProps) {
        super(props)
        this.moveClickListener = this.moveClickListener.bind(this);
        this.dropListener = this.dropListener.bind(this);
        this.dragStartListener = this.dragStartListener.bind(this);
        this.promotionClickListener = this.promotionClickListener.bind(this);
    }

    moveClickListener(event: any, index: Coordinate) {
        const move = getIndexinMoveList(index,this.state.movesList);
        if(index.equals(this.state.currentSelected)){
            this.setState({
                movesList: [],
                currentSelected:new Coordinate()
            })
        }
        else if(move!==undefined){
            this.props.gameObj.executeMoveAndMutateGame(move);
            this.setState({
                gameBoard:this.props.gameObj.board,
                movesList: [],
            })
        }
        else{
            this.setState({
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
                currentSelected:index
            })
        }
    }

    promotionClickListener(event: any, pieceType: PieceType){
        console.log(pieceType)
    }

    dragStartListener(event: any, index: Coordinate) {
       
        this.setState({
            movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
            currentSelected:index
        })
    }

    dropListener(event: any, index: Coordinate) {
        const move = getIndexinMoveList(index,this.state.movesList);

        if(move!==undefined){
            this.props.gameObj.executeMoveAndMutateGame(move);

                this.setState({
                    gameBoard:this.props.gameObj.board,
                    movesList: [],
                    currentSelected:new Coordinate()
                })
        }
    }


    componentDidUpdate(prevProps:GameProps) {
       if(prevProps.gameObj!== this.props.gameObj){
           this.setState({
               gameBoard: this.props.gameObj.board,
               movesList: [],
           })
       }
    }

    render() {
        return (
            <div className={styles.container}>
                {/* <ChessPromotionSelector 
                    peiceColor={Color.WHITE}
                    promotionClickListener={this.promotionClickListener}
                /> */}
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
