import { APIGatewayEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'
import { createResponse } from '../utils/createResponse'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const tableName = process.env.TABLE_NAME || ''

const addTodoItem = async (data: { todo: string; id: string }) => {
  const { id, todo } = data
  if (todo && todo !== '') {
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        id: id || uuid(),
        todo,
      },
    })

    await docClient.send(command)
  }

  return todo
}

export const handler = async function (event: APIGatewayEvent) {
  try {
    const { body: requestBody } = event

    if (!requestBody) {
      return createResponse('Missing request body', 400)
    }

    const data = JSON.parse(requestBody)
    const todo = await addTodoItem(data)

    return todo
      ? createResponse(`${todo} added to the database`)
      : createResponse('Todo is Missing', 500)
  } catch (error) {
    console.log(error)
    return createResponse((error as Error).message, 500)
  }
}
