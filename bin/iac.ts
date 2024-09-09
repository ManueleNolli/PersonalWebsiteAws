#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {NextjsStack} from "../lib/nextjsStack";

const app = new cdk.App();

const stack = new NextjsStack(app, 'NextjsStack');
cdk.Tags.of(stack).add('project', 'portfolio');


