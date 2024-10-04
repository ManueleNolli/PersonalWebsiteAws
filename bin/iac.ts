#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {NextjsStack} from "../lib/nextjsStack";

const app = new cdk.App();

const stackConfig = {
    isFirstDeploy: process.env.FIRST_DEPLOY === 'true', // It will create only the buckets
    isMailService: process.env.MAIL_SERVICE === 'true', // It will create lambda for mail service
    isGithubFetchService: process.env.GITHUB_FETCH_SERVICE === 'true', // It will create lambda for github fetch service
    /* S3 Buckets */
    s3_bucket_code_name: 'portfolio-code-bucket',
    s3_bucket_assets_name: 'portfolio-static-assets-bucket',
    /* Lambda Serveless with NextJS */
    lambda_serverless_name: 'portfolio-serverless-lambda',
    lambda_serverless_layer_name: 'portfolio-serverless-dependencies-layer',
    lambda_serverless_code_file_name: 'codeServerless.zip',
    lambda_serverless_layer_file_name: 'dependenciesServerless.zip',
    lambda_serverless_handler: 'index.handler',
    /* Lambda Mail with SES */
    lambda_mail_name: 'portfolio-mail-lambda',
    lambda_mail_layer_name: 'portfolio-mail-dependencies-layer',
    lambda_mail_code_file_name: 'codeMail.zip',
    lambda_mail_layer_file_name: 'dependenciesMail.zip',
    lambda_mail_handler: 'index.handler',
    apigateway_lambda_integration_name: 'portfolio-apigateway-lambda-integration',

    /* API Gateway */
    apigateway_name: 'portfolio-apigateway',
    cloudfront_name: 'portfolio-cloudfront',
}

const stack = new NextjsStack(app, 'PortfolioStack', stackConfig);
cdk.Tags.of(stack).add('project', 'portfolio');


