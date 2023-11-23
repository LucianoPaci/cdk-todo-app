import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { createResponse } from '../utils/createResponse'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const tableName = process.env.TABLE_NAME || ''

const getAllTodos = async () => {
  const command = new ScanCommand({
    TableName: tableName,
  })

  const scanResult = await docClient.send(command)
  return scanResult
}

export const handler = async function () {
  try {
    const response = await getAllTodos()

    return createResponse(response.Items || [])
  } catch (error) {
    console.log(error)
    return createResponse((error as Error).message, 500)
  }
}
