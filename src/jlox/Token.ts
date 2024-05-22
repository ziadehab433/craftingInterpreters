import { TokenType } from './TokenType.js'

export class Token{ 
    readonly type: TokenType;
    readonly lexeme: string;
    readonly literal: any;
    readonly line: number;

    constructor(type: TokenType, lexeme: string, literal: object | null, line: number){ 
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(): string{ 
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}
