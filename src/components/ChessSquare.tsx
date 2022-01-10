import React ,{Suspense} from 'react'
import Piece,{Color, PieceType} from '../chess-board/Pieces'
import styles from "../styles/ChessGrid.module.css"

type Props={
    piece:Piece,
    index:{
        rankNum:number,
        fileNum:number
    },
    theme?:string
}





export default function ChessGrid (props:Props) {
    
    const themeStringPrefix = `assets/pieces/cardinal/`
    console.log(props.index)
    // src\assets\pieces\cardinal\bb.svg
    // getImageSrc(props.piece.pieceType,props.piece.pieceColor)

    
    function getImageSrc(peiceType:PieceType,peiceColor:Color): string{
    
        if(peiceColor === Color.WHITE){
    
            switch(peiceType){
    
                case PieceType.PAWN:
                    return themeStringPrefix+"wp.svg";
                break;
    
                case PieceType.KNIGHT:
                    return themeStringPrefix+"wn.svg";
                break;
    
                case PieceType.BISHOP:
                    return themeStringPrefix+"wb.svg";
                break;
    
                case PieceType.ROOK:
                    return themeStringPrefix+"wr.svg";
                break;
    
                case PieceType.QUEEN:
                    return themeStringPrefix+"wq.svg";
                break;
    
                case PieceType.KING:
                    return themeStringPrefix+"wk.svg";
                break;
    
            }
        }
        else{
    
            switch(peiceType){
    
                case PieceType.PAWN:
                    return themeStringPrefix+"bp.svg";
                break;
    
                case PieceType.KNIGHT:
                    return themeStringPrefix+"bn.svg";
                break;
    
                case PieceType.BISHOP:
                    return themeStringPrefix+"bb.svg";
                break;
    
                case PieceType.ROOK:
                    return themeStringPrefix+"br.svg";
                break;
    
                case PieceType.QUEEN:
                    return themeStringPrefix+"bq.svg";
                break;
    
                case PieceType.KING:
                    return themeStringPrefix+"bk.svg";
                break;
    
            }
        }
        return ""
    }

    function isLightSquare():boolean{
        const {rankNum,fileNum}=props.index;
        if(rankNum%2==0){
            return (fileNum%2===0)
        }
        else{
            return (fileNum%2!==0)
        }
    }


    if(props.piece.pieceColor === Color.UNDEFINED){
        
        return (
            <div className={[styles.grid, (isLightSquare())? styles.light : styles.dark].join(' ')}>

            </div>
        )
    }
    else{

        return (
            <div className={[styles.grid, (isLightSquare())? styles.light : styles.dark].join(' ')}>
               <img src={getImageSrc(props.piece.pieceType,props.piece.pieceColor)}/>
            </div>
        )
    }
}
