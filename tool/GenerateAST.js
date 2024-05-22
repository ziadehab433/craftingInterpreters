import fs from 'node:fs';

let arglen = process.argv.length;
let args = process.argv;

if(arglen != 3){ 
    console.error(new Error("thats illegal"));
}else{ 
    let outputDir = args[2];

    defineAST(outputDir, "Expr", [
        "Binary   :left Expr,operator Token,right Expr",
        "Grouping :expression Expr",
        "Literal  :value any",
        "Unary    :operator Token,right Expr"
    ]);

    defineAST(outputDir, "Stmt", [ 
        "Expression :expression Expr", 
        "Print      :expression Expr"
    ]);
}

function defineAST(outputDir, baseName, types){ 
    let path = outputDir + "/" + baseName + ".ts";
    let content = "";

    content += "import { Token } from './Token.js'; \n";

    if(baseName !== "Expr"){ 
        content += "import { Expr } from './Expr.js'; \n";
    }

    content += "\n";

    content = defineVisitor(content, baseName, types);

    content += "export abstract class " + baseName + "{ \n";

    content += `    abstract accept(visitor: ${baseName}Visitor<any>): any; \n \n`;

    types.forEach(type => { 
        let className = type.split(":")[0].trim();
        let fields = type.split(":")[1].trim();

        content = defineType(content, baseName, className, fields);
    });

    content += "} \n";

    fs.writeFile(path, content, err => { 
        if(err){ 
            console.error(new Error("skill issue (file wasn't written)"));
        }else{ 
            console.log(`${baseName}.ts was written successfully.`);
        }
    });
}

function defineVisitor(content, baseName, types){ 
    content += `export interface ${baseName}Visitor<R> { \n`;

    types.forEach(type => { 
        let typeName = type.split(":")[0].trim();

        content += `    visit${typeName}${baseName}: (${baseName.toLowerCase()}: any) => R; \n`;
    });

    content += "}\n\n"

    return content;
}

function defineType(content, baseName, className, fields){ 
    content += `    static ${className} = class extends ${baseName}{ \n`;

    content += `        constructor( ${fields.replaceAll(" ", ": ")} ){ \n`
    content += `            super(); \n \n`;

    let fieldList = fields.split(",");
    fieldList.forEach(field => { 
        let name = field.split(" ")[0].trim();

        content += `            this.${name} = ${name} \n`;
    });

    content += "        } \n \n";

    content += `        accept(visitor: ${baseName}Visitor<any>): any { \n`;
    content += `            return visitor.visit${className}${baseName}(this); \n`;
    content += "        } \n \n"

    fieldList.forEach(field => { 
        let name = field.split(" ")[0];
        let type = field.split(" ")[1];

        content += `        readonly ${name}: ${type} \n`;
    });

    content += "    } \n\n";

    return content;
}
