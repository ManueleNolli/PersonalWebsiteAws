import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs'
import {HttpApi} from "aws-cdk-lib/aws-apigatewayv2";
import {handler, name, optimizerCodePath, optimizerLayerPath, version} from '@sladg/imaginex-lambda'

type StackProps = cdk.StackProps & {
    isFirstDeploy: boolean,
    s3_bucket_code_name: string,
    s3_bucket_assets_name: string,
    lambda_code_name: string,
    lambda_code_filename: string,
    lambda_code_handler: string,
    lambda_code_layer_name: string,
    apigateway_name: string,
    apigateway_code_path: string,
}


export class NextjsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

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

        // Code Lambda
        const codeDependenciesLayer = new lambda.LayerVersion(this, 'portfolio-dependencies-layer', {
            code: lambda.Code.fromBucket(codeBucket, props.lambda_code_layer_name),
        });

        const codeLambda = new lambda.Function(this, props.lambda_code_name, {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromBucket(codeBucket, props.lambda_code_filename), // This code is uploaded just once, if the code changes will need to upload it again
            layers: [codeDependenciesLayer],
            handler: props.lambda_code_handler,
            timeout: cdk.Duration.seconds(10),
        });

        // Assets Optimization
        const layerPath = optimizerCodePath
        const lambdaHash = `${name}_${version}`
        const assetsOptimizationDependencyLayer = new lambda.LayerVersion(this, 'portfolio-assets-optimization-dependencies-layer', {
            code: lambda.Code.fromAsset(layerPath, {
                assetHash: lambdaHash + '_layer',
                assetHashType: cdk.AssetHashType.CUSTOM,
            }),
        })

        const assetsOptimizerCodePath = optimizerLayerPath
        const assetsOptimizationLambda = new lambda.Function(this, 'portfolio-assets-optimization', {
            code: lambda.Code.fromAsset(assetsOptimizerCodePath, {
                assetHash: lambdaHash + '_code',
                assetHashType: cdk.AssetHashType.CUSTOM,
            }),
            // @NOTE: Make sure to keep python3.8 as binaries seems to be messed for other versions.
            runtime: lambda.Runtime.PYTHON_3_8,
            handler: handler,
            memorySize: 512,
            timeout: cdk.Duration.seconds(10),
            layers: [assetsOptimizationDependencyLayer],
            environment: {
                S3_BUCKET_NAME: assetsBucket.bucketName,
            },
        });

        assetsBucket.grantRead(assetsOptimizationLambda);

        // Api Gateway
        const apiGateway = new HttpApi(this, props.apigateway_name)

        // Code Lambda route
        apiGateway.addRoutes({
            path: `${props.apigateway_code_path}/{proxy+}`,
            integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('CodeLambdaApiGatewayIntegration', codeLambda)
        });

        // Assets Optimization route
        const imageBasePath = '/_image'
        apiGateway.addRoutes({path: `${imageBasePath}/{proxy+}`, integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('ImagesApigwIntegration', assetsOptimizationLambda)})

    }
}
