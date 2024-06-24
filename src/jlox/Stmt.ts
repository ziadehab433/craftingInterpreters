import { Token } from './Token.js'; 
import { Expr } from './Expr.js'; 

export interface StmtVisitor<R> { 
    visitExpressionStmt: (stmt: any) => R; 
    visitPrintStmt: (stmt: any) => R; 
    visitVarStmt: (stmt: any) => R; 
}

export abstract class Stmt{ 
    abstract accept(visitor: StmtVisitor<any>): any; 
 
    static Expression = class extends Stmt{ 
        constructor( expression: Expr ){ 
            super(); 
 
            this.expression = expression 
        } 
 
        accept(visitor: StmtVisitor<any>): any { 
            return visitor.visitExpressionStmt(this); 
        } 
 
        readonly expression: Expr 
    } 

    static Print = class extends Stmt{ 
        constructor( expression: Expr ){ 
            super(); 
 
            this.expression = expression 
        } 
 
        accept(visitor: StmtVisitor<any>): any { 
            return visitor.visitPrintStmt(this); 
        } 
 
        readonly expression: Expr 
    } 

    static Var = class extends Stmt{ 
        constructor( name: Token,initializer: Expr ){ 
            super(); 
 
            this.name = name 
            this.initializer = initializer 
        } 
 
        accept(visitor: StmtVisitor<any>): any { 
            return visitor.visitVarStmt(this); 
        } 
 
        readonly name: Token 
        readonly initializer: Expr 
    } 

} 
