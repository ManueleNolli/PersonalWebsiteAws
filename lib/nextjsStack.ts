import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigin from "aws-cdk-lib/aws-cloudfront-origins";
import {Construct} from 'constructs'
import {HttpApi} from "aws-cdk-lib/aws-apigatewayv2";
import {HttpLambdaIntegration} from "aws-cdk-lib/aws-apigatewayv2-integrations";

type StackProps = cdk.StackProps & {
    isFirstDeploy: boolean,
    s3_bucket_code_name: string,
    s3_bucket_assets_name: string,
    lambda_name: string,
    lambda_layer_name: string,
    lambda_code_file_name: string,
    lambda_layer_file_name: string,
    lambda_handler: string,
    apigateway_lambda_integration_name: string,
    apigateway_name: string,
    cloudfront_name: string,
}


export class NextjsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        /********************************************************
         *********************** BUCKETS ************************
         ********************************************************/
        const codeBucket = new s3.Bucket(this, props.s3_bucket_code_name, {
            bucketName: props.s3_bucket_code_name,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Used to delete the bucket when the stack is deleted
            autoDeleteObjects: true // Used to delete the objects in the bucket when the stack is deleted
        });

        const assetsBucket = new s3.Bucket(this, props.s3_bucket_assets_name, {
            bucketName: props.s3_bucket_assets_name,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        // If it is the first deploy it is necessary to upload the zip files by the other project (via actions)
        if (props.isFirstDeploy)
            return

        /********************************************************
         *********************** LAMBDA *************************
         ********************************************************/

        const lambdaDependenciesLayer = new lambda.LayerVersion(this, props.lambda_layer_name, {
            code: lambda.Code.fromBucket(codeBucket, props.lambda_layer_file_name),
        });

        const serverLambda = new lambda.Function(this, props.lambda_name, {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromBucket(codeBucket, props.lambda_code_file_name), // This code is uploaded just once, if the code changes will need to upload it again
            layers: [lambdaDependenciesLayer],
            handler: props.lambda_handler,
            timeout: cdk.Duration.seconds(10),
        });

        /********************************************************
         *********************** API GATEWAY ********************
         ********************************************************/

        const apiGateway = new HttpApi(this, props.apigateway_name)

        // Lambda route
        apiGateway.addRoutes({
            path: '/_server/{proxy+}',
            integration: new HttpLambdaIntegration(props.apigateway_lambda_integration_name, serverLambda)
        });

        /********************************************************
         *********************** CLOUD FRONT ********************
         ********************************************************/

        const assetsOrigin = cloudfrontOrigin.S3BucketOrigin.withOriginAccessControl(assetsBucket)
        const serverOrigin = new cloudfrontOrigin.HttpOrigin(`${apiGateway.apiId}.execute-api.${this.region}.amazonaws.com`
            , {
                originPath: '/_server',
            }
        )

        const cloudFront = new cloudfront.Distribution(this, props.cloudfront_name, {
            defaultBehavior: {
                origin: serverOrigin,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
            },
            additionalBehaviors: {
                '/_next/*': {
                    origin: assetsOrigin,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
                },
                '/assets/*': {
                    origin: assetsOrigin,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
                }
            }
        });


        /********************************************************
         ********************* OUTPUTS **************************
         ********************************************************/

        new cdk.CfnOutput(this, 'CloudFrontDomain', {
            value: cloudFront.distributionDomainName,
            description: 'CloudFront Domain'
        });
    }
}
