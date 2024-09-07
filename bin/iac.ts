#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {NextjsStack} from "../lib/nextjsStack";

const app = new cdk.App();

const stack = new NextjsStack(app, 'NextjsStack', {
  env: {
    region: 'eu-central-2',
  }
});
cdk.Tags.of(stack).add('project', 'portfolio');


