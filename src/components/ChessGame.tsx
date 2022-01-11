import  React,{ Component } from 'react'
import  Board  from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate } from '../chess-board/chessUtility'

type GameProps = {
    gameObj: Game 
    flipGame?: boolean
}


export default class ChessGame extends Component<GameProps,any> {

    clickListener(event:any,index:Coordinate){
        console.log(index)
        // this.props.gameObj.getLegalMovesOfGivenSquare()
    }

    render() {
        return (
            <div>
                <Board boardObj={this.props.gameObj.board} gameClickListener={this.clickListener} flipBoard={this.props.flipGame}/>
            </div>
        )
    }
}
