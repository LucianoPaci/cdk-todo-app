#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTodoAppStack } from '../lib/cdk-todo-app-stack';

const app = new cdk.App();
new CdkTodoAppStack(app, 'CdkTodoAppStack');
