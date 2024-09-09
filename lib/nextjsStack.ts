import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs'

type StackProps = cdk.StackProps;


export class NextjsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const staticBucketName = 'portfolio-s3-static-files';
    const staticBucket = new s3.Bucket(this, staticBucketName, {
      bucketName: staticBucketName, // Bucket name
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Used to delete the bucket when the stack is deleted
      autoDeleteObjects: true // Used to delete the objects in the bucket when the stack is deleted
    });

    const codeBucketName = 'portfolio-s3-code-files';
    const codeBucket = new s3.Bucket(this, codeBucketName, {
      bucketName: codeBucketName, // Bucket name
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Used to delete the bucket when the stack is deleted
      autoDeleteObjects: true // Used to delete the objects in the bucket when the stack is deleted
    });

    /* Lambda function  that return a Hello World message */
    const lambdaPortfolio = new lambda.Function(this, 'portfolio-lambda', {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda'), // Points to the lambda directory
        handler: 'hello.handler', // Points to the 'hello' file in the lambda directory
        environment: {
          BUCKET_NAME: staticBucket.bucketName
        }
    });

    // Define the API Gateway resource
    const api = new apigateway.LambdaRestApi(this, 'HelloWorldApi', {
      handler: lambdaPortfolio,
      proxy: false,
    });

    // Define the '/hello' resource with a GET method
    const helloResource = api.root.addResource('hello');
    helloResource.addMethod('GET');





  }
}
