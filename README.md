# Personal Website CDK Infrastructure

This project contains the *Infrastructure as Code* for my [Personal Website](https://github.com/ManueleNolli/PersonalWebsite) https://www.manuelenolli.ch using the [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/).


## Requirements

* node: 20.16.0
* yarn: 1.22.22

## Installation and Usage

```bash
yarn install
```

```bash
yarn deploy:first # will create the S3 buckets
```

Once NextJS is built and pushed to the S3 bucket (Just execute the Github action), you can deploy the rest:
```bash
yarn deploy
```

## AWS Infrastructure

The website is hosted on AWS using the following services:
* [Amazon S3](https://aws.amazon.com/s3/): Static website hosting
* [AWS Lambda](https://aws.amazon.com/lambda/): Serverless functions (Yes, NextJs Server Side Rendering on AWS Lambda 😄)
* [Amazon API Gateway](https://aws.amazon.com/api-gateway/): API management
* [Amazon CloudFront](https://aws.amazon.com/cloudfront/): Content delivery network
* [Amazon Route 53](https://aws.amazon.com/route53/)*: Domain name management
* [Amazon Certificate Manager](https://aws.amazon.com/certificate-manager/)*: SSL certificates
* [Amazon WAF](https://aws.amazon.com/waf/)*: Web application firewall

\* These services are not implemented in this project, the CDK stack creates until the CloudFront distribution, this is because the additional services are customisable and I added them manually.I personally followed this [Developer Guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html).



The AWS Infrastructure can be seen in the following diagram:
<img alt="AWS Infrastructure" src="https://github.com/ManueleNolli/PersonalWebsite/blob/main/.github/assets/aws_diagram.png"/>

## Must do manually

As mentioned above, some services are not implemented in this project, if you want to deploy the infrastructure as I did, you need to follow these steps:
1. Create your domain in Route 53 as an Hosted Zone (you should configure the NS records in your domain provider)
2. Create a certificate in ACM for your domain (you should validate the certificate by adding a CNAME record in Route 53)
3. Enable WAF in CloudFront and configure the rules as you wish
4. Configure the domain in CloudFront:
   1. Add the domain in the Alternate Domain Names (CNAMEs) field. For example `*.manuelenolli.ch` and `manuelenolli.ch`
   2. Add the certificate in the SSL Certificate field