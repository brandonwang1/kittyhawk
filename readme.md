# Kittyhawk

Kittyhawk is the new Kubernetes deployment YAML generator for Penn Labs (replacing Icarus).

## Getting Started
1. Write a deployment configuration for your project in the values.ts file. The currently available classes are Application and Cronjob. A sample configuration is provided in the sample-values.ts file.
2. Install the cdk8s CLI globally:

```shell
$ npm install -g cdk8s-cli
```
3. Compile and synthesize the Kubernetes YAML using the command below. It it saved at dist/kittyhawk.k8s.yaml. 

```shell
$ npm run synth
```