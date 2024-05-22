import { Token } from './Token.js'; 

export interface ExprVisitor<R> { 
    visitBinaryExpr: (expr: any) => R; 
    visitGroupingExpr: (expr: any) => R; 
    visitLiteralExpr: (expr: any) => R; 
    visitUnaryExpr: (expr: any) => R; 
}

export abstract class Expr{ 
    abstract accept(visitor: ExprVisitor<any>): any; 
 
    static Binary = class extends Expr{ 
        constructor( left: Expr,operator: Token,right: Expr ){ 
            super(); 
 
            this.left = left 
            this.operator = operator 
            this.right = right 
        } 
 
        accept(visitor: ExprVisitor<any>): any { 
            return visitor.visitBinaryExpr(this); 
        } 
 
        readonly left: Expr 
        readonly operator: Token 
        readonly right: Expr 
    } 

    static Grouping = class extends Expr{ 
        constructor( expression: Expr ){ 
            super(); 
 
            this.expression = expression 
        } 
 
        accept(visitor: ExprVisitor<any>): any { 
            return visitor.visitGroupingExpr(this); 
        } 
 
        readonly expression: Expr 
    } 

    static Literal = class extends Expr{ 
        constructor( value: any ){ 
            super(); 
 
            this.value = value 
        } 
 
        accept(visitor: ExprVisitor<any>): any { 
            return visitor.visitLiteralExpr(this); 
        } 
 
        readonly value: any 
    } 

    static Unary = class extends Expr{ 
        constructor( operator: Token,right: Expr ){ 
            super(); 
 
            this.operator = operator 
            this.right = right 
        } 
 
        accept(visitor: ExprVisitor<any>): any { 
            return visitor.visitUnaryExpr(this); 
        } 
 
        readonly operator: Token 
        readonly right: Expr 
    } 

} 
