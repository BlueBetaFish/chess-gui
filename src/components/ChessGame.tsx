import  React,{ Component } from 'react'
import  Board  from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'

type GameProps = {
    gameObj: Game 
    flipGame?: boolean
}

type GameState = {
    movesList: Move[]
}


export default class ChessGame extends Component<GameProps,GameState> {

    state: Readonly<GameState>={
        movesList:[]
    }

    constructor(props:GameProps){
        super(props)
        this.clickListener = this.clickListener.bind(this);
    }

    clickListener(event:any,index:Coordinate){
        this.setState ({
                movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index)
            })
    }

    render() {
        return (
            <div>
                <Board boardObj={this.props.gameObj.board} gameClickListener={this.clickListener} showMoveinSquare={this.state.movesList} flipBoard={this.props.flipGame}/>
            </div>
        )
    }
}
