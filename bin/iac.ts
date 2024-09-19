#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {NextjsStack} from "../lib/nextjsStack";

const app = new cdk.App();

const stackConfig = {
    isFirstDeploy: process.env.FIRST_DEPLOY === 'true',
    s3_bucket_code_name: 'portfolio-code-bucket',
    s3_bucket_assets_name: 'portfolio-static-assets-bucket',
    lambda_name: 'portfolio-lambda',
    lambda_layer_name: 'portfolio-dependencies-layer',
    lambda_code_file_name: 'code.zip',
    lambda_layer_file_name: 'dependencies.zip',
    lambda_handler: 'index.handler',
    apigateway_lambda_integration_name: 'portfolio-apigateway-lambda-integration',
    apigateway_name: 'portfolio-apigateway',
    cloudfront_name: 'portfolio-cloudfront',
}

const stack = new NextjsStack(app, 'PortfolioStack', stackConfig);
cdk.Tags.of(stack).add('project', 'portfolio');


