import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate, isIndexinMoveList } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'
import { boardToFEN } from '../chess-board/FEN'
import { Board } from '../chess-board/Board'

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
        this.clickListener = this.clickListener.bind(this);
    }

    clickListener(event: any, index: Coordinate) {
        if(index.equals(this.state.currentSelected)){
            this.setState({
                movesList: [],
                currentSelected:new Coordinate()
            })
        }
        else if(isIndexinMoveList(index,this.state.movesList)){
            const move =  this.state.movesList.find(move=> move.toSquare.equals(index))
            // console.log(move)
            
            if(move!==undefined) {
                console.log("Move excuted")
                this.props.gameObj.executeMoveAndMutateGame(move)
                this.setState({
                    gameBoard:this.props.gameObj.board,
                    movesList: [],
                })
            }
        }
        else{
        this.setState({
            movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
            currentSelected:index
        })}
    }


    componentDidUpdate(prevProps:GameProps) {
       if(prevProps.gameObj!== this.props.gameObj){
           console.log("gameObj Changed")
           this.setState({
               gameBoard: this.props.gameObj.board,
               movesList: [],
           })
       }
    }

    render() {
        return (
            <div>
                <ChessBoard boardObj={this.state.gameBoard} gameClickListener={this.clickListener} showMoveinSquare={this.state.movesList} flipBoard={this.props.flipGame} />
            </div>
        )
    }
}
