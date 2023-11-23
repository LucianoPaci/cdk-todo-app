import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { TodoBackend } from './todo-backend'
import { Website } from '@symphoniacloud/cdk-website'

export class CdkTodoAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const todoBackend = new TodoBackend(this, 'TodoBackend', {})

    const website = new Website(this, 'website', {
      content: {
        path: 'frontend/build',
        performCacheInvalidation: true,
      },
    })
  }
}
