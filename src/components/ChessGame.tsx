import { Component } from 'react'
import ChessBoard from './ChessBoard'
import Game from '../chess-board/Game'
import { Coordinate } from '../chess-board/chessUtility'
import Move from '../chess-board/Move'

type GameProps = {
    gameObj: Game
    flipGame?: boolean
}

type GameState = {
    movesList: Move[]
    currentSelected: Coordinate
}


export default class ChessGame extends Component<GameProps, GameState> {

    state: Readonly<GameState> = {
        movesList: [],
        currentSelected:new Coordinate()
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
        else{
        this.setState({
            movesList: this.props.gameObj.getLegalMovesOfGivenSquare(index),
            currentSelected:index
        })}
    }

    render() {
        return (
            <div>
                <ChessBoard boardObj={this.props.gameObj.board} gameClickListener={this.clickListener} showMoveinSquare={this.state.movesList} flipBoard={this.props.flipGame} />
            </div>
        )
    }
}
