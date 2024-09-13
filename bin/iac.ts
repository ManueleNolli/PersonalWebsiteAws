#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {NextjsStack} from "../lib/nextjsStack";

const app = new cdk.App();

const stackConfig = {
    isFirstDeploy: process.env.FIRST_DEPLOY === 'true',
    s3_bucket_code_name: 'portfolio-code-bucket',
    s3_bucket_assets_name: 'portfolio-static-assets-bucket',
    lambda_code_name: 'code-lambda',
    lambda_code_filename: 'code.zip',
    lambda_code_handler: 'index.handler',
    lambda_code_layer_name: 'dependencies.zip',
    apigateway_name: 'apigateway',
    apigateway_code_path: '/_server',
}

const stack = new NextjsStack(app, 'PortfolioStack', stackConfig);
cdk.Tags.of(stack).add('project', 'portfolio');


