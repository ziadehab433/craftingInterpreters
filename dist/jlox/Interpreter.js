import { Lox } from "./Lox.js";
import { TokenType } from "./TokenType.js";
import { RuntimeError } from "./RuntimeError.js";
export class Interpreter {
    interpret(statements) {
        try {
            for (let i = 0; i < statements.length; i++) {
                this.execute(statements[i]);
            }
        }
        catch (e) {
            Lox.runtimeError(e);
        }
    }
    execute(stmt) {
        return stmt.accept(this);
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression);
    }
    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        console.log(this.stringify(value));
    }
    visitBinaryExpr(expr) {
        let left = this.evaluate(expr.left);
        let right = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.PLUS:
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }
                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
                break;
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
        }
        return null;
    }
    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }
    visitLiteralExpr(expr) {
        return expr.value;
    }
    visitUnaryExpr(expr) {
        let right = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -right;
            case TokenType.BANG:
                return !this.isTruthy(right);
        }
    }
    isTruthy(value) {
        if (value == null)
            return false;
        if (typeof value === "boolean")
            return value;
        return true;
    }
    isEqual(a, b) {
        if (a == null && b == null)
            return true;
        if (a == null)
            return false;
        return a == b;
    }
    checkNumberOperand(operator, operand) {
        if (typeof operand === "number")
            return;
        throw new RuntimeError(operator, "Operand must be a number");
    }
    checkNumberOperands(operator, loperand, roperand) {
        if (typeof loperand === "number" && typeof roperand === "number")
            return;
        throw new RuntimeError(operator, "Operands must be numbers");
    }
    stringify(value) {
        if (value == null)
            return "nil";
        // don't need the toString thing it already is a value
        return value;
    }
}
