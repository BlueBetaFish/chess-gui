import React ,{Suspense} from 'react'
import Piece,{Color, PieceType} from '../chess-board/Pieces'
import styles from "../styles/ChessGrid.module.css"
import {useImage} from 'react-image'

type Props={
    piece:Piece,
    theme?:string
}

type ImageProps={
    srcURL:string
    altText:string
}

function Image(props:ImageProps) {
    const {src} = useImage({
      srcList: props.srcURL,
    })
   
    return <img src={src} alt={props.srcURL} />
  }


export default function ChessGrid (props:Props) {
    
    const themeStringPrefix = `assets/pieces/cardinal/`
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


    if(props.piece.pieceColor === Color.UNDEFINED){
        
        return (
            <div className={styles.grid}>

            </div>
        )
    }
    else{

        return (
            <div className={styles.grid}>
               <img src={getImageSrc(props.piece.pieceType,props.piece.pieceColor)}/>
            </div>
        )
    }
}
