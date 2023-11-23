import { StackProps } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import path = require('path')

export class TodoBackend extends Construct {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id)

    const todosTable = new dynamodb.Table(this, 'TodoDatabase', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    })

    // CRUD Functions

    const createTodoFunction = new lambdaNodeJS.NodejsFunction(
      this,
      'CreateTodoFunction',
      {
        entry: path.join(__dirname, '..', 'lambda', 'createTodo.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_16_X,
        architecture: lambda.Architecture.ARM_64,
        environment: {
          TABLE_NAME: todosTable.tableName,
        },
      }
    )
    const listTodosFunction = new lambdaNodeJS.NodejsFunction(
      this,
      'ListTodosFunction',
      {
        entry: path.join(__dirname, '..', 'lambda', 'listTodos.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_16_X,
        architecture: lambda.Architecture.ARM_64,
        environment: {
          TABLE_NAME: todosTable.tableName,
        },
      }
    )
    const deleteTodoFunction = new lambdaNodeJS.NodejsFunction(
      this,
      'DeleteTodoFunction',
      {
        entry: path.join(__dirname, '..', 'lambda', 'deleteTodo.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_16_X,
        architecture: lambda.Architecture.ARM_64,
        environment: {
          TABLE_NAME: todosTable.tableName,
        },
      }
    )

    // Table Access for Lambdas
    todosTable.grantReadData(listTodosFunction)
    todosTable.grantReadWriteData(createTodoFunction)
    todosTable.grantReadWriteData(deleteTodoFunction)

    // API Gateway
    const todoServiceApi = new apigw.RestApi(this, 'Endpoint', {
      restApiName: 'Todo Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    })

    const todos = todoServiceApi.root.addResource('todos')

    todos.addMethod('POST', new apigw.LambdaIntegration(createTodoFunction))
    todos.addMethod('GET', new apigw.LambdaIntegration(listTodosFunction))
    todos.addMethod('DELETE', new apigw.LambdaIntegration(deleteTodoFunction))
  }
}
