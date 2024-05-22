import { Expr, ExprVisitor } from './Expr.js';

export class AstPrinter implements ExprVisitor<String>{
    print(expr: Expr): string{ 
        return expr.accept(this);
    }

    visitBinaryExpr(expr: any): string{ 
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitGroupingExpr(expr: any): string{ 
        return this.parenthesize("group", expr.expression);
    }

    visitLiteralExpr(expr: any): string{ 
        if(expr.value == null) return "nil";
        return expr.value.toString();
    }

    visitUnaryExpr(expr: any): string{ 
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }

    parenthesize(name: string, ...exprs: Expr[]): string{ 
        let builder: string = "";

        builder += "(" + name;
        exprs.forEach(expr => { 
            builder += ` ${expr.accept(this)}`;
        })
        builder += ")";

        return builder;
    }
}
