import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs'

type StackProps = cdk.StackProps;


export class NextjsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'portfolio-s3-bucket-static-files', {
      bucketName: 'portfolio-s3-bucket-static-files', // Bucket name
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Used to delete the bucket when the stack is deleted
      autoDeleteObjects: true // Used to delete the objects in the bucket when the stack is deleted
    });
  }
}
