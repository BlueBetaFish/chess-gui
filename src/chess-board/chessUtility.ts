export class Coordinate {
    x: number;
    y: number;

    constructor(x: number = -1, y: number = -1) {
        this.x = x;
        this.y = y;
    }

    equals(newCoordinate: Coordinate): boolean {
        return this.x === newCoordinate.x && this.y === newCoordinate.y;
    }
}

export function isValidAlgebricCoordinate(algebricCoordinate: string): boolean {
    //if algebricCoordinate contains more than 2 characters
    if (algebricCoordinate.length !== 2) return false;

    const file = algebricCoordinate[0];
    const rank = algebricCoordinate[1];

    if (!isNaN(+file) || isNaN(+rank)) return false;

    //if first file is not within ['a','h'] , or rank is not within [1,8]
    if (
        !(
            "a".charCodeAt(0) <= file.charCodeAt(0) &&
            file.charCodeAt(0) <= "h".charCodeAt(0)
        ) ||
        !(1 <= +rank && +rank <= 8)
    )
        return false;

    return true;
}

/**
 *
 * @param algebricCoordinate Algebric Coordinate (eg : "b2")
 * @returns indices of the corresponding algebric coordinate (eg : "b2" -> {x : 1 , y : 1})
 */
export function getIndicesFromAlgebricCoordinate(
    algebricCoordinate: string
): Coordinate {
    if (!isValidAlgebricCoordinate(algebricCoordinate))
        return new Coordinate(-1, -1);

    let fileIndex = algebricCoordinate.charCodeAt(0) - "a".charCodeAt(0);
    let rankIndex = +algebricCoordinate[1] - 1;

    return new Coordinate(rankIndex, fileIndex);
}

/**
 *
 * @param indices (eg : {x : 1, y : 1})
 * @returns algebric coordinate (eg : {x : 1, y : 1} -> "b2")
 */
export function getAlgebricCoordinateFromIndices(
    indices: Coordinate
): string | null {
    if (
        !(0 <= indices.x && indices.x <= 7) ||
        !(0 <= indices.y && indices.y <= 7)
    )
        return null;

    let rank = `${indices.x + 1}`;
    let file = String.fromCharCode("a".charCodeAt(0) + indices.y);

    return `${file}${rank}`;
}
